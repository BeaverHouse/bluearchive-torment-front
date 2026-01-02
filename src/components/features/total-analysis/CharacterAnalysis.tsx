"use client";

import { useState, useMemo } from "react";
import { TotalAnalysisData } from "@/types/total-analysis";
import { SearchableSelect } from "@/components/features/video/searchable-select";
import { useStudentMaps } from "@/hooks/use-student-maps";
import { StarDistChart } from "./StarDistChart";
import { UsageHeatmap } from "./UsageHeatmap";
import { StudentImage } from "@/components/features/student/student-image";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface CharacterAnalysisProps {
  data: TotalAnalysisData;
}

export function CharacterAnalysis({ data }: CharacterAnalysisProps) {
  const { studentsMap, studentSearchMap } = useStudentMaps();
  const [selectedStudentId, setSelectedStudentId] = useState<string>("");

  const isLoaded = Object.keys(studentsMap).length > 0;

  const characterOptions = useMemo(() => {
    if (!isLoaded) return [];
    return data.characterAnalyses
      .map((char) => ({
        value: char.studentId,
        label:
          studentsMap[char.studentId.toString()] || `학생 ${char.studentId}`,
      }))
      .sort((a, b) => a.label.localeCompare(b.label, "ko"));
  }, [data.characterAnalyses, studentsMap, isLoaded]);

  const selectedCharData = useMemo(() => {
    if (!selectedStudentId) return null;
    return data.characterAnalyses.find(
      (c) => c.studentId.toString() === selectedStudentId
    );
  }, [data.characterAnalyses, selectedStudentId]);

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center justify-between">
        <h2 className="text-xl sm:text-2xl font-bold tracking-tight">
          캐릭터 상세 분석
        </h2>
        <SearchableSelect
          options={characterOptions}
          value={selectedStudentId}
          onValueChange={setSelectedStudentId}
          placeholder={isLoaded ? "학생을 선택하세요" : "로딩 중..."}
          className="w-full sm:w-[200px]"
          studentSearchMap={studentSearchMap}
          disabled={!isLoaded}
        />
      </div>

      {selectedCharData ? (
        <div className="flex flex-col md:grid md:grid-cols-[1fr_auto] gap-3 items-stretch max-w-full overflow-hidden">
          {/* Left Column: Info + Synergy + Pie Chart */}
          <div className="flex flex-col gap-2 min-w-0 max-w-full overflow-hidden">
            {/* Character Info + Stats */}
            <Card className="max-w-full overflow-hidden">
              <CardContent className="px-3 py-0 max-w-full overflow-hidden">
                <div className="flex items-center gap-3">
                  <div className="flex-shrink-0">
                    <StudentImage code={selectedCharData.studentId} size={48} />
                  </div>
                  <div className="min-w-0">
                    <div className="font-semibold text-base truncate">
                      {studentsMap[selectedCharData.studentId.toString()] ||
                        selectedCharData.studentId}
                    </div>
                  </div>
                  {/* PC: 같은 줄에 랭킹 표시 (2줄 구조), 모바일: 숨김 */}
                  <div className="hidden sm:grid sm:grid-cols-4 gap-x-6 flex-1 text-center">
                    <div className="flex flex-col">
                      <span className="text-xs text-muted-foreground">
                        종합
                      </span>
                      <span className="text-lg font-bold">
                        {selectedCharData.overallRank}위
                      </span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-xs text-muted-foreground">
                        {selectedCharData.studentId < 20000
                          ? "STRIKER"
                          : "SPECIAL"}{" "}
                        내
                      </span>
                      <span className="text-lg font-bold">
                        {selectedCharData.categoryRank}위
                      </span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-xs text-muted-foreground">
                        사용
                      </span>
                      <span className="text-lg font-bold">
                        {selectedCharData.totalUsage.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-xs text-muted-foreground">
                        조력자
                      </span>
                      <span className="text-lg font-bold">
                        {(
                          selectedCharData.assistStats.assistRatio * 100
                        ).toFixed(1)}
                        %
                      </span>
                    </div>
                  </div>
                </div>
                {/* 모바일: 랭킹 아래에 표시 (2줄 구조) */}
                <div className="sm:hidden grid grid-cols-4 gap-2 mt-3 text-center">
                  <div className="flex flex-col">
                    <span className="text-[10px] text-muted-foreground">
                      종합
                    </span>
                    <span className="text-sm font-bold">
                      {selectedCharData.overallRank}위
                    </span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] text-muted-foreground">
                      타입내
                    </span>
                    <span className="text-sm font-bold">
                      {selectedCharData.categoryRank}위
                    </span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] text-muted-foreground">
                      사용
                    </span>
                    <span className="text-sm font-bold">
                      {selectedCharData.totalUsage.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] text-muted-foreground">
                      조력자
                    </span>
                    <span className="text-sm font-bold">
                      {(selectedCharData.assistStats.assistRatio * 100).toFixed(
                        1
                      )}
                      %
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Synergy Characters */}
            <Card className="max-w-full overflow-hidden">
              <CardContent className="px-3 py-0 max-w-full overflow-hidden">
                <div className="text-sm font-semibold mb-2">시너지 TOP 3</div>
                <div className="space-y-2">
                  {selectedCharData.topSynergyChars
                    .slice(0, 3)
                    .map((synergy, idx) => (
                      <div
                        key={synergy.studentId}
                        className="flex items-center gap-2.5"
                      >
                        <span className="text-sm text-muted-foreground w-4 flex-shrink-0">
                          {idx + 1}
                        </span>
                        <div className="flex-shrink-0">
                          <StudentImage code={synergy.studentId} size={32} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm truncate">
                            {studentsMap[synergy.studentId.toString()] ||
                              `학생 ${synergy.studentId}`}
                          </div>
                        </div>
                        <span className="text-sm text-muted-foreground">
                          {(synergy.coUsageRate * 100).toFixed(1)}%
                        </span>
                      </div>
                    ))}
                  {selectedCharData.topSynergyChars.length === 0 && (
                    <div className="text-sm text-muted-foreground text-center py-2">
                      데이터 없음
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Star Distribution - 남은 공간 채움 */}
            <div className="flex-1 flex">
              <StarDistChart characterData={selectedCharData} />
            </div>
          </div>

          {/* Right Column: Heatmap */}
          <UsageHeatmap
            characterData={selectedCharData}
            raidAnalyses={data.raidAnalyses}
          />
        </div>
      ) : (
        <Card className="max-w-full overflow-hidden">
          <CardContent className="flex items-center justify-center h-[120px] sm:h-[150px] text-muted-foreground text-sm">
            분석할 캐릭터를 선택해주세요.
          </CardContent>
        </Card>
      )}
    </div>
  );
}
