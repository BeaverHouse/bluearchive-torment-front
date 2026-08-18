"use client";

import { useState, useCallback, useEffect } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { VideoEmbed } from "@/components/features/video/video-embed";
import { EditableAnalysisResult } from "../_components/editable-analysis-result";
import { VideoAnalysisData, platformFromVideoId } from "@/types/video";
import { getVideoDetail } from "@/lib/api";
import { trackEvent } from "@/utils/analytics";
import { useTranslations } from "@/lib/i18n";

export default function VideoEditPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const videoId = params.id as string;
  const raidId = searchParams.get("raid_id");
  const { t } = useTranslations();

  const [currentVideo, setCurrentVideo] = useState<VideoAnalysisData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (videoId) trackEvent("video_edit", { video_id: videoId });
  }, [videoId]);

  useEffect(() => {
    if (!videoId) return;

    const loadVideo = async () => {
      try {
        const response = await getVideoDetail(videoId, raidId || undefined);
        const analyses = response.data.data;
        // The same choice the detail page makes, so opening the editor shows
        // the analysis the reader was just looking at.
        setCurrentVideo(analyses?.find((analysis) => analysis.analysis_type !== "ai") ?? analyses?.[0] ?? null);
      } catch {
        setCurrentVideo(null);
      } finally {
        setIsLoading(false);
      }
    };

    loadVideo();
  }, [videoId, raidId]);

  const handleVideoPlayStateChange = useCallback(() => {}, []);

  const handleUpdateVideo = () => {
    if (!raidId) {
      router.push('/video-analysis');
      return;
    }
    router.push(`/video-analysis/${videoId}?raid_id=${raidId}`);
  };

  const handleCancelEdit = () => {
    router.back();
  };

  if (isLoading || !currentVideo) {
    return (
      <div className="space-y-6 min-w-0">
        <div className="flex items-center">
          <Button variant="ghost" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            {t("videoAnalysis.edit.back")}
          </Button>
        </div>
        <div className="text-center py-8">
          <p>{isLoading ? t("videoAnalysis.edit.loading") : t("videoAnalysis.edit.notFound")}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-w-0">
      <div className="flex items-center mb-4">
        <Button variant="ghost" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          {t("videoAnalysis.edit.back")}
        </Button>
      </div>

      {/* 영상 플레이어 (fixed) */}
      <div className="hidden lg:flex lg:items-center fixed top-[4.5rem] bottom-0 left-4 w-[38%] z-10">
        <div className="w-full rounded-lg overflow-hidden bg-black shadow-lg">
          <VideoEmbed
            videoId={videoId}
            title={`Video ${videoId}`}
            onPlayStateChange={handleVideoPlayStateChange}
            platform={platformFromVideoId(videoId)}
          />
        </div>
      </div>

      {/* 편집 영역 */}
      <div className="lg:ml-[40%] space-y-6">
        <EditableAnalysisResult
          videoData={currentVideo}
          raidId={raidId || undefined}
          onUpdate={handleUpdateVideo}
          onCancel={handleCancelEdit}
        />
      </div>
    </div>
  );
}