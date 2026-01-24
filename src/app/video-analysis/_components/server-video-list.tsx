import Image from "next/image";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Play, Calendar } from "lucide-react";
import { VideoListItem } from "@/types/video";

interface ServerVideoListProps {
  videos: VideoListItem[];
}

// 서버 컴포넌트용 비디오 목록 (Adsense 크롤러를 위한 정적 HTML)
export function ServerVideoList({ videos }: ServerVideoListProps) {
  if (videos.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
        {videos.map((video) => {
          const href = `/video-analysis/${video.video_id}?raid_id=${video.raid_id}`;

          return (
            <Link key={video.video_id} href={href}>
              <Card className="cursor-pointer hover:shadow-lg transition-shadow bg-card border-border h-full flex flex-col overflow-hidden p-0">
                <div className="relative aspect-video bg-gray-200 overflow-hidden">
                  <Image
                    src={`https://img.youtube.com/vi/${video.video_id}/sddefault.jpg`}
                    alt={video.title}
                    fill
                    className="object-cover"
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
                          {video.raid_id}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
