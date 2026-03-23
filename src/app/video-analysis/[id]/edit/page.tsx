"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { YouTubeEmbed, YouTubePlayerRef } from "@/components/features/video/youtube-embed";
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
  
  // 상태 관리
  const [currentVideo, setCurrentVideo] = useState<VideoAnalysisData | null>(null);
  const [isVideoExpanded, setIsVideoExpanded] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // 편집 데이터 로드
  useEffect(() => {
    // raid_id가 없으면 무조건 목록으로 이동
    if (!raidId) {
      console.warn('raid_id가 없습니다. 목록 페이지로 이동합니다.');
      router.replace('/video-analysis');
      return;
    }

    const loadEditData = () => {
      try {
        const savedData = sessionStorage.getItem('editVideoData');
        if (!savedData) {
          // 직접 접근시 목록 페이지로 리다이렉트
          console.warn('편집 데이터가 없습니다. 목록 페이지로 이동합니다.');
          router.replace('/video-analysis');
          return;
        }

        const editData: EditVideoData = JSON.parse(savedData);
        
        // 데이터 유효성 검사
        if (!editData.videos || !editData.currentVideo || editData.currentVideo.video_id !== videoId) {
          console.warn('유효하지 않은 편집 데이터입니다. 목록 페이지로 이동합니다.');
          router.replace('/video-analysis');
          return;
        }

        // 데이터 설정
        setCurrentVideo(editData.currentVideo);
        
        // 로딩 완료
        setIsLoading(false);
        
        // 사용한 데이터 제거 (보안)
        sessionStorage.removeItem('editVideoData');
        
      } catch (error) {
        console.error('편집 데이터 로드 실패:', error);
        router.replace('/video-analysis');
      }
    };

    loadEditData();
  }, [videoId, router, raidId]);
  
  const youtubePlayerRef = useRef<YouTubePlayerRef>(null);
  const videoRef = useRef<HTMLDivElement>(null);

  // 비디오 상태 변화 처리
  const handleVideoPlayStateChange = useCallback((_playing: boolean) => {
    // 재생 상태로 인한 자동 확대 제거
  }, []);

  // 비디오 클릭 처리
  const handleVideoClick = useCallback(() => {
    if (!isVideoExpanded) {
      // 축소된 상태에서 클릭하면 확대만 하고 재생은 하지 않음
      setIsVideoExpanded(true);
    } else {
      // 확대된 상태에서 클릭하면 재생/일시정지 토글
      if (youtubePlayerRef.current) {
        const currentState = youtubePlayerRef.current.getPlayerState();

        // 재생 중이면 (state === 1) 일시정지, 아니면 재생
        if (currentState === 1) {
          youtubePlayerRef.current.pauseVideo();
        } else {
          youtubePlayerRef.current.playVideo();
        }
      }
    }
  }, [isVideoExpanded]);

  // 외부 클릭 처리
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (videoRef.current && !videoRef.current.contains(event.target as Node)) {
        setIsVideoExpanded(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);


  // 비디오 업데이트 처리
  const handleUpdateVideo = () => {
    // 저장 완료 후 이동
    if (!raidId) {
      // raid_id가 없으면 비디오 목록 페이지로 이동
      window.location.href = '/video-analysis';
      return;
    }

    // raid_id가 있으면 상세 페이지로 이동하면서 새로고침
    window.location.href = `/video-analysis/${videoId}?raid_id=${raidId}`;
  };

  // 편집 취소 처리
  const handleCancelEdit = () => {
    router.back();
  };


  // 로딩 중이거나 데이터가 없는 경우
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
    <div className="space-y-6 min-w-0">
      {/* 뒤로가기 버튼 */}
      <div className="flex items-center">
        <Button variant="ghost" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          뒤로가기
        </Button>
      </div>

      {/* Picture-in-Picture 영상 플레이어 */}
      <div 
        ref={videoRef}
        className={`fixed top-5 left-5 shadow-2xl rounded-lg overflow-hidden bg-black transition-all duration-300 pointer-events-auto ${
          isVideoExpanded
            ? 'w-[600px] h-[338px] md:w-[720px] md:h-[405px] lg:w-[800px] lg:h-[450px]'
            : 'w-[240px] h-[135px] md:w-[280px] md:h-[158px]'
        }`}
        style={{ zIndex: 9999 }}
        onClick={(e) => {
          e.stopPropagation();
        }}
      >
        <YouTubeEmbed
          ref={youtubePlayerRef}
          videoId={videoId}
          title={`Video ${videoId}`}
          onPlayStateChange={handleVideoPlayStateChange}
          onVideoClick={handleVideoClick}
          isExpanded={isVideoExpanded}
        />
      </div>
      
      {/* 편집 영역 */}
      <div className="space-y-6 mt-[200px] md:mt-[180px] lg:mt-[160px]">
        {/* 편집 헤더 */}
        <div className="border-b pb-4">
          <h2 className="text-2xl font-bold text-gray-900">분석 데이터 편집</h2>
          <p className="text-gray-600 mt-1">파티 구성과 스킬 순서를 수정할 수 있습니다.</p>
        </div>
        
        {/* 편집 폼 */}
        {currentVideo && (
          <EditableAnalysisResult
            videoData={currentVideo}
            raidId={raidId || undefined}
            onUpdate={handleUpdateVideo}
            onCancel={handleCancelEdit}
          />
        )}
      </div>
    </div>
  );
}