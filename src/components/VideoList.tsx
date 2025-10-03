"use client";

import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Play,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Star,
  Award,
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { VideoListItem } from "@/types/video";
import { RaidInfo } from "@/types/raid";
import raidsData from "../../data/raids.json";
import NormalAnnounce from "@/components/atoms/NormalAnnounce";

interface VideoListProps {
  videos: VideoListItem[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    total_pages: number;
    has_next: boolean;
    has_prev: boolean;
  };
  onPageChange: (page: number) => void;
}

const raids: RaidInfo[] = raidsData as RaidInfo[];

function getRaidName(raidId: string | null): string | null {
  if (!raidId) return null;
  const raid = raids.find((r) => r.id === raidId);
  return raid?.name || null;
}

export function VideoList({
  videos,
  pagination,
  onPageChange,
}: VideoListProps) {
  return (
    <div className="space-y-4">
      <NormalAnnounce />

      {/* 페이지네이션 */}
      {pagination.total_pages > 1 && (
        <div className="flex items-center justify-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(pagination.page - 1)}
            disabled={!pagination.has_prev}
            className="h-8 w-8 p-0"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>

          <div className="flex items-center space-x-1">
            {Array.from(
              { length: Math.min(5, pagination.total_pages) },
              (_, i) => {
                let pageNum;
                if (pagination.total_pages <= 5) {
                  pageNum = i + 1;
                } else if (pagination.page <= 3) {
                  pageNum = i + 1;
                } else if (pagination.page >= pagination.total_pages - 2) {
                  pageNum = pagination.total_pages - 4 + i;
                } else {
                  pageNum = pagination.page - 2 + i;
                }

                return (
                  <Button
                    key={pageNum}
                    variant={
                      pagination.page === pageNum ? "default" : "outline"
                    }
                    size="sm"
                    onClick={() => onPageChange(pageNum)}
                    className="h-8 w-8 p-0"
                  >
                    {pageNum}
                  </Button>
                );
              }
            )}
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(pagination.page + 1)}
            disabled={!pagination.has_next}
            className="h-8 w-8 p-0"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>

          <div className="text-sm text-muted-foreground ml-4">
            {pagination.total}개 중{" "}
            {(pagination.page - 1) * pagination.limit + 1}-
            {Math.min(pagination.page * pagination.limit, pagination.total)}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
        {videos.map((video) => {
          // 각 비디오의 raid_id는 필수로 전달
          const href = `/video-analysis/${video.video_id}?raid_id=${video.raid_id}`;

          return (
            <Link key={video.video_id} href={href}>
              <Card className="cursor-pointer hover:shadow-lg transition-shadow bg-card border-border h-full flex flex-col overflow-hidden p-0">
                <div className="relative aspect-video">
                  <img
                    src={`https://img.youtube.com/vi/${video.video_id}/maxresdefault.jpg`}
                    alt={video.title}
                    className="w-full h-full object-cover"
                  />
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
