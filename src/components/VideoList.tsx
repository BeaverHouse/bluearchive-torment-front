"use client"

import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Play, Calendar } from "lucide-react"
import { VideoListItem } from "@/types/video"

interface VideoListProps {
  videos: VideoListItem[]
}

export function VideoList({ videos }: VideoListProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {videos.map((video) => (
        <Link key={video.video_id} href={`/video-analysis/${video.video_id}`}>
          <Card className="cursor-pointer hover:shadow-lg transition-shadow bg-card border-border">
            <CardContent className="p-0">
              <div className="relative">
                <img
                  src={`https://img.youtube.com/vi/${video.video_id}/maxresdefault.jpg`}
                  alt={`Video ${video.video_id}`}
                  className="w-full h-48 object-cover rounded-t-lg"
                />
                <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity rounded-t-lg">
                  <Play className="h-12 w-12 text-white" />
                </div>
              </div>
              <div className="p-4">
                <h3 className="font-semibold text-card-foreground mb-2 line-clamp-2">
                  Video ID: {video.video_id}
                </h3>
                <div className="flex items-center justify-between mb-3">
                  <Badge variant="secondary" className="bg-primary text-primary-foreground">
                    {video.score.toLocaleString()}
                  </Badge>
                  <div className="flex items-center text-muted-foreground text-sm">
                    <Calendar className="h-4 w-4 mr-1" />
                    v{video.version}
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="text-sm">
                    <span className="font-medium text-card-foreground">
                      분석 타입:
                    </span>
                    <span className="text-muted-foreground ml-2 capitalize">
                      {video.analysis_type}
                    </span>
                  </div>
                  <div className="text-sm">
                    <span className="font-medium text-card-foreground">
                      생성일:
                    </span>
                    <span className="text-muted-foreground ml-2">
                      {new Date(video.created_at).toLocaleDateString('ko-KR')}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>
      ))}
    </div>
  )
}