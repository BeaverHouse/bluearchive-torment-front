"use client";

import { VideoDetail } from "@/components/VideoDetail";
import { getVideoDetail } from "@/lib/api";
import { VideoAnalysisData, VideoDetailResponse } from "@/types/video";
import { RaidInfo } from "@/types/raid";
import { useEffect, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import raidsData from "../../../../data/raids.json";
import ErrorPage from "@/components/ErrorPage";
import Loading from "@/components/common/Loading";

const raids: RaidInfo[] = raidsData as RaidInfo[];

function getRaidName(raidId: string | null): string | null {
  if (!raidId) return null;
  const raid = raids.find((r) => r.id === raidId);
  return raid?.name || null;
}

export default function VideoDetailPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const videoId = params.id as string;
  const raidId = searchParams.get("raid_id");
  const [videoDetail, setVideoDetail] = useState<
    VideoDetailResponse["data"] | null
  >(null);
  const [currentVideo, setCurrentVideo] = useState<VideoAnalysisData | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchVideo = async () => {
      try {
        setLoading(true);
        setError(null);

        // 편집 완료 후 업데이터된 데이터가 있는지 확인
        const updatedData = sessionStorage.getItem("updatedVideoData");
        if (updatedData) {
          try {
            const { updatedVideos, updatedCurrentVideo } =
              JSON.parse(updatedData);

            // 기존 데이터가 없으면 먼저 API 호출해서 기본 정보 가져오기
            if (!videoDetail) {
              const response = await getVideoDetail(
                videoId,
                raidId || undefined
              );
              setVideoDetail({
                video_id: videoId,
                data: updatedVideos,
                title: response.data.title,
                raid_id: response.data.raid_id,
              });
            } else {
              // 기존 데이터가 있으면 업데이트된 데이터만 교체
              setVideoDetail({
                ...videoDetail,
                data: updatedVideos,
              });
            }

            setCurrentVideo(updatedCurrentVideo);

            // 사용한 데이터 제거
            sessionStorage.removeItem("updatedVideoData");
            setLoading(false);
            return;
          } catch (parseError) {
            console.error("업데이트된 데이터 파싱 실패:", parseError);
            sessionStorage.removeItem("updatedVideoData");
          }
        }

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
          setError("비디오를 찾을 수 없습니다");
        }
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "비디오 상세 정보를 불러오는데 실패했습니다"
        );
      } finally {
        setLoading(false);
      }
    };

    if (videoId) {
      fetchVideo();
    }
  }, [videoId]);

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
    <div className="container mx-auto px-2 sm:px-4 py-4 sm:py-6">
      {videoDetail && (
        <div className="mb-6">
          <h1 className="text-2xl font-bold mb-2">{videoDetail.title}</h1>
          {videoDetail.raid_id && (
            <p className="text-muted-foreground">
              <span className="font-medium">레이드:</span>{" "}
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
      />
    </div>
  );
}
