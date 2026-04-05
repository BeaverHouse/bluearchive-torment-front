"use client";

import { useState, useCallback, useEffect } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { YouTubeEmbed } from "@/components/features/video/youtube-embed";
import { EditableAnalysisResult } from "../_components/editable-analysis-result";
import { VideoAnalysisData } from "@/types/video";

interface EditVideoData {
  videos: VideoAnalysisData[];
  currentVideo: VideoAnalysisData;
  activeTab: string;
}

export default function VideoEditPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const videoId = params.id as string;
  const raidId = searchParams.get("raid_id");

  const [currentVideo, setCurrentVideo] = useState<VideoAnalysisData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!raidId) {
      router.replace('/video-analysis');
      return;
    }

    try {
      const savedData = sessionStorage.getItem('editVideoData');
      if (!savedData) {
        router.replace('/video-analysis');
        return;
      }

      const editData: EditVideoData = JSON.parse(savedData);
      if (!editData.videos || !editData.currentVideo || editData.currentVideo.video_id !== videoId) {
        router.replace('/video-analysis');
        return;
      }

      setCurrentVideo(editData.currentVideo);
      setIsLoading(false);
      sessionStorage.removeItem('editVideoData');
    } catch {
      router.replace('/video-analysis');
    }
  }, [videoId, router, raidId]);

  const handleVideoPlayStateChange = useCallback((_playing: boolean) => {}, []);

  const handleUpdateVideo = () => {
    if (!raidId) {
      window.location.href = '/video-analysis';
      return;
    }
    window.location.href = `/video-analysis/${videoId}?raid_id=${raidId}`;
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
            뒤로가기
          </Button>
        </div>
        <div className="text-center py-8">
          <p>{isLoading ? '편집 데이터를 로드하는 중...' : '편집 데이터를 찾을 수 없습니다.'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-w-0">
      <div className="flex items-center mb-4">
        <Button variant="ghost" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          뒤로가기
        </Button>
      </div>

      {/* 영상 플레이어 (fixed) */}
      <div className="hidden lg:flex lg:items-center fixed top-[4.5rem] bottom-0 left-4 w-[38%] z-10">
        <div className="w-full rounded-lg overflow-hidden bg-black shadow-lg">
          <YouTubeEmbed
            videoId={videoId}
            title={`Video ${videoId}`}
            onPlayStateChange={handleVideoPlayStateChange}
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