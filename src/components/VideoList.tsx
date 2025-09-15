"use client"

import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
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
  return raid?.description || null
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
                  alt={video.title}
                  className="w-full h-48 object-cover rounded-t-lg"
                />
                <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity rounded-t-lg">
                  <Play className="h-12 w-12 text-white" />
                </div>
                {video.is_verified && (
                  <div className="absolute top-2 right-2 bg-green-500 rounded-full p-1">
                    <CheckCircle className="h-4 w-4 text-white" />
                  </div>
                )}
              </div>
              <div className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-semibold text-card-foreground line-clamp-2 flex-1">
                    {video.title}
                  </h3>
                </div>
                <div className="flex items-center justify-between mb-3">
                  <Badge variant="secondary" className="bg-primary text-primary-foreground">
                    {video.score.toLocaleString()}
                  </Badge>
                  <div className="flex items-center text-muted-foreground text-sm">
                    <Calendar className="h-4 w-4 mr-1" />
                    {new Date(video.updated_at).toLocaleDateString('ko-KR')}
                  </div>
                </div>
                {video.raid_id && (
                  <div className="text-sm">
                    <span className="font-medium text-card-foreground">
                      레이드:
                    </span>
                    <span className="text-muted-foreground ml-2">
                      {getRaidName(video.raid_id)}
                    </span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </Link>
      ))}
    </div>
  )
}