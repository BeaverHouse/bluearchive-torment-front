"use client"

import Link from "next/link"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Play, CheckCircle, Calendar } from "lucide-react"
import { VideoListItem, RaidData } from "@/types/video"
import raidsData from "../../data/raids.json"

interface VideoListProps {
  videos: VideoListItem[]
}

const raids: RaidData[] = raidsData as RaidData[]

function getRaidName(raidId: string | null): string | null {
  if (!raidId) return null
  const raid = raids.find(r => r.id === raidId)
  return raid?.name || null
}

export function VideoList({ videos }: VideoListProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {videos.map((video) => (
        <Link key={video.video_id} href={`/video-analysis/${video.video_id}`}>
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
              {video.is_verified && (
                <div className="absolute top-2 right-2 bg-green-500 rounded-full p-1">
                  <CheckCircle className="h-4 w-4 text-white" />
                </div>
              )}
            </div>
            <div className="p-3 flex-1 flex flex-col justify-between">
              <div>
                <h3 className="font-semibold text-card-foreground text-sm leading-tight line-clamp-1">
                  {video.title}
                </h3>
              </div>
              <div className="space-y-1 mt-2">
                <div className="flex items-center justify-between">
                  <Badge variant="secondary" className="bg-primary text-primary-foreground text-xs px-2 py-1">
                    {video.score.toLocaleString()}
                  </Badge>
                  <div className="flex items-center text-muted-foreground text-xs">
                    <Calendar className="h-3 w-3 mr-1" />
                    {new Date(video.updated_at).toLocaleDateString('ko-KR')}
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
            </div>
          </Card>
        </Link>
      ))}
    </div>
  )
}