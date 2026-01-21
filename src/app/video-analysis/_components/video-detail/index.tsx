"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ArrowLeft, Edit3, Copy, Check } from "lucide-react";
import { YouTubeEmbed } from "@/components/features/video/youtube-embed";
import { VideoAnalysisData } from "@/types/video";
import Link from "next/link";
import { useStudentMaps } from "@/hooks/use-student-maps";
import { VideoAnalysisContent } from "./VideoAnalysisContent";
import { generateHTML } from "./utils/generateHTML";

interface VideoDetailProps {
  videos: VideoAnalysisData[];
  currentVideo: VideoAnalysisData;
  onVideoChange: (video: VideoAnalysisData) => void;
  raidId: string | null;
}

export function VideoDetail({
  videos,
  currentVideo,
  onVideoChange,
  raidId,
}: VideoDetailProps) {
  const [copiedId, setCopiedId] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState(currentVideo.id.toString());
  const { studentsMap } = useStudentMaps();

  const sortedVideos = [...videos].sort((a, b) => {
    if (a.analysis_type !== "ai" && b.analysis_type === "ai") return -1;
    if (a.analysis_type === "ai" && b.analysis_type !== "ai") return 1;
    return 0;
  });

  const handleStartEdit = () => {
    if (!raidId) {
      window.location.href = "/video-analysis";
      return;
    }

    const editData = {
      videos: videos,
      currentVideo: currentVideo,
      activeTab: activeTab,
    };

    sessionStorage.setItem("editVideoData", JSON.stringify(editData));
    window.location.href = `/video-analysis/${currentVideo.video_id}/edit?raid_id=${raidId}`;
  };

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    const selectedVideo = videos.find((v) => v.id.toString() === value);
    if (selectedVideo) {
      onVideoChange(selectedVideo);
    }
  };

  const copyToClipboard = async (video: VideoAnalysisData) => {
    try {
      const html = generateHTML(video, studentsMap);
      await navigator.clipboard.writeText(html);
      setCopiedId(video.id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (error) {
      console.error("복사 실패:", error);
      alert("복사에 실패했습니다.");
    }
  };

  const ActionButtons = ({ video }: { video: VideoAnalysisData }) => (
    <div className="flex gap-2">
      <Button
        variant="outline"
        size="sm"
        onClick={() => copyToClipboard(video)}
        disabled={copiedId === video.id}
      >
        {copiedId === video.id ? (
          <Check className="h-4 w-4 mr-2" />
        ) : (
          <Copy className="h-4 w-4 mr-2" />
        )}
        {copiedId === video.id ? "복사됨" : "HTML 복사"}
      </Button>
      <Button onClick={handleStartEdit} size="sm">
        <Edit3 className="h-4 w-4 mr-2" />
        편집
      </Button>
    </div>
  );

  return (
    <div className="space-y-6 min-w-0">
      <div className="flex items-center">
        <Link href="/video-analysis">
          <Button variant="ghost">
            <ArrowLeft className="h-4 w-4 mr-2" />
            목록으로
          </Button>
        </Link>
      </div>

      <YouTubeEmbed
        videoId={currentVideo.video_id}
        title={`Video ${currentVideo.id}`}
      />

      {videos.length > 1 ? (
        <Tabs value={activeTab} onValueChange={handleTabChange}>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
            <TabsList>
              {sortedVideos.map((video) => (
                <TabsTrigger key={video.id} value={video.id.toString()}>
                  {video.analysis_type === "ai"
                    ? "AI 분석"
                    : `사용자 분석 v${video.version}`}
                </TabsTrigger>
              ))}
            </TabsList>
            <ActionButtons video={currentVideo} />
          </div>

          {sortedVideos.map((video) => (
            <TabsContent key={video.id} value={video.id.toString()}>
              <VideoAnalysisContent video={video} studentsMap={studentsMap} />
            </TabsContent>
          ))}
        </Tabs>
      ) : (
        <div className="space-y-4">
          <div className="flex gap-2 justify-end">
            <ActionButtons video={currentVideo} />
          </div>
          <VideoAnalysisContent video={currentVideo} studentsMap={studentsMap} />
        </div>
      )}
    </div>
  );
}
