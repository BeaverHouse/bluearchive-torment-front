"use client";

import { useState } from "react";
import CardWrapper from "@/components/common/card-wrapper";
import { SearchableSelect } from "@/components/features/video/searchable-select";
import { ChartNoAxesColumn } from "lucide-react";
import { categoryMap } from "@/constants/assault";
import { StudentSearchData } from "@/utils/search";

interface CharacterGrowthStatsProps {
  filters: Record<string, Record<string, number>>;
  studentsMap: Record<string, string>;
  studentSearchMap: StudentSearchData;
}

export function CharacterGrowthStats({
  filters,
  studentsMap,
  studentSearchMap,
}: CharacterGrowthStatsProps) {
  const [selectedCharacter, setSelectedCharacter] = useState<number | null>(null);

  const characterOptions = Object.keys(filters).map((key) => ({
    value: Number(key),
    label: studentsMap[key] || `Character ${key}`,
  }));

  const characterData = selectedCharacter !== null ? filters[selectedCharacter] : null;

  return (
    <CardWrapper
      icon={<ChartNoAxesColumn className="h-5 w-5 text-sky-500" />}
      title="캐릭터 성장 통계"
    >
      <div className="mb-4">
        <SearchableSelect
          options={characterOptions}
          value={selectedCharacter?.toString() || ""}
          onValueChange={(value) => setSelectedCharacter(value ? Number(value) : null)}
          placeholder="캐릭터를 선택하세요"
          className="w-full max-w-sm"
          studentSearchMap={studentSearchMap}
        />
      </div>

      {characterData && (
        <div className="space-y-4">
          {Object.entries(characterData).map(([gradeKey, count], idx) => {
            const sum = Object.values(characterData).reduce((s, c) => s + c, 0);
            const percent = (count / sum) * 100;
            const maxPercent = Math.max(
              ...Object.values(characterData).map((c) => (c / sum) * 100)
            );

            return (
              <div key={idx} className="space-y-1">
                <div className="flex justify-between items-center">
                  <span
                    className={`font-medium text-sm ${percent > 20 ? "text-red-600" : ""}`}
                  >
                    {categoryMap[gradeKey]}
                  </span>
                  <span
                    className={`text-xs ${
                      percent > 20 ? "text-red-600 font-bold" : "text-muted-foreground"
                    }`}
                  >
                    {count} ({percent.toFixed(2)}%)
                  </span>
                </div>
                <div className="relative h-4 bg-gray-200 rounded overflow-hidden">
                  <div
                    className={`absolute top-0 left-0 h-full flex items-center justify-center text-white text-xs font-medium transition-all ${
                      percent > 20 ? "bg-red-500" : "bg-sky-500"
                    }`}
                    style={{ width: `${(percent / maxPercent) * 100}%` }}
                  >
                    {percent > 5 ? `${percent.toFixed(1)}%` : ""}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </CardWrapper>
  );
}
