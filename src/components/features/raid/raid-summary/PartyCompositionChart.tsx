"use client";

import { PartyTableType } from "@/types/raid";
import CardWrapper from "@/components/common/card-wrapper";
import { Target } from "lucide-react";

interface PartyCompositionChartProps {
  data: PartyTableType[];
}

export function PartyCompositionChart({ data }: PartyCompositionChartProps) {
  if (data.length === 0) return null;

  return (
    <CardWrapper icon={<Target className="h-5 w-5 text-sky-500" />} title="파티 비율">
      <div className="space-y-4 mx-1">
        {data.map((row) => (
          <div key={row.key} className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="font-medium text-sm">{row.key.split("-")[0]}</span>
              <div className="flex gap-4 text-xs">
                <span className="flex items-center gap-1">
                  <div className="w-3 h-3 bg-sky-500 rounded"></div>
                  1PT
                </span>
                <span className="flex items-center gap-1">
                  <div className="w-3 h-3 bg-green-500 rounded"></div>
                  2PT
                </span>
                <span className="flex items-center gap-1">
                  <div className="w-3 h-3 bg-yellow-500 rounded"></div>
                  3PT
                </span>
                <span className="flex items-center gap-1">
                  <div className="w-3 h-3 bg-red-500 rounded"></div>
                  4PT+
                </span>
              </div>
            </div>
            <div className="relative h-6 bg-gray-200 rounded overflow-hidden">
              <div
                className="absolute top-0 left-0 h-full bg-sky-500 flex items-center justify-center text-white text-xs font-medium"
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
                style={{ left: `${row.one + row.two}%`, width: `${row.three}%` }}
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
    </CardWrapper>
  );
}
