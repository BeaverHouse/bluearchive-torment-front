"use client";

import { useMemo } from "react";
import { CharacterAnalysis, RaidAnalysis } from "@/types/total-analysis";
import { categorizeAssault } from "@/utils/total-analysis";
import { useRaids } from "@/hooks/use-raids";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface UsageHeatmapProps {
  characterData: CharacterAnalysis;
  raidAnalyses: RaidAnalysis[];
}

// 가로축: 대결전 속성 4개 + 총력전 + LUNATIC
const COLUMN_TYPES = ["폭발", "관통", "신비", "진동", "총력전", "LUNATIC"];

// 대결전 보스 (폭발/관통/신비/진동 속성 있음)
const RAID_BOSSES = ["비나", "헤세드", "시로쿠로", "예로니무스", "카이텐"];

// 총력전 보스 (총력전 + LUNATIC 있음)
const ASSAULT_BOSSES = [
  "페로로지라",
  "호드",
  "고즈",
  "호버크래프트",
  "그레고리오",
  "쿠로카게",
  "게부라",
  "예소드",
];

export function UsageHeatmap({
  characterData,
  raidAnalyses,
}: UsageHeatmapProps) {
  const { raids } = useRaids();

  // lunaticClearCount 맵 생성
  const lunaticClearMap = useMemo(() => {
    const map = new Map<string, number>();
    raidAnalyses.forEach((ra) => {
      map.set(ra.raidId, ra.lunaticClearCount);
    });
    return map;
  }, [raidAnalyses]);

  // 그리드 데이터 생성
  const gridData = useMemo(() => {
    const map = new Map<
      string,
      {
        userCount: number;
        lunaticUserCount: number;
        raidId: string;
        raidName: string;
      }
    >();

    characterData.usageHistory.forEach((history) => {
      const { boss, subcategory } = categorizeAssault(raids, history.raidId);
      if (!boss || !subcategory) return;

      const raidInfo = raids.find((r) => r.id === history.raidId);
      const raidName = raidInfo?.name || history.raidId;

      // 대결전인지 총력전인지 구분
      const isRaid = history.raidId.startsWith("3S");

      if (isRaid) {
        // 대결전: 폭발/관통/신비/진동
        const key = `${boss}-${subcategory}`;
        map.set(key, {
          userCount: history.userCount,
          lunaticUserCount: history.lunaticUserCount,
          raidId: history.raidId,
          raidName,
        });
      } else {
        // 총력전: 총력전 열과 LUNATIC 열 모두에 사용
        const keyAssault = `${boss}-총력전`;
        const keyLunatic = `${boss}-LUNATIC`;

        map.set(keyAssault, {
          userCount: history.userCount,
          lunaticUserCount: history.lunaticUserCount,
          raidId: history.raidId,
          raidName,
        });
        map.set(keyLunatic, {
          userCount: history.userCount,
          lunaticUserCount: history.lunaticUserCount,
          raidId: history.raidId,
          raidName,
        });
      }
    });

    return map;
  }, [characterData, raids]);

  // 유효한 셀 확인
  const validCells = useMemo(() => {
    const set = new Set<string>();

    // 대결전 보스는 폭발/관통/신비/진동만 유효
    RAID_BOSSES.forEach((boss) => {
      ["폭발", "관통", "신비", "진동"].forEach((type) => {
        // 실제로 존재하는 조합인지 확인
        const exists = raids.some((r) => {
          const { boss: b, subcategory } = categorizeAssault(raids, r.id);
          return b === boss && subcategory === type;
        });
        if (exists) set.add(`${boss}-${type}`);
      });
    });

    // 총력전 보스는 총력전/LUNATIC만 유효
    ASSAULT_BOSSES.forEach((boss) => {
      const exists = raids.some((r) => {
        const { boss: b } = categorizeAssault(raids, r.id);
        return b === boss && !r.id.startsWith("3S");
      });
      if (exists) {
        set.add(`${boss}-총력전`);
        set.add(`${boss}-LUNATIC`);
      }
    });

    return set;
  }, [raids]);

  // 퍼센트 계산
  const getPercent = (
    boss: string,
    colType: string,
    data:
      | {
          userCount: number;
          lunaticUserCount: number;
          raidId: string;
        }
      | undefined
  ) => {
    if (!data) return 0;

    if (colType === "LUNATIC") {
      // LUNATIC: lunaticUserCount / lunaticClearCount
      const clearCount = lunaticClearMap.get(data.raidId) || 1;
      return (data.lunaticUserCount / clearCount) * 100;
    } else {
      // 대결전 또는 총력전: userCount / 20000
      return (data.userCount / 20000) * 100;
    }
  };

  // 퍼센트 기준으로 색상 결정
  const getColor = (percent: number, isValid: boolean) => {
    if (!isValid) return "bg-gray-100 dark:bg-gray-800 opacity-20";
    if (percent === 0) return "bg-muted";
    if (percent < 1) return "bg-green-100 dark:bg-green-950";
    if (percent < 10) return "bg-green-200 dark:bg-green-900";
    if (percent < 30) return "bg-green-300 dark:bg-green-700";
    if (percent < 50) return "bg-green-400 dark:bg-green-600";
    if (percent < 90) return "bg-green-500 dark:bg-green-500";
    return "bg-green-700 dark:bg-green-400";
  };

  const LEGEND_ITEMS = [
    { label: "~1%", className: "bg-green-100 dark:bg-green-950" },
    { label: "1~10%", className: "bg-green-200 dark:bg-green-900" },
    { label: "10~30%", className: "bg-green-300 dark:bg-green-700" },
    { label: "30~50%", className: "bg-green-400 dark:bg-green-600" },
    { label: "50~90%", className: "bg-green-500 dark:bg-green-500" },
    { label: "90%~", className: "bg-green-700 dark:bg-green-400" },
  ];

  const ALL_BOSSES = [...RAID_BOSSES, ...ASSAULT_BOSSES];

  return (
    <Card className="max-w-full overflow-hidden">
      <CardHeader className="pb-1 px-2 sm:px-3">
        <CardTitle className="text-sm sm:text-base">
          공격타입/보스별 사용 현황
        </CardTitle>
      </CardHeader>
      <CardContent className="px-2 sm:px-3 py-0">
        <div className="overflow-x-auto pb-2">
          <div className="min-w-0 sm:min-w-[580px]">
            <div className="flex mb-2">
              <div className="w-[45px] sm:w-[90px]" />
              {COLUMN_TYPES.map((type) => (
                <div
                  key={type}
                  className="w-[42px] sm:w-[72px] text-center text-[8px] sm:text-xs font-semibold"
                >
                  {type}
                </div>
              ))}
            </div>

            {/* Grid Rows */}
            <div className="flex flex-col gap-0.5">
              {ALL_BOSSES.map((boss) => (
                <div key={boss} className="flex items-center">
                  <div className="w-[45px] sm:w-[90px] text-[8px] sm:text-xs font-medium pr-0.5 sm:pr-2 text-right truncate">
                    {boss}
                  </div>
                  {COLUMN_TYPES.map((colType) => {
                    const key = `${boss}-${colType}`;
                    const isValid = validCells.has(key);
                    const data = gridData.get(key);
                    const percent = getPercent(boss, colType, data);

                    return (
                      <TooltipProvider key={colType}>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div
                              className={`w-[38px] sm:w-[68px] h-4 sm:h-7 m-0.5 rounded-sm transition-colors ${getColor(
                                percent,
                                isValid
                              )} ${
                                isValid
                                  ? "hover:ring-2 ring-primary cursor-pointer"
                                  : "cursor-default"
                              }`}
                            />
                          </TooltipTrigger>
                          {isValid && data && (
                            <TooltipContent>
                              <p className="font-medium">
                                {boss} {colType}
                              </p>
                              {colType === "LUNATIC" ? (
                                <>
                                  <p>
                                    사용수:{" "}
                                    {data.lunaticUserCount.toLocaleString()}
                                  </p>
                                  <p>
                                    클리어수:{" "}
                                    {(
                                      lunaticClearMap.get(data.raidId) || 0
                                    ).toLocaleString()}
                                  </p>
                                </>
                              ) : (
                                <p>사용수: {data.userCount.toLocaleString()}</p>
                              )}
                              <p>사용률: {percent.toFixed(1)}%</p>
                              <p className="text-xs text-muted-foreground mt-1">
                                {data.raidName.replace(
                                  /^(총력전|대결전)\s+/,
                                  ""
                                )}
                              </p>
                            </TooltipContent>
                          )}
                        </Tooltip>
                      </TooltipProvider>
                    );
                  })}
                </div>
              ))}
            </div>

            {/* Legend */}
            <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 mt-3 pt-3 border-t">
              <span className="text-[10px] sm:text-[11px] text-muted-foreground">
                사용률:
              </span>
              {LEGEND_ITEMS.map((item) => (
                <div key={item.label} className="flex items-center gap-0.5">
                  <div className={`w-2.5 h-2.5 rounded-sm ${item.className}`} />
                  <span className="text-[9px] sm:text-[10px]">
                    {item.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
