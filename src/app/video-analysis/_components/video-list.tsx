"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Play, Calendar, Star, Award, Youtube, Tv } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { VideoListItem, platformFromVideoId } from "@/types/video";
import { useRaids, getRaidName as getLocalizedRaidName } from "@/hooks/use-raids";
import { trackEvent } from "@/utils/analytics";
import { useTranslations } from "@/lib/i18n";

interface VideoListProps {
  videos: VideoListItem[];
}

// YouTube 썸네일 품질 fallback
const YOUTUBE_THUMBNAIL_QUALITIES = [
  'maxresdefault', // 1280x720 - 일부 영상에 없을 수 있음
  'sddefault',     // 640x480 - 대부분 존재
  'hqdefault',     // 480x360 - 거의 항상 존재
] as const;

function ThumbnailFallback() {
  return (
    <div className="w-full h-full flex items-center justify-center bg-gray-300 dark:bg-gray-700">
      <Play className="h-16 w-16 text-gray-400" />
    </div>
  );
}

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
    return <ThumbnailFallback />;
  }

  return (
    <Image
      src={`https://img.youtube.com/vi/${videoId}/${currentQuality}.jpg`}
      alt={title}
      fill
      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
      className="object-cover"
      onError={handleError}
    />
  );
}

// Bilibili thumbnails live on i0.hdslb.com behind referer-based hotlink
// protection, so we load them with a plain <img referrerPolicy="no-referrer">
// (next/image can't set that) and fall back to a placeholder on error.
function BilibiliThumbnail({ url, title }: { url: string; title: string }) {
  const [error, setError] = useState(false);

  if (error || !url) {
    return <ThumbnailFallback />;
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={url}
      alt={title}
      referrerPolicy="no-referrer"
      className="absolute inset-0 w-full h-full object-cover"
      onError={() => setError(true)}
    />
  );
}

// Prefer the backend platform field, but fall back to the id shape (BV-prefixed
// = Bilibili) so a missing/legacy platform field can't make a Bilibili video try
// to load a YouTube thumbnail.
function VideoThumbnail({ video }: { video: VideoListItem }) {
  const platform = video.platform ?? platformFromVideoId(video.video_id);
  if (platform === "bilibili") {
    return <BilibiliThumbnail url={video.thumbnail_url ?? ""} title={video.title} />;
  }
  return <YouTubeThumbnail videoId={video.video_id} title={video.title} />;
}

// PlatformBadge marks each card as YouTube or Bilibili.
function PlatformBadge({ video }: { video: VideoListItem }) {
  const isBilibili =
    (video.platform ?? platformFromVideoId(video.video_id)) === "bilibili";
  return (
    <div
      className={`absolute top-1 left-1 z-10 rounded p-1 ${
        isBilibili ? "bg-[#FB7299]" : "bg-red-600"
      }`}
      title={isBilibili ? "Bilibili" : "YouTube"}
    >
      {isBilibili ? (
        <Tv className="h-3 w-3 text-white" />
      ) : (
        <Youtube className="h-3 w-3 text-white" />
      )}
    </div>
  );
}

export function VideoList({ videos }: VideoListProps) {
  const { raids } = useRaids();
  const { t, locale } = useTranslations();

  const getRaidName = (raidId: string | null): string | null => {
    if (!raidId) return null;
    const raid = raids.find((r) => r.id === raidId);
    return raid ? getLocalizedRaidName(raid, locale) : null;
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
                trackEvent("video_open", {
                  source: "video_list",
                  video_id: video.video_id,
                  raid_id: video.raid_id || "unknown",
                  ...(video.score !== undefined ? { score: video.score } : {}),
                })
              }
            >
              <Card className="cursor-pointer hover:shadow-lg transition-shadow bg-card border-border h-full flex flex-col overflow-hidden p-0">
                <div className="relative aspect-video bg-gray-200 overflow-hidden">
                  <VideoThumbnail video={video} />
                  <PlatformBadge video={video} />
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
                          {t("videoAnalysis.list.raidLabel")}
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
                                ? t("videoAnalysis.list.verifyPartyOk")
                                : t("videoAnalysis.list.verifyAllOk")}
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
