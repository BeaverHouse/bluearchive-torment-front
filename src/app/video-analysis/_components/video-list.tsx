"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Play, Calendar, Star, Award } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { VideoListItem } from "@/types/video";
import { useRaids } from "@/hooks/use-raids";
import { trackVideoClick } from "@/utils/analytics";

interface VideoListProps {
  videos: VideoListItem[];
}

// YouTube 썸네일 품질 fallback
const YOUTUBE_THUMBNAIL_QUALITIES = [
  'sddefault',     // 640x480 - 대부분 존재
  'hqdefault',     // 480x360 - 거의 항상 존재
] as const;

function YouTubeThumbnail({ videoId, title }: { videoId: string; title: string }) {
  const [qualityIndex, setQualityIndex] = useState(0);
  const [error, setError] = useState(false);

  const currentQuality = YOUTUBE_THUMBNAIL_QUALITIES[qualityIndex];

  const handleError = () => {
    if (qualityIndex < YOUTUBE_THUMBNAIL_QUALITIES.length - 1) {
      // 다음 품질로 fallback
      setQualityIndex(qualityIndex + 1);
    } else {
      // 모든 품질 실패 시
      setError(true);
    }
  };

  if (error) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gray-300 dark:bg-gray-700">
        <Play className="h-16 w-16 text-gray-400" />
      </div>
    );
  }

  return (
    <Image
      src={`https://img.youtube.com/vi/${videoId}/${currentQuality}.jpg`}
      alt={title}
      fill
      className="object-cover"
      onError={handleError}
    />
  );
}

export function VideoList({ videos }: VideoListProps) {
  const { raids } = useRaids();

  const getRaidName = (raidId: string | null): string | null => {
    if (!raidId) return null;
    const raid = raids.find((r) => r.id === raidId);
    return raid?.name || null;
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
        {videos.map((video) => {
          // 각 비디오의 raid_id는 필수로 전달
          const href = `/video-analysis/${video.video_id}?raid_id=${video.raid_id}`;

          return (
            <Link
              key={video.video_id}
              href={href}
              onClick={() =>
                trackVideoClick(
                  video.video_id,
                  video.raid_id || "unknown",
                  video.score
                )
              }
            >
              <Card className="cursor-pointer hover:shadow-lg transition-shadow bg-card border-border h-full flex flex-col overflow-hidden p-0">
                <div className="relative aspect-video bg-gray-200 overflow-hidden">
                  <YouTubeThumbnail videoId={video.video_id} title={video.title} />
                  <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                    <Play className="h-10 w-10 text-white" />
                  </div>
                </div>
                <div className="p-3 flex-1 flex flex-col justify-between relative">
                  <div>
                    <h3 className="font-semibold text-card-foreground text-sm leading-tight line-clamp-1">
                      {video.title}
                    </h3>
                  </div>
                  <div className="space-y-1 mt-2">
                    <div className="flex items-center justify-between">
                      <Badge
                        variant="secondary"
                        className="bg-primary text-primary-foreground text-xs px-2 py-1"
                      >
                        {video.score.toLocaleString()}
                      </Badge>
                      <div className="flex items-center text-muted-foreground text-xs">
                        <Calendar className="h-3 w-3 mr-1" />
                        {new Date(video.created_at).toLocaleDateString("ko-KR")}
                      </div>
                    </div>
                    {video.raid_id && (
                      <div className="text-xs">
                        <span className="font-medium text-card-foreground">
                          레이드:
                        </span>
                        <span className="text-muted-foreground ml-1">
                          {getRaidName(video.raid_id)}
                        </span>
                      </div>
                    )}
                  </div>
                  {video.verify_level > 0 && (
                    <div className="absolute bottom-1 right-1">
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div
                              className={`rounded-full p-1 ${
                                video.verify_level === 1
                                  ? "bg-orange-500"
                                  : "bg-yellow-500"
                              }`}
                            >
                              {video.verify_level === 1 ? (
                                <Star className="h-3 w-3 text-white" />
                              ) : (
                                <Award className="h-3 w-3 text-white" />
                              )}
                            </div>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>
                              {video.verify_level === 1
                                ? "파티 정보가 정확합니다"
                                : "모든 분석이 검증되었습니다"}
                            </p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                  )}
                </div>
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
