"use client";

import { VideoAnalysisData } from "@/types/video";
import PartyCard from "@/components/features/raid/party-card";
import { useTranslations } from "@/lib/i18n";

interface VideoAnalysisContentProps {
  video: VideoAnalysisData;
}

export function VideoAnalysisContent({ video }: VideoAnalysisContentProps) {
  const { t } = useTranslations();
  return (
    <div className="space-y-6 min-w-0">
      <PartyCard
        rank={-1}
        value={video.analysis_result.score}
        valueSuffix={t("videoAnalysis.detail.scoreSuffix")}
        parties={video.analysis_result.partyData}
        showModeBadge={false}
      />

      {video.analysis_result.description && (
        <div className="bg-card border rounded-lg p-4">
          <h4 className="text-lg font-semibold mb-3">{t("videoAnalysis.detail.description")}</h4>
          <p className="text-sm text-muted-foreground whitespace-pre-wrap">
            {video.analysis_result.description}
          </p>
        </div>
      )}
    </div>
  );
}
