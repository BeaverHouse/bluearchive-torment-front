"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Edit3 } from "lucide-react"
import { YouTubeEmbed } from "@/components/YouTubeEmbed"
import { AIPartyDisplay } from "@/components/AIPartyDisplay"
import { EditableAnalysisResult } from "@/components/EditableAnalysisResult"
import { VideoAnalysisData } from "@/types/video"
import Link from "next/link"

interface VideoDetailProps {
  video: VideoAnalysisData
}

export function VideoDetail({ video: initialVideo }: VideoDetailProps) {
  const [video, setVideo] = useState<VideoAnalysisData>(initialVideo)
  const [isEditing, setIsEditing] = useState(false)
  const handleStartEdit = () => {
    setIsEditing(true)
  }

  const handleCancelEdit = () => {
    setIsEditing(false)
  }

  const handleUpdateVideo = (updatedVideo: VideoAnalysisData) => {
    setVideo(updatedVideo)
    setIsEditing(false)
  }

  return (
    <div className="space-y-6">
      {/* 뒤로가기 버튼 및 편집 버튼 */}
      <div className="flex items-center justify-between gap-4">
        <Link href="/video-analysis">
          <Button variant="ghost">
            <ArrowLeft className="h-4 w-4 mr-2" />
            목록으로
          </Button>
        </Link>
        {!isEditing && (
          <Button onClick={handleStartEdit} className="bg-blue-600 hover:bg-blue-700">
            <Edit3 className="h-4 w-4 mr-2" />
            분석 결과 편집
          </Button>
        )}
      </div>

      {/* YouTube 임베드 */}
      <YouTubeEmbed videoId={video.video_id} title={`Video ${video.id}`} />

      {/* 비디오 정보 */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-foreground mb-2">Video ID: {video.video_id}</h1>
          <p className="text-muted-foreground text-sm">
            분석 타입: {video.analysis_type} | 버전: {video.version}
          </p>
        </div>
      </div>

      {/* AI 분석 결과 또는 편집 폼 */}
      {isEditing ? (
        <EditableAnalysisResult
          videoData={video}
          onUpdate={handleUpdateVideo}
          onCancel={handleCancelEdit}
        />
      ) : (
        <AIPartyDisplay 
          partyCompositions={video.analysis_result.party_compositions}
          skillOrders={video.analysis_result.skill_orders}
          totalScore={video.analysis_result.total_score}
          validationErrors={video.analysis_result.validation_errors}
        />
      )}
    </div>
  )
}