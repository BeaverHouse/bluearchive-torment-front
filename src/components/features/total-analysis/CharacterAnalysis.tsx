"use client";

import { useState, useMemo } from "react";
import { TotalAnalysisData } from "@/types/total-analysis";
import { SearchableSelect } from "@/components/features/video/searchable-select";
import { useStudentMaps } from "@/hooks/use-student-maps";
import { StarDistChart } from "./StarDistChart";
import { UsageHeatmap } from "./UsageHeatmap";
import { StudentImage } from "@/components/features/student/student-image";
import { Card, CardContent } from "@/components/ui/card";
import { useTranslations } from "@/lib/i18n";

interface CharacterAnalysisProps {
  data: TotalAnalysisData;
}

export function CharacterAnalysis({ data }: CharacterAnalysisProps) {
  const { t } = useTranslations();
  const { studentsMap, studentSearchMap } = useStudentMaps();
  const [selectedStudentId, setSelectedStudentId] = useState<string>(() => {
    const random = data.characterAnalyses[Math.floor(Math.random() * data.characterAnalyses.length)];
    return random ? random.studentId.toString() : "";
  });

  const isLoaded = Object.keys(studentsMap).length > 0;

  const characterOptions = useMemo(() => {
    if (!isLoaded) return [];
    return data.characterAnalyses
      .map((char) => ({
        value: char.studentId,
        label:
          studentsMap[char.studentId.toString()] ||
          t("totalAnalysis.character.unknownStudent").replace("{n}", String(char.studentId)),
      }))
      .sort((a, b) => a.label.localeCompare(b.label, "ko"));
  }, [data.characterAnalyses, studentsMap, isLoaded, t]);

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
          {t("totalAnalysis.character.title")}
        </h2>
        <SearchableSelect
          options={characterOptions}
          value={selectedStudentId}
          onValueChange={setSelectedStudentId}
          placeholder={isLoaded ? t("totalAnalysis.character.selectPlaceholder") : t("totalAnalysis.character.loadingPlaceholder")}
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
                <div className="flex flex-wrap items-center gap-3">
                  <div className="flex-shrink-0">
                    <StudentImage code={selectedCharData.studentId} size={48} />
                  </div>
                  <div className="min-w-0">
                    <div className="font-semibold text-base truncate">
                      {studentsMap[selectedCharData.studentId.toString()] ||
                        selectedCharData.studentId}
                    </div>
                  </div>
                  {/* 통계 그리드 - 모바일: 다음 줄, PC: 인라인 */}
                  <div className="w-full sm:w-auto sm:flex-1 grid grid-cols-4 gap-2 sm:gap-x-6 text-center">
                    {[
                      { label: t("totalAnalysis.character.statOverall"), value: t("totalAnalysis.character.rankSuffix").replace("{n}", String(selectedCharData.overallRank)) },
                      { label: selectedCharData.studentId < 20000 ? t("totalAnalysis.character.statStrikerIn") : t("totalAnalysis.character.statSpecialIn"), value: t("totalAnalysis.character.rankSuffix").replace("{n}", String(selectedCharData.categoryRank)) },
                      { label: t("totalAnalysis.character.statUsage"), value: selectedCharData.totalUsage.toLocaleString() },
                      { label: t("totalAnalysis.character.statAssist"), value: `${(selectedCharData.assistStats.assistRatio * 100).toFixed(1)}%` },
                    ].map((stat, i) => (
                      <div key={i} className="flex flex-col">
                        <span className="text-[10px] sm:text-xs text-muted-foreground">{stat.label}</span>
                        <span className="text-sm sm:text-lg font-bold">{stat.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Synergy Characters */}
            <Card className="max-w-full overflow-hidden">
              <CardContent className="px-3 py-0 max-w-full overflow-hidden">
                <div className="text-sm font-semibold mb-2">{t("totalAnalysis.character.synergyTitle")}</div>
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
                              t("totalAnalysis.character.unknownStudent").replace("{n}", String(synergy.studentId))}
                          </div>
                        </div>
                        <span className="text-sm text-muted-foreground">
                          {(synergy.coUsageRate * 100).toFixed(1)}%
                        </span>
                      </div>
                    ))}
                  {selectedCharData.topSynergyChars.length === 0 && (
                    <div className="text-sm text-muted-foreground text-center py-2">
                      {t("totalAnalysis.character.noData")}
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
            {t("totalAnalysis.character.emptyState")}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
