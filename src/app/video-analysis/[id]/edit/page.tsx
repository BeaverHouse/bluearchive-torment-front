"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Copy, Check } from "lucide-react";
import { YouTubeEmbed, YouTubePlayerRef } from "@/components/YouTubeEmbed";
import { EditableAnalysisResult } from "@/components/EditableAnalysisResult";
import { VideoAnalysisData } from "@/types/video";
import studentsData from "../../../../../data/students.json";

interface EditVideoData {
  videos: VideoAnalysisData[];
  currentVideo: VideoAnalysisData;
  activeTab: string;
}

export default function VideoEditPage() {
  const params = useParams();
  const router = useRouter();
  const videoId = params.id as string;
  
  // 상태 관리
  const [videos, setVideos] = useState<VideoAnalysisData[]>([]);
  const [currentVideo, setCurrentVideo] = useState<VideoAnalysisData | null>(null);
  const [copiedId, setCopiedId] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState("");
  const [isVideoExpanded, setIsVideoExpanded] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // 편집 데이터 로드
  useEffect(() => {
    const loadEditData = () => {
      try {
        const savedData = sessionStorage.getItem('editVideoData');
        if (!savedData) {
          // 직접 접근시 상세 페이지로 리다이렉트
          console.warn('편집 데이터가 없습니다. 상세 페이지로 이동합니다.');
          router.replace(`/video-analysis/${videoId}`);
          return;
        }

        const editData: EditVideoData = JSON.parse(savedData);
        
        // 데이터 유효성 검사
        if (!editData.videos || !editData.currentVideo || editData.currentVideo.video_id !== videoId) {
          console.warn('유효하지 않은 편집 데이터입니다. 상세 페이지로 이동합니다.');
          router.replace(`/video-analysis/${videoId}`);
          return;
        }

        // 데이터 설정
        setVideos(editData.videos);
        setCurrentVideo(editData.currentVideo);
        setActiveTab(editData.activeTab);
        
        // 로딩 완료
        setIsLoading(false);
        
        // 사용한 데이터 제거 (보안)
        sessionStorage.removeItem('editVideoData');
        
      } catch (error) {
        console.error('편집 데이터 로드 실패:', error);
        router.replace(`/video-analysis/${videoId}`);
      }
    };

    loadEditData();
  }, [videoId, router]);
  
  const youtubePlayerRef = useRef<YouTubePlayerRef>(null);
  const videoRef = useRef<HTMLDivElement>(null);
  const studentsMap = studentsData as Record<string, string>;

  // 비디오 상태 변화 처리
  const handleVideoPlayStateChange = useCallback((playing: boolean) => {
    console.log('🎵 Video play state changed:', playing);
    if (playing) {
      console.log('🔄 Expanding video due to play state change');
      setIsVideoExpanded(true);
    }
  }, []);

  // 비디오 클릭 처리
  const handleVideoClick = useCallback(() => {
    console.log('👆 Video clicked, isVideoExpanded:', isVideoExpanded);
    
    if (!isVideoExpanded) {
      console.log('▶️ Starting playback programmatically');
      setIsVideoExpanded(true);
      
      if (youtubePlayerRef.current) {
        console.log('✅ Player ref exists, calling playVideo()');
        youtubePlayerRef.current.playVideo();
      }
    }
  }, [isVideoExpanded]);

  // 외부 클릭 처리
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (videoRef.current && !videoRef.current.contains(event.target as Node)) {
        console.log('🖱️ Outside click detected - collapsing video');
        setIsVideoExpanded(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // 탭 변경 처리
  const handleTabChange = (value: string) => {
    setActiveTab(value);
    const selectedVideo = videos.find((v) => v.id.toString() === value);
    if (selectedVideo) {
      setCurrentVideo(selectedVideo);
    }
  };

  // 비디오 업데이트 처리
  const handleUpdateVideo = (updatedVideo: VideoAnalysisData) => {
    // 업데이트된 비디오 데이터를 상세 페이지로 전달
    const updatedVideos = videos.map(video => 
      video.id === updatedVideo.id ? updatedVideo : video
    );
    
    const updateData = {
      updatedVideos,
      updatedCurrentVideo: updatedVideo,
      activeTab: activeTab
    };
    
    // 업데이트된 데이터를 sessionStorage에 저장
    sessionStorage.setItem('updatedVideoData', JSON.stringify(updateData));
    
    router.back(); // 편집 완료 후 뒤로가기
  };

  // 편집 취소 처리
  const handleCancelEdit = () => {
    router.back();
  };

  // 캐릭터 이름 가져오기 (향후 사용 예정)
  // const getCharacterName = (code: number): string => {
  //   return studentsMap[code.toString()] || `캐릭터 ${code}`;
  // };

  // HTML 복사 기능
  const generateHTML = (video: VideoAnalysisData) => {
    // VideoDetail.tsx의 generateHTML 함수와 동일한 로직
    const { analysis_result } = video;
    
    const html = `<div>총점: ${analysis_result.score.toLocaleString()}</div>`;
    // 실제 구현에서는 전체 HTML 생성 로직 추가
    return html;
  };

  const copyToClipboard = async (video: VideoAnalysisData) => {
    try {
      const html = generateHTML(video);
      await navigator.clipboard.writeText(html);
      setCopiedId(video.id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (error) {
      console.error("복사 실패:", error);
      alert("복사에 실패했습니다.");
    }
  };

  const sortedVideos = videos.length > 0 ? [...videos].sort((a, b) => {
    if (a.analysis_type !== "ai" && b.analysis_type === "ai") return -1;
    if (a.analysis_type === "ai" && b.analysis_type !== "ai") return 1;
    return 0;
  }) : [];

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
        className={`fixed bottom-5 right-5 shadow-2xl rounded-lg overflow-hidden bg-black transition-all duration-300 pointer-events-auto ${
          isVideoExpanded
            ? 'w-[600px] h-[338px] md:w-[720px] md:h-[405px] lg:w-[800px] lg:h-[450px]'
            : 'w-[300px] h-[169px] md:w-[360px] md:h-[203px]'
        }`}
        style={{ zIndex: 9999 }}
        onClick={(e) => {
          console.log('📺 Video container clicked - preventing propagation');
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
      <div className="space-y-6">
        {/* 편집 탭 헤더 */}
        {videos.length > 1 && (
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <Tabs value={activeTab} onValueChange={handleTabChange}>
              <TabsList>
                {sortedVideos.map((video) => {
                  if (video.analysis_type === "ai") {
                    return (
                      <TabsTrigger key={video.id} value={video.id.toString()}>
                        AI 분석
                      </TabsTrigger>
                    );
                  } else {
                    return (
                      <TabsTrigger key={video.id} value={video.id.toString()}>
                        사용자 분석 v{video.version}
                      </TabsTrigger>
                    );
                  }
                })}
              </TabsList>
            </Tabs>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => copyToClipboard(currentVideo)}
                disabled={copiedId === currentVideo.id}
              >
                {copiedId === currentVideo.id ? (
                  <Check className="h-4 w-4 mr-2" />
                ) : (
                  <Copy className="h-4 w-4 mr-2" />
                )}
                {copiedId === currentVideo.id ? "복사됨" : "HTML 복사"}
              </Button>
            </div>
          </div>
        )}
        
        {/* 편집 폼 */}
        {currentVideo && (
          <EditableAnalysisResult
            videoData={currentVideo}
            onUpdate={handleUpdateVideo}
            onCancel={handleCancelEdit}
          />
        )}
      </div>
    </div>
  );
}