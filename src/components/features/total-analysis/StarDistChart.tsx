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
          <CardTitle className="text-lg">성급 분포</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-[300px] text-muted-foreground">
            데이터가 없습니다.
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center justify-between">
          <span>성급 분포</span>
          <span className="text-sm font-normal text-muted-foreground">
            {latestRaidName} 기준
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[280px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={2}
                dataKey="value"
                label={({ name, value, cx, cy, midAngle, outerRadius }) => {
                  // 5% 미만은 레이블 표시하지 않음
                  if (value < 5) return null;
                  const RADIAN = Math.PI / 180;
                  const radius = outerRadius + 25;
                  const x = cx + radius * Math.cos(-midAngle * RADIAN);
                  const y = cy + radius * Math.sin(-midAngle * RADIAN);
                  return (
                    <text
                      x={x}
                      y={y}
                      fill="currentColor"
                      textAnchor={x > cx ? "start" : "end"}
                      dominantBaseline="central"
                      className="text-xs"
                    >
                      {`${name} ${value}%`}
                    </text>
                  );
                }}
                labelLine={({ cx, cy, midAngle, outerRadius, percent }) => {
                  const RADIAN = Math.PI / 180;
                  const innerPoint = {
                    x: cx + outerRadius * Math.cos(-midAngle * RADIAN),
                    y: cy + outerRadius * Math.sin(-midAngle * RADIAN),
                  };
                  const outerPoint = {
                    x: cx + (outerRadius + 20) * Math.cos(-midAngle * RADIAN),
                    y: cy + (outerRadius + 20) * Math.sin(-midAngle * RADIAN),
                  };
                  // 5% 미만은 라인도 표시하지 않음
                  if (percent * 100 < 5) {
                    return <path d="" />;
                  }
                  return (
                    <path
                      d={`M${innerPoint.x},${innerPoint.y}L${outerPoint.x},${outerPoint.y}`}
                      stroke="currentColor"
                      strokeWidth={1}
                      fill="none"
                      className="text-muted-foreground"
                    />
                  );
                }}
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
                  if (!active || !payload || payload.length === 0) return null;
                  const data = payload[0].payload;
                  return (
                    <div className="bg-popover border border-border rounded-lg shadow-lg p-3 text-sm">
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

        {/* Legend */}
        <div className="flex flex-wrap justify-center gap-4 mt-2">
          {chartData.map((entry) => (
            <div key={entry.name} className="flex items-center gap-1.5">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: STAR_COLORS[entry.name] || "#888" }}
              />
              <span className="text-xs">{entry.name}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
