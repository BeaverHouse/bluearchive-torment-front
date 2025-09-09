"use client";

import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { basePartyCounts, lunaticMinScore, translations } from "../constants";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Users,
  Trophy,
  Target,
  Copy,
  CheckCircle,
  TrendingUp,
} from "lucide-react";
import Swal from "sweetalert2";
import { VideoIcon } from "@radix-ui/react-icons";

interface RaidComponentProps {
  season: string;
  seasonDescription: string;
  studentsMap: Record<string, string>;
  level: string;
}

interface RaidSummaryData {
  clearCount: number;
  filters: Record<string, Record<string, number>>;
  assistFilters: Record<string, Record<string, number>>;
  partyCounts: Record<string, number[]>;
  top5Partys: Array<[string, number]>;
}

interface YoutubeLinkInfo {
  userId: number;
  youtubeUrl: string;
  score: number;
}

interface CharTableType {
  key: string;
  name: string;
  percent: number;
}

interface PartyTableType {
  key: string;
  one: number;
  two: number;
  three: number;
  fourOrMore: number;
}

const RaidSummary = ({
  season,
  seasonDescription,
  studentsMap,
  level,
}: RaidComponentProps) => {
  const [Character, setCharacter] = useState<number | null>(null);
  const [copiedSearchTerm, setCopiedSearchTerm] = useState(false);
  const [showAllHighUsage, setShowAllHighUsage] = useState(false);
  const [openTooltips, setOpenTooltips] = useState<Set<string>>(new Set());
  const [isTouchDevice, setIsTouchDevice] = useState(false);

  useEffect(() => {
    setIsTouchDevice("ontouchstart" in window || navigator.maxTouchPoints > 0);
  }, []);

  const getSummaryDataQuery = useQuery({
    queryKey: ["getSummaryData", season],
    queryFn: async () => {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_CDN_URL}/batorment/v3/summary/${season}.json`
        );
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return await response.json();
      } catch (error) {
        console.error("Failed to load summary data:", error);
        throw error;
      }
    },
    throwOnError: true,
  });

  const getFilterDataQuery = useQuery({
    queryKey: ["getFilterData", season, level],
    queryFn: async () => {
      try {
        const filterPath = level === "L" ? "lunatic-filter" : "filter";
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_CDN_URL}/batorment/v3/${filterPath}/${season}.json`
        );
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return await response.json();
      } catch (error) {
        console.error("Failed to load filter data:", error);
        throw error;
      }
    },
    throwOnError: true,
  });

  const getLinksQuery = useQuery({
    queryKey: ["getLinks", season],
    queryFn: async () => {
      try {
        const linksModule = await import(`../../../data/links/${season}.json`);
        return linksModule.default;
      } catch {
        return [];
      }
    },
    throwOnError: false,
  });

  useEffect(() => {
    setCharacter(null);
  }, [season]);

  const keywords = Object.keys(translations)
    .filter((key) => seasonDescription.includes(key))
    .map((key) => translations[key]);

  const searchKeyword = (
    keywords.join(" ") +
    " " +
    (level === "T" ? "TORMENT" : level === "L" ? "LUNATIC" : "")
  ).trim();

  const copySearchTerm = async () => {
    try {
      await navigator.clipboard.writeText(searchKeyword);
      setCopiedSearchTerm(true);
      setTimeout(() => setCopiedSearchTerm(false), 2000);
      Swal.fire("복사되었습니다!");
    } catch (err) {
      console.error("Failed to copy search term:", err);
    }
  };

  if (
    getSummaryDataQuery.isLoading ||
    getFilterDataQuery.isLoading ||
    getLinksQuery.isLoading
  )
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    );

  if (!getSummaryDataQuery.data || !getFilterDataQuery.data) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  const tormentSummaryData = getSummaryDataQuery.data
    .torment as RaidSummaryData;
  const lunaticSummaryData = getSummaryDataQuery.data
    .lunatic as RaidSummaryData;
  const summaryData = level === "L" ? lunaticSummaryData : tormentSummaryData;

  const filterData = getFilterDataQuery.data;

  // summary 데이터와 filter 데이터를 결합
  const data: RaidSummaryData = {
    ...summaryData,
    filters: filterData?.filters || {},
    assistFilters: filterData?.assistFilters || {},
  };

  const highUsageCharacters = Object.entries(data?.filters || {})
    .map(([id, usage]) => ({
      id,
      name: studentsMap[id] || `Character ${id}`,
      totalUsage: Object.values(usage).reduce((a, b) => a + b, 0),
      usageRate:
        (Object.values(usage).reduce((a, b) => a + b, 0) /
          (data?.clearCount || 1)) *
        100,
    }))
    .filter((char) => char.usageRate >= 10)
    .sort((a, b) => b.totalUsage - a.totalUsage);

  if (!data || data.clearCount === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24">
        <img src="/empty.webp" alt="Empty" className="h-48 w-48 mb-4" />
        <p className="text-muted-foreground text-lg">클리어 데이터가 없어요.</p>
      </div>
    );
  }

  const youtubeLinkInfos: YoutubeLinkInfo[] = (
    (getLinksQuery.data || []) as YoutubeLinkInfo[]
  ).filter((link) =>
    level === "L"
      ? link.score >= lunaticMinScore
      : link.score > 0 && link.score < lunaticMinScore
  );

  const parseParty = (partyString: string) => {
    return partyString.split("_").map((id) => ({
      id,
      name: studentsMap[id] || `캐릭터 ${id}`,
    }));
  };

  const strikerData: CharTableType[] = Object.entries(data?.filters || {})
    .filter(([key]) => key.startsWith("1"))
    .sort(
      (a, b) =>
        Object.values(b[1]).reduce((sum, cur) => sum + cur, 0) -
        Object.values(a[1]).reduce((sum, cur) => sum + cur, 0)
    )
    .map(([key, value], idx) => ({
      key: (idx + 1).toString(),
      name: studentsMap[key],
      percent: Number(
        (
          (Object.values(value).reduce((sum, cur) => sum + cur, 0) /
            (data?.clearCount || 1)) *
          100
        ).toFixed(2)
      ),
    }))
    .filter((item) => item.percent >= 1);

  const specialData: CharTableType[] = Object.entries(data?.filters || {})
    .filter(([key]) => key.startsWith("2"))
    .sort(
      (a, b) =>
        Object.values(b[1]).reduce((sum, cur) => sum + cur, 0) -
        Object.values(a[1]).reduce((sum, cur) => sum + cur, 0)
    )
    .map(([key, value], idx) => ({
      key: (idx + 1).toString(),
      name: studentsMap[key],
      percent: Number(
        (
          (Object.values(value).reduce((sum, cur) => sum + cur, 0) /
            (data?.clearCount || 1)) *
          100
        ).toFixed(2)
      ),
    }))
    .filter((item) => item.percent >= 1);

  const assistData: CharTableType[] = Object.entries(data?.assistFilters || {})
    .sort(
      (a, b) =>
        Object.values(b[1]).reduce((sum, cur) => sum + cur, 0) -
        Object.values(a[1]).reduce((sum, cur) => sum + cur, 0)
    )
    .map(([key, value], idx) => ({
      key: (idx + 1).toString(),
      name: studentsMap[key],
      percent: Number(
        (
          (Object.values(value).reduce((sum, cur) => sum + cur, 0) /
            (data?.clearCount || 1)) *
          100
        ).toFixed(2)
      ),
    }))
    .filter((item) => item.percent >= 1);

  const partyCountData: PartyTableType[] = [
    // 중복 제거를 위해 Set 사용
    ...Array.from(new Set([...basePartyCounts, data?.clearCount || 0])).filter(
      (count) =>
        count <= (data?.clearCount || 0) &&
        `in${count}` in (data?.partyCounts || {})
    ),
  ].map((count, index) => {
    const key = `in${count}`;
    const total = (data?.partyCounts?.[key] || []).reduce((a, b) => a + b, 0);
    return {
      key: `In ${count}-${index}`, // 인덱스 추가로 고유성 보장
      one: Number(
        (((data?.partyCounts?.[key]?.[0] || 0) / total) * 100).toFixed(2)
      ),
      two: Number(
        (((data?.partyCounts?.[key]?.[1] || 0) / total) * 100).toFixed(2)
      ),
      three: Number(
        (((data?.partyCounts?.[key]?.[2] || 0) / total) * 100).toFixed(2)
      ),
      fourOrMore: Number(
        (((data?.partyCounts?.[key]?.[3] || 0) / total) * 100).toFixed(2)
      ),
    };
  });

  const tormentClearPercent =
    Number(tormentSummaryData.clearCount / 20000) * 100;
  const lunaticClearPercent =
    Number(lunaticSummaryData.clearCount / 20000) * 100;
  const clearPercent =
    level === "T"
      ? tormentClearPercent + lunaticClearPercent
      : lunaticClearPercent;

  return (
    <div className="container mx-auto px-2 sm:px-4 py-4 sm:py-8 max-w-7xl">
      {/* Header with Search Term */}
      <div className="mb-6 sm:mb-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 mb-4">
          <span className="text-sm text-muted-foreground shrink-0">
            검색어:
          </span>
          <code className="px-2 py-1 bg-muted rounded text-xs sm:text-sm break-all">
            {searchKeyword}
          </code>
          <Button
            variant="outline"
            size="sm"
            onClick={copySearchTerm}
            className="flex items-center gap-1 shrink-0"
          >
            {copiedSearchTerm ? (
              <>
                <CheckCircle className="h-3 w-3" />
                <span className="hidden sm:inline">Copied!</span>
              </>
            ) : (
              <>
                <Copy className="h-3 w-3" />
                <span className="hidden sm:inline">Copy</span>
              </>
            )}
          </Button>
        </div>

        {/* Clear Rate Stats */}
        {level !== "I" && (
          <Card
            className={`border-l-4 ${
              clearPercent > 50 ? "border-l-red-500" : "border-l-blue-500"
            }`}
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Platinum 클리어 비율
              </CardTitle>
              <Trophy className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div
                className={`text-2xl font-bold ${
                  clearPercent > 50 ? "text-red-600" : ""
                }`}
              >
                {(data?.clearCount || 0).toLocaleString()} (
                {(level === "T"
                  ? tormentClearPercent
                  : lunaticClearPercent
                ).toFixed(2)}
                %)
              </div>
              {level === "T" && lunaticSummaryData.clearCount > 0 && (
                <p className="text-xs text-muted-foreground">
                  루나틱: {lunaticClearPercent.toFixed(2)}%, 총합{" "}
                  {clearPercent.toFixed(2)}%
                </p>
              )}
            </CardContent>
          </Card>
        )}
      </div>

      {highUsageCharacters.length > 0 && (
        <Card className="bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-950/20 dark:to-cyan-950/20 border-blue-200 dark:border-blue-800 mb-6">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-blue-600" />
              많이 쓰인 학생들 (10%+)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {(showAllHighUsage
                ? highUsageCharacters
                : highUsageCharacters.slice(0, 8)
              ).map((char) => (
                <Badge
                  key={char.id}
                  variant="secondary"
                  className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 font-medium"
                >
                  {char.name} ({char.usageRate.toFixed(1)}%)
                </Badge>
              ))}
              {!showAllHighUsage && highUsageCharacters.length > 8 && (
                <Badge
                  variant="outline"
                  className="cursor-pointer hover:bg-blue-50 hover:border-blue-300 dark:hover:bg-blue-950/20"
                  onClick={() => setShowAllHighUsage(true)}
                >
                  +{highUsageCharacters.length - 8} more
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Top 5 Parties */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-blue-600" />
            Top 5 파티
          </CardTitle>
          <CardDescription>
            ※ 전용무기와 배치는 고려하지 않았습니다.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-2">
          <div className="space-y-3">
            {(data?.top5Partys || []).map(([party_string, count], idx) => {
              const characters = parseParty(party_string);
              return (
                <Card key={idx} className="relative">
                  <CardContent className="px-4">
                    <div className="flex items-center justify-between mb-3">
                      <Badge variant="outline" className="font-medium">
                        #{idx + 1}위
                      </Badge>
                      <div className="text-right flex items-center gap-1">
                        <div className="text-lg font-bold text-blue-600">
                          {count.toLocaleString()}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          명 사용
                        </div>
                      </div>
                    </div>

                    <div className="space-y-3">
                      {Array.from(
                        { length: Math.ceil(characters.length / 6) },
                        (_, partyIndex) => {
                          const partyCharacters = characters.slice(
                            partyIndex * 6,
                            (partyIndex + 1) * 6
                          );
                          return (
                            <div
                              key={partyIndex}
                              className="grid grid-cols-6 gap-4 p-2 rounded border bg-muted/30 justify-items-center"
                            >
                              {partyCharacters.map((char, charIndex) => {
                                const tooltipId = `summary-${idx}-${partyIndex}-${charIndex}`;
                                const isOpen = openTooltips.has(tooltipId);

                                return (
                                  <TooltipProvider key={charIndex}>
                                    <Tooltip
                                      delayDuration={0}
                                      open={isTouchDevice ? isOpen : undefined}
                                    >
                                      <TooltipTrigger asChild>
                                        <button
                                          type="button"
                                          className="flex flex-col items-center cursor-pointer bg-transparent border-none p-0 m-0 select-none"
                                          style={{
                                            userSelect: "none",
                                            WebkitUserSelect: "none",
                                            WebkitTouchCallout: "none",
                                          }}
                                          onTouchStart={(e) => {
                                            const touch = e.touches[0];
                                            const target =
                                              e.target as HTMLElement & {
                                                touchStartX?: number;
                                                touchStartY?: number;
                                                touchStartTime?: number;
                                              };
                                            target.touchStartX = touch.clientX;
                                            target.touchStartY = touch.clientY;
                                            target.touchStartTime = Date.now();
                                          }}
                                          onTouchEnd={(e) => {
                                            const touch = e.changedTouches[0];
                                            const target =
                                              e.target as HTMLElement & {
                                                touchStartX?: number;
                                                touchStartY?: number;
                                                touchStartTime?: number;
                                              };
                                            const deltaX = Math.abs(
                                              touch.clientX -
                                                (target.touchStartX || 0)
                                            );
                                            const deltaY = Math.abs(
                                              touch.clientY -
                                                (target.touchStartY || 0)
                                            );
                                            const deltaTime =
                                              Date.now() -
                                              (target.touchStartTime || 0);

                                            // 터치 이동이 10px 미만이고 300ms 이내일 때만 탭으로 인식
                                            if (
                                              deltaX < 10 &&
                                              deltaY < 10 &&
                                              deltaTime < 300
                                            ) {
                                              e.preventDefault();
                                              const newTooltips = new Set(
                                                openTooltips
                                              );
                                              if (isOpen) {
                                                newTooltips.delete(tooltipId);
                                              } else {
                                                newTooltips.add(tooltipId);
                                              }
                                              setOpenTooltips(newTooltips);
                                            }
                                          }}
                                          onContextMenu={(e) =>
                                            e.preventDefault()
                                          }
                                        >
                                          <div className="w-12 h-12 relative">
                                            <img
                                              src={`${
                                                process.env
                                                  .NEXT_PUBLIC_CDN_URL || ""
                                              }/batorment/character/${
                                                char.id
                                              }.webp`}
                                              alt={char.name}
                                              className="w-full h-full object-cover rounded border-2 border-transparent"
                                              draggable={false}
                                            />
                                          </div>
                                        </button>
                                      </TooltipTrigger>
                                      <TooltipContent side="top" sideOffset={5}>
                                        <p>{char.name}</p>
                                      </TooltipContent>
                                    </Tooltip>
                                  </TooltipProvider>
                                );
                              })}
                              {/* 빈 슬롯 채우기 */}
                              {Array.from(
                                { length: 6 - partyCharacters.length },
                                (_, emptyIndex) => (
                                  <div
                                    key={`empty-${emptyIndex}`}
                                    className="w-12 h-12"
                                  ></div>
                                )
                              )}
                            </div>
                          );
                        }
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Party Composition Chart */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-blue-600" />
            파티 비율
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {partyCountData.map((row) => (
              <div key={row.key} className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="font-medium text-sm">
                    {row.key.split("-")[0]}
                  </span>
                  <div className="flex gap-4 text-xs">
                    <span className="flex items-center gap-1">
                      <div className="w-3 h-3 bg-blue-500 rounded"></div>
                      1파티
                    </span>
                    <span className="flex items-center gap-1">
                      <div className="w-3 h-3 bg-green-500 rounded"></div>
                      2파티
                    </span>
                    <span className="flex items-center gap-1">
                      <div className="w-3 h-3 bg-yellow-500 rounded"></div>
                      3파티
                    </span>
                    <span className="flex items-center gap-1">
                      <div className="w-3 h-3 bg-red-500 rounded"></div>
                      4파티+
                    </span>
                  </div>
                </div>
                <div className="relative h-6 bg-gray-200 rounded overflow-hidden">
                  <div
                    className="absolute top-0 left-0 h-full bg-blue-500 flex items-center justify-center text-white text-xs font-medium"
                    style={{ width: `${row.one}%` }}
                  >
                    {row.one > 5 ? `${row.one}%` : ""}
                  </div>
                  <div
                    className="absolute top-0 h-full bg-green-500 flex items-center justify-center text-white text-xs font-medium"
                    style={{ left: `${row.one}%`, width: `${row.two}%` }}
                  >
                    {row.two > 5 ? `${row.two}%` : ""}
                  </div>
                  <div
                    className="absolute top-0 h-full bg-yellow-500 flex items-center justify-center text-white text-xs font-medium"
                    style={{
                      left: `${row.one + row.two}%`,
                      width: `${row.three}%`,
                    }}
                  >
                    {row.three > 5 ? `${row.three}%` : ""}
                  </div>
                  <div
                    className="absolute top-0 h-full bg-red-500 flex items-center justify-center text-white text-xs font-medium"
                    style={{
                      left: `${row.one + row.two + row.three}%`,
                      width: `${row.fourOrMore}%`,
                    }}
                  >
                    {row.fourOrMore > 5 ? `${row.fourOrMore}%` : ""}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Character Usage Tables */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-blue-600" />
            캐릭터 사용률
          </CardTitle>
          <CardDescription>※ 1% 이상만 표시됩니다.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Mobile: Stack tables vertically, Desktop: 3 columns */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              {/* Striker Table */}
              <div className="min-w-0">
                <h4 className="font-bold mb-2 text-center text-sm sm:text-base">
                  STRIKER
                </h4>
                <div className="max-h-80 overflow-y-auto border rounded">
                  <table className="w-full text-sm">
                    <thead className="sticky top-0 bg-background">
                      <tr className="border-b">
                        <th className="text-left p-1 sm:p-2">이름</th>
                        <th className="text-right p-1 sm:p-2">사용률 (%)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {strikerData.map((char) => (
                        <tr
                          key={char.key}
                          className="border-b hover:bg-muted/50"
                        >
                          <td className="p-1 sm:p-2 truncate">{char.name}</td>
                          <td
                            className={`p-1 sm:p-2 text-right ${
                              char.percent > 90
                                ? "text-red-600 font-bold"
                                : char.percent > 20
                                ? "text-purple-600 font-bold"
                                : ""
                            }`}
                          >
                            {char.percent}%
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Special Table */}
              <div className="min-w-0">
                <h4 className="font-bold mb-2 text-center text-sm sm:text-base">
                  SPECIAL
                </h4>
                <div className="max-h-80 overflow-y-auto border rounded">
                  <table className="w-full text-sm">
                    <thead className="sticky top-0 bg-background">
                      <tr className="border-b">
                        <th className="text-left p-1 sm:p-2">이름</th>
                        <th className="text-right p-1 sm:p-2">사용률 (%)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {specialData.map((char) => (
                        <tr
                          key={char.key}
                          className="border-b hover:bg-muted/50"
                        >
                          <td className="p-1 sm:p-2 truncate">{char.name}</td>
                          <td
                            className={`p-1 sm:p-2 text-right ${
                              char.percent > 90
                                ? "text-red-600 font-bold"
                                : char.percent > 20
                                ? "text-purple-600 font-bold"
                                : ""
                            }`}
                          >
                            {char.percent}%
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Assist Table */}
              <div className="min-w-0">
                <h4 className="font-bold mb-2 text-center text-sm sm:text-base">
                  조력자
                </h4>
                <div className="max-h-80 overflow-y-auto border rounded">
                  <table className="w-full text-sm">
                    <thead className="sticky top-0 bg-background">
                      <tr className="border-b">
                        <th className="text-left p-1 sm:p-2">이름</th>
                        <th className="text-right p-1 sm:p-2">사용률 (%)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {assistData.map((char) => (
                        <tr
                          key={char.key}
                          className="border-b hover:bg-muted/50"
                        >
                          <td className="p-1 sm:p-2 truncate">{char.name}</td>
                          <td
                            className={`p-1 sm:p-2 text-right ${
                              char.percent > 90
                                ? "text-red-600 font-bold"
                                : char.percent > 20
                                ? "text-purple-600 font-bold"
                                : ""
                            }`}
                          >
                            {char.percent}%
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Character Growth Stats */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-blue-600" />
            캐릭터 성장 통계
          </CardTitle>
        </CardHeader>
        <CardContent>
          <select
            className="w-full max-w-sm p-2 border rounded mb-4 text-sm"
            value={Character || ""}
            onChange={(e) =>
              setCharacter(e.target.value ? Number(e.target.value) : null)
            }
          >
            <option value="">캐릭터를 선택하세요</option>
            {Object.keys(data?.filters || {}).map((key) => (
              <option key={key} value={key}>
                {studentsMap[key]}
              </option>
            ))}
          </select>

          {Character !== null && data?.filters?.[Character] && (
            <div className="space-y-4">
              {Object.entries(data?.filters?.[Character] || {}).map(
                ([levelKey, count], idx) => {
                  const sum = Object.values(
                    data?.filters?.[Character] || {}
                  ).reduce((sum, cur) => sum + cur, 0);
                  const percent = (count / sum) * 100;
                  const maxPercent = Math.max(
                    ...Object.values(data?.filters?.[Character] || {}).map(
                      (c) => (c / sum) * 100
                    )
                  );
                  const starLevel = parseInt(levelKey[0]);
                  const weaponLevel = parseInt(levelKey[1]);
                  return (
                    <div key={idx} className="space-y-1">
                      <div className="flex justify-between items-center">
                        <span
                          className={`font-medium text-sm ${
                            percent > 20 ? "text-red-600" : ""
                          }`}
                        >
                          {starLevel}★ 무기{weaponLevel}
                        </span>
                        <span
                          className={`text-xs ${
                            percent > 20
                              ? "text-red-600 font-bold"
                              : "text-muted-foreground"
                          }`}
                        >
                          {count} ({percent.toFixed(2)}%)
                        </span>
                      </div>
                      <div className="relative h-4 bg-gray-200 rounded overflow-hidden">
                        <div
                          className={`absolute top-0 left-0 h-full flex items-center justify-center text-white text-xs font-medium transition-all ${
                            percent > 20 ? "bg-red-500" : "bg-blue-500"
                          }`}
                          style={{ width: `${(percent / maxPercent) * 100}%` }}
                        >
                          {percent > 5 ? `${percent.toFixed(1)}%` : ""}
                        </div>
                      </div>
                    </div>
                  );
                }
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Strategy Videos */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <VideoIcon className="h-5 w-5 text-blue-600" />
            공략 영상
          </CardTitle>
          <CardDescription>※ 최대 10개까지 표시됩니다.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {youtubeLinkInfos.slice(0, 10).map((linkInfo, idx) => (
              <div className="aspect-video w-full max-w-4xl mx-auto" key={idx}>
                <iframe
                  width="100%"
                  height="100%"
                  src={linkInfo.youtubeUrl}
                  allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  title="Embedded youtube"
                  className="rounded border w-full h-full"
                />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default RaidSummary;
