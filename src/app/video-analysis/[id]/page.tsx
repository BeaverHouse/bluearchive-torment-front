"use client"

import { VideoDetail } from "@/components/VideoDetail"
import { getVideoDetail } from "@/lib/api"
import { VideoAnalysisData } from "@/types/video"
import { useEffect, useState } from "react"
import { useParams } from "next/navigation"

export default function VideoDetailPage() {
  const params = useParams()
  const videoId = params.id as string
  const [videos, setVideos] = useState<VideoAnalysisData[]>([])
  const [currentVideo, setCurrentVideo] = useState<VideoAnalysisData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchVideo = async () => {
      try {
        setLoading(true)
        setError(null)
        const response = await getVideoDetail(videoId)
        if (response.data && response.data.length > 0) {
          setVideos(response.data)
          setCurrentVideo(response.data[0])
        } else {
          setError('비디오를 찾을 수 없습니다')
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : '비디오 상세 정보를 불러오는데 실패했습니다')
      } finally {
        setLoading(false)
      }
    }

    if (videoId) {
      fetchVideo()
    }
  }, [videoId])

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-6">
        <div className="flex justify-center items-center py-12">
          <div className="text-muted-foreground">로딩 중...</div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-6">
        <div className="flex justify-center items-center py-12">
          <div className="text-red-500">{error}</div>
        </div>
      </div>
    )
  }

  if (!currentVideo) {
    return (
      <div className="container mx-auto px-4 py-6">
        <div className="flex justify-center items-center py-12">
          <div className="text-muted-foreground">비디오를 찾을 수 없습니다</div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <VideoDetail 
        videos={videos} 
        currentVideo={currentVideo} 
        onVideoChange={setCurrentVideo}
      />
    </div>
  )
}