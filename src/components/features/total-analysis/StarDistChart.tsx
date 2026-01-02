"use client";

import { useMemo } from "react";
import { CharacterAnalysis } from "@/types/total-analysis";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { categoryMap } from "@/constants/assault";

interface StarDistChartProps {
  characterData: CharacterAnalysis;
}

// 성급별 색상
const STAR_COLORS: Record<string, string> = {
  "3성": "#dc2626",
  "4성": "#ea580c",
  "5성": "#ca8a04",
  전1: "#65a30d",
  전2: "#16a34a",
  전3: "#0d9488",
  전4: "#2563eb",
};

// 성급 순서 정의
const STAR_ORDER = ["3성", "4성", "5성", "전1", "전2", "전3", "전4"];

export function StarDistChart({ characterData }: StarDistChartProps) {
  const { chartData, latestRaidName } = useMemo(() => {
    if (!characterData.starDistribution) {
      return { chartData: [], latestRaidName: "" };
    }

    const starDist = characterData.starDistribution;

    // raidId가 없으면 빈 데이터 반환
    if (!starDist.raidId) {
      return { chartData: [], latestRaidName: "" };
    }

    // raidId 형식: S80 (총력전), 3S26 (대결전)
    let raidName: string;
    if (starDist.raidId.startsWith("3S")) {
      const num = starDist.raidId.replace("3S", "");
      raidName = `대결전 S${num}`;
    } else {
      raidName = `총력전 ${starDist.raidId}`;
    }

    // 합계 계산
    let total = 0;
    Object.values(starDist.distribution).forEach((count) => {
      total += count;
    });

    // 파이 차트 데이터 생성
    const data = Object.entries(starDist.distribution)
      .map(([key, count]) => {
        const label = categoryMap[key] || key;
        const percent = total > 0 ? (count / total) * 100 : 0;
        return {
          name: label,
          value: Math.round(percent * 10) / 10,
          count,
        };
      })
      .filter((d) => d.value > 0)
      .sort((a, b) => {
        const aIdx = STAR_ORDER.indexOf(a.name);
        const bIdx = STAR_ORDER.indexOf(b.name);
        return aIdx - bIdx;
      });

    return { chartData: data, latestRaidName: raidName };
  }, [characterData]);

  if (chartData.length === 0) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">성급 분포</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-[200px] text-muted-foreground">
            데이터가 없습니다.
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="md:flex-1 flex flex-col max-w-full overflow-hidden">
      <CardHeader className="pb-1 px-3">
        <CardTitle className="text-sm flex items-center justify-between">
          <span>성급 분포</span>
          <span className="text-xs font-normal text-muted-foreground">
            {latestRaidName} 기준
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="px-3 py-0 flex-1 flex items-center justify-center">
        {/* PC: 가로 배치, 모바일: 세로 배치 */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          {/* Pie Chart - 모바일에서 크기 축소 */}
          <div className="h-[140px] w-[140px] sm:h-[180px] sm:w-[180px] flex-shrink-0 mx-auto sm:mx-0">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={42}
                  outerRadius={72}
                  paddingAngle={2}
                  dataKey="value"
                  label={false}
                  labelLine={false}
                >
                  {chartData.map((entry) => (
                    <Cell
                      key={entry.name}
                      fill={STAR_COLORS[entry.name] || "#888"}
                      stroke="transparent"
                    />
                  ))}
                </Pie>
                <Tooltip
                  content={({ active, payload }) => {
                    if (!active || !payload || payload.length === 0)
                      return null;
                    const data = payload[0].payload;
                    return (
                      <div className="bg-popover border border-border rounded-lg shadow-lg p-2 text-sm">
                        <p className="font-semibold text-popover-foreground">
                          {data.name}
                        </p>
                        <p className="text-popover-foreground">
                          {data.value}% ({data.count.toLocaleString()}명)
                        </p>
                      </div>
                    );
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Legend - 색깔과 퍼센트 붙임 */}
          <div className="flex flex-wrap sm:flex-col gap-x-4 gap-y-1.5 justify-center sm:justify-start">
            {chartData.map((entry) => (
              <div key={entry.name} className="flex items-center gap-1.5">
                <div
                  className="w-3 h-3 rounded-full flex-shrink-0"
                  style={{
                    backgroundColor: STAR_COLORS[entry.name] || "#888",
                  }}
                />
                <span className="text-xs">{entry.name}</span>
                <span className="text-xs font-medium">{entry.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
