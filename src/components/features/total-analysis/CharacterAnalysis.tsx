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
        label: studentsMap[char.studentId.toString()] || `학생 ${char.studentId}`,
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
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center justify-between">
        <h2 className="text-2xl font-bold tracking-tight">캐릭터 상세 분석</h2>
        <SearchableSelect
          options={characterOptions}
          value={selectedStudentId}
          onValueChange={setSelectedStudentId}
          placeholder={isLoaded ? "학생을 선택하세요" : "로딩 중..."}
          className="w-[200px]"
          studentSearchMap={studentSearchMap}
          disabled={!isLoaded}
        />
      </div>

      {selectedCharData ? (
        <div className="grid gap-6">
          {/* Summary Stats + Synergy */}
          <div className="grid gap-6 md:grid-cols-3">
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-4">
                  <StudentImage code={selectedCharData.studentId} />
                  <span>
                    {studentsMap[selectedCharData.studentId.toString()] ||
                      selectedCharData.studentId}
                  </span>
                  <span className="text-sm font-normal text-muted-foreground ml-auto">
                    {selectedCharData.studentId < 20000 ? "STRIKER" : "SPECIAL"}
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                  <div>
                    <div className="text-sm text-muted-foreground">종합 순위</div>
                    <div className="text-2xl font-bold">
                      {selectedCharData.overallRank}위
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">
                      타입 내 순위
                    </div>
                    <div className="text-2xl font-bold">
                      {selectedCharData.categoryRank}위
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">
                      총 사용 횟수
                    </div>
                    <div className="text-2xl font-bold">
                      {selectedCharData.totalUsage.toLocaleString()}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">
                      조력자 채용률
                    </div>
                    <div className="text-2xl font-bold">
                      {(selectedCharData.assistStats.assistRatio * 100).toFixed(
                        1
                      )}
                      %
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Synergy Characters */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">시너지 캐릭터 TOP 3</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {selectedCharData.topSynergyChars.slice(0, 3).map((synergy, idx) => (
                    <div key={synergy.studentId} className="flex items-center gap-3">
                      <span className="text-sm text-muted-foreground w-4">
                        {idx + 1}
                      </span>
                      <StudentImage code={synergy.studentId} size={32} />
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium truncate">
                          {studentsMap[synergy.studentId.toString()] ||
                            `학생 ${synergy.studentId}`}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          동시 사용률 {(synergy.coUsageRate * 100).toFixed(1)}%
                        </div>
                      </div>
                    </div>
                  ))}
                  {selectedCharData.topSynergyChars.length === 0 && (
                    <div className="text-sm text-muted-foreground text-center py-4">
                      데이터 없음
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Charts Grid */}
          <div className="grid gap-6 md:grid-cols-2">
            <StarDistChart characterData={selectedCharData} />
            <UsageHeatmap
              characterData={selectedCharData}
              raidAnalyses={data.raidAnalyses}
            />
          </div>
        </div>
      ) : (
        <Card>
          <CardContent className="flex items-center justify-center h-[200px] text-muted-foreground">
            분석할 캐릭터를 선택해주세요.
          </CardContent>
        </Card>
      )}
    </div>
  );
}
