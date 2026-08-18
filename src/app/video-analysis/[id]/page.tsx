"use client";

import { VideoDetail } from "../_components/video-detail";
import { getVideoDetail } from "@/lib/api";
import { VideoAnalysisData, VideoDetailResponse } from "@/types/video";
import { useEffect, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { useRaids, getRaidName as getLocalizedRaidName } from "@/hooks/use-raids";
import ErrorPage from "@/components/common/error-page";
import Loading from "@/components/common/loading";
import { useTranslations } from "@/lib/i18n";

export default function VideoDetailPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const videoId = params.id as string;
  const raidId = searchParams.get("raid_id");
  const { raids } = useRaids();
  const { t, locale } = useTranslations();
  const [videoDetail, setVideoDetail] = useState<
    VideoDetailResponse["data"] | null
  >(null);
  const [currentVideo, setCurrentVideo] = useState<VideoAnalysisData | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const getRaidName = (raidIdParam: string | null): string | null => {
    if (!raidIdParam) return null;
    const raid = raids.find((r) => r.id === raidIdParam);
    return raid ? getLocalizedRaidName(raid, locale) : null;
  };

  useEffect(() => {
    const fetchVideo = async () => {
      try {
        setLoading(true);
        setError(null);

        // 일반적인 API 호출
        const response = await getVideoDetail(videoId, raidId || undefined);
        if (response.data.data && response.data.data.length > 0) {
          setVideoDetail(response.data);
          // 사용자 분석이 있으면 우선 선택, 없으면 첫 번째 선택
          const userAnalysis = response.data.data.find(
            (video) => video.analysis_type !== "ai"
          );
          setCurrentVideo(userAnalysis || response.data.data[0]);
        } else {
          setError(t("videoAnalysis.detail.notFound"));
        }
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : t("videoAnalysis.detail.fetchError")
        );
      } finally {
        setLoading(false);
      }
    };

    if (videoId) {
      fetchVideo();
    }
  }, [videoId, raidId, t]);

  if (loading) {
    return <Loading />;
  }

  if (error) {
    return <ErrorPage />;
  }

  if (!currentVideo) {
    return <ErrorPage />;
  }

  return (
    <div className="container mx-auto py-4 sm:px-4 sm:py-6">
      {videoDetail && (
        <div className="mb-6">
          <h1 className="text-2xl font-bold mb-2">{videoDetail.title}</h1>
          {videoDetail.raid_id && (
            <p className="text-muted-foreground">
              <span className="font-medium">{t("common.raidLabel")}</span>{" "}
              {getRaidName(videoDetail.raid_id)}
            </p>
          )}
        </div>
      )}
      <VideoDetail
        videos={videoDetail?.data || []}
        currentVideo={currentVideo}
        onVideoChange={setCurrentVideo}
        raidId={raidId}
        platform={videoDetail?.platform}
      />
    </div>
  );
}
