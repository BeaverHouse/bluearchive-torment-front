"use client";

import { VideoAnalysisData } from "@/types/video";
import PartyCard from "@/components/features/raid/party-card";
import { SkillOrderTable } from "./SkillOrderTable";

interface VideoAnalysisContentProps {
  video: VideoAnalysisData;
  studentsMap: Record<string, string>;
}

export function VideoAnalysisContent({
  video,
  studentsMap,
}: VideoAnalysisContentProps) {
  return (
    <div className="space-y-6 min-w-0">
      <PartyCard
        rank={-1}
        value={video.analysis_result.score}
        valueSuffix="점"
        parties={video.analysis_result.partyData}
      />

      <SkillOrderTable
        skillOrders={video.analysis_result.skillOrders}
        partyData={video.analysis_result.partyData}
        studentsMap={studentsMap}
      />

      {video.analysis_result.description && (
        <div className="bg-card border rounded-lg p-4">
          <h4 className="text-lg font-semibold mb-3">설명</h4>
          <p className="text-sm text-muted-foreground whitespace-pre-wrap">
            {video.analysis_result.description}
          </p>
        </div>
      )}
    </div>
  );
}
