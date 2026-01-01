"use client";

import { useMemo } from "react";
import { TotalAnalysisData } from "@/types/total-analysis";
import { categorizeAssault } from "@/utils/total-analysis";
import { useRaids } from "@/hooks/use-raids";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface LunaticClearChartProps {
  data: TotalAnalysisData;
}

export function LunaticClearChart({ data }: LunaticClearChartProps) {
  const { raids } = useRaids();

  const chartData = useMemo(() => {
    return data.raidAnalyses
      .filter((raid) => raid.raidId.startsWith("S"))
      .map((raid) => {
        const { boss } = categorizeAssault(raids, raid.raidId);
        // S82 형식으로 시즌 번호 추출 (-0 같은 서브넘버 제거)
        const seasonNum = raid.raidId.replace("S", "").split("-")[0];
        const displayName = boss ? `S${seasonNum} ${boss}` : raid.raidId;
        return {
          name: displayName,
          count: raid.lunaticClearCount,
          raidId: raid.raidId,
        };
      })
  }, [data, raids]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>LUNATIC 클리어 카운트 추이</CardTitle>
      </CardHeader>
      <CardContent className="h-[400px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={chartData}
            margin={{
              top: 10,
              right: 30,
              left: 20,
              bottom: 5,
            }}
          >
            <defs>
              <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="hsl(var(--primary))"
                  stopOpacity={0.4}
                />
                <stop
                  offset="95%"
                  stopColor="hsl(var(--primary))"
                  stopOpacity={0.05}
                />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis
              dataKey="name"
              tick={{ fontSize: 11 }}
              interval={0}
              angle={-45}
              textAnchor="end"
              height={80}
            />
            <YAxis tick={{ fontSize: 12 }} />
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(var(--popover))",
                borderColor: "hsl(var(--border))",
                color: "hsl(var(--popover-foreground))",
                borderRadius: "8px",
              }}
              itemStyle={{ color: "hsl(var(--primary))" }}
              labelStyle={{ fontWeight: 600 }}
              cursor={{
                stroke: "hsl(var(--muted-foreground))",
                strokeWidth: 1,
              }}
            />
            <Area
              type="monotone"
              dataKey="count"
              stroke="hsl(var(--primary))"
              strokeWidth={2}
              fill="url(#colorCount)"
              name="클리어 수"
              dot={{ fill: "hsl(var(--primary))", r: 3, strokeWidth: 0 }}
              activeDot={{ r: 5, fill: "hsl(var(--primary))" }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
