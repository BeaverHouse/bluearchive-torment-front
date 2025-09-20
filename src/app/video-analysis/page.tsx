"use client"

import { VideoList } from "@/components/VideoList"
import { getVideoList } from "@/lib/api"
import { VideoListItem, RaidData } from "@/types/video"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useEffect, useState } from "react"
import raidsData from "../../../data/raids.json"

const raids: RaidData[] = raidsData as RaidData[]

export default function VideoAnalysisPage() {
  const [videos, setVideos] = useState<VideoListItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedRaid, setSelectedRaid] = useState<string>("all")

  useEffect(() => {
    const fetchVideos = async () => {
      try {
        setLoading(true)
        setError(null)
        const raidId = selectedRaid === "all" ? undefined : selectedRaid
        const response = await getVideoList(raidId)
        setVideos(response.data.data)
      } catch (err) {
        setError(err instanceof Error ? err.message : '비디오 목록을 불러오는데 실패했습니다')
      } finally {
        setLoading(false)
      }
    }

    fetchVideos()
  }, [selectedRaid])

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">게임 영상 분석</h1>
          <p className="text-muted-foreground">
            Blue Archive 총력전 영상을 분석하여 파티 구성과 스킬 순서를 확인하세요
          </p>
        </div>
        <div className="flex justify-center items-center py-12">
          <div className="text-muted-foreground">로딩 중...</div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">게임 영상 분석</h1>
          <p className="text-muted-foreground">
            Blue Archive 총력전 영상을 분석하여 파티 구성과 스킬 순서를 확인하세요
          </p>
        </div>
        <div className="flex justify-center items-center py-12">
          <div className="text-red-500">{error}</div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">게임 영상 분석</h1>
        <p className="text-muted-foreground">
          Blue Archive 총력전 영상을 분석하여 파티 구성과 스킬 순서를 확인하세요
        </p>
      </div>
      <div className="mb-6">
        <Select value={selectedRaid} onValueChange={setSelectedRaid}>
          <SelectTrigger className="w-64">
            <SelectValue placeholder="레이드 선택" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">전체</SelectItem>
            {raids.map((raid) => (
              <SelectItem key={raid.id} value={raid.id}>
                {raid.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <VideoList videos={videos} />
    </div>
  )
}