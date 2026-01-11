"use client";

import { useState, useMemo } from "react";
import CardWrapper from "@/components/common/card-wrapper";
import { Trophy } from "lucide-react";
import { PlatinumCut } from "@/types/raid";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface PlatinumStatsProps {
  clearCount: number;
  clearPercent: number;
  platinumCuts: PlatinumCut[];
  partPlatinumCuts?: PlatinumCut[];
  // 루나틱 정보 (토먼트 탭에서 표시용)
  lunaticClearPercent?: number;
}

export function PlatinumStats({
  clearCount,
  clearPercent,
  platinumCuts,
  partPlatinumCuts,
  lunaticClearPercent,
}: PlatinumStatsProps) {
  // 사용 가능한 rank 목록
  const rankOptions = useMemo(
    () => platinumCuts.map((cut) => cut.rank).sort((a, b) => a - b),
    [platinumCuts]
  );

  // 기본값: 20000등 (있으면), 없으면 첫 번째
  const defaultRank = rankOptions.includes(20000) ? 20000 : rankOptions[0];
  const [selectedRank, setSelectedRank] = useState<number>(defaultRank);

  // 선택된 rank의 컷 데이터
  const selectedCut = platinumCuts.find((cut) => cut.rank === selectedRank);
  const selectedPartCut = partPlatinumCuts?.find(
    (cut) => cut.rank === selectedRank
  );

  const isHighClearRate = clearPercent > 50;

  return (
    <CardWrapper
      className={`border-l-4 mx-0 gap-3 ${
        isHighClearRate ? "border-l-red-500" : "border-l-sky-500"
      }`}
      icon={<Trophy className="h-5 w-5 text-sky-500" />}
      title="Platinum"
    >
      <div className="space-y-2 px-2">
        {/* 클리어 비율 */}
        <div className="grid grid-cols-[auto_1fr] items-start gap-x-4">
          <span className="text-sm text-muted-foreground leading-7">
            클리어
          </span>
          <div className="text-right">
            <div
              className={`text-lg font-bold ${
                isHighClearRate ? "text-red-600" : ""
              }`}
            >
              {Math.min(clearCount, 20000).toLocaleString()} (
              {clearPercent.toFixed(2)}%)
            </div>
            {lunaticClearPercent !== undefined && lunaticClearPercent > 0 && (
              <div className="text-xs text-muted-foreground">
                루나틱: {lunaticClearPercent.toFixed(2)}%
              </div>
            )}
          </div>
        </div>

        {/* 컷 라인 */}
        {platinumCuts.length > 0 && (
          <div className="grid grid-cols-[auto_1fr] items-start gap-x-4">
            <Select
              value={selectedRank.toString()}
              onValueChange={(value) => setSelectedRank(parseInt(value))}
            >
              <SelectTrigger className="w-[115px] h-8">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="min-w-0 w-[115px]">
                {rankOptions.map((rank) => (
                  <SelectItem key={rank} value={rank.toString()}>
                    {rank.toLocaleString()}등
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <div className="text-right">
              {selectedCut && (
                <div className="text-lg font-bold text-sky-600 dark:text-sky-400">
                  {selectedCut.score.toLocaleString()}
                </div>
              )}
              {selectedPartCut && (
                <div className="text-xs font-semibold text-amber-600 dark:text-amber-500">
                  속성: {selectedPartCut.score.toLocaleString()}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </CardWrapper>
  );
}
