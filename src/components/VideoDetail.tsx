"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { ArrowLeft, Edit3, Copy, Check } from "lucide-react"
import { YouTubeEmbed } from "@/components/YouTubeEmbed"
import PartyCard from "@/components/molecules/PartyCard"
import { EditableAnalysisResult } from "@/components/EditableAnalysisResult"
import { VideoAnalysisData } from "@/types/video"
import Link from "next/link"
import studentsData from "../../data/students.json"

interface VideoDetailProps {
  videos: VideoAnalysisData[]
  currentVideo: VideoAnalysisData
  onVideoChange: (video: VideoAnalysisData) => void
}

export function VideoDetail({ videos, currentVideo, onVideoChange }: VideoDetailProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [copiedId, setCopiedId] = useState<number | null>(null)
  const [activeTab, setActiveTab] = useState(currentVideo.id.toString())

  const studentsMap = studentsData as Record<string, string>
  const handleStartEdit = () => {
    setIsEditing(true)
  }

  const handleCancelEdit = () => {
    setIsEditing(false)
  }

  const handleUpdateVideo = (updatedVideo: VideoAnalysisData) => {
    onVideoChange(updatedVideo)
    setIsEditing(false)
  }

  const handleTabChange = (value: string) => {
    setActiveTab(value)
    const selectedVideo = videos.find(v => v.id.toString() === value)
    if (selectedVideo) {
      onVideoChange(selectedVideo)
    }
  }

  const getCharacterName = (code: number): string => {
    return studentsMap[code.toString()] || `캐릭터 ${code}`
  }

  // 새로운 데이터 구조에서는 스킬 순서 관련 함수 제거 (skillOrders가 빈 배열)

  const generateHTML = (video: VideoAnalysisData) => {
    const { analysis_result } = video
    
    let html = `
<div style="font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px;">
  <h2 style="color: #1f2937; margin-bottom: 20px;">분석 결과 (${video.analysis_type === 'ai' ? 'AI 분석' : '사용자 분석'})</h2>
  <p style="color: #6b7280; margin-bottom: 20px;">총점: ${analysis_result.score.toLocaleString()}</p>
  
  <h3 style="color: #374151; margin: 30px 0 15px 0;">파티 구성</h3>`

    analysis_result.partyData.forEach((party, index) => {
      html += `
  <div style="border: 1px solid #d1d5db; border-radius: 8px; padding: 15px; margin-bottom: 15px;">
    <h4 style="color: #111827; margin: 0 0 15px 0;">파티 ${index + 1}</h4>
    <div style="display: grid; grid-template-columns: repeat(6, 1fr); gap: 8px;">`

      party.forEach(char => {
        if (char === 0) {
          html += `<div style="width: 50px; height: 50px;"></div>`
          return
        }
        
        const code = Math.floor(char / 1000)
        const star = Math.floor((char % 1000) / 100)
        const weapon = Math.floor((char % 100) / 10)
        const assist = char % 10
        const name = getCharacterName(code)
        
        html += `
        <div style="text-align: center; border: 1px solid #d1d5db; border-radius: 4px; padding: 8px;">
          <div style="font-weight: bold; font-size: 12px; margin-bottom: 4px;">${name}</div>
          <div style="font-size: 10px; color: #6b7280;">${star}★ / ${weapon}무</div>
          ${assist ? '<div style="color: #10b981; font-size: 10px;">조력자</div>' : ''}
        </div>`
      })

      html += `
    </div>
  </div>`
    })

    html += `
</div>`

    return html
  }

  const copyToClipboard = async (video: VideoAnalysisData) => {
    try {
      const html = generateHTML(video)
      await navigator.clipboard.writeText(html)
      setCopiedId(video.id)
      setTimeout(() => setCopiedId(null), 2000)
    } catch (error) {
      console.error('복사 실패:', error)
      alert('복사에 실패했습니다.')
    }
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
      <YouTubeEmbed videoId={currentVideo.video_id} title={`Video ${currentVideo.id}`} />

      {/* 비디오 정보 */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-foreground mb-2">Video ID: {currentVideo.video_id}</h1>
          <p className="text-muted-foreground text-sm">
            총 {videos.length}개의 분석 결과
          </p>
        </div>
      </div>

      {/* 탭으로 여러 분석 결과 표시 */}
      {videos.length > 1 ? (
        <Tabs value={activeTab} onValueChange={handleTabChange}>
          <div className="flex items-center justify-between gap-4 mb-4">
            <TabsList>
              {videos.map((video, index) => (
                <TabsTrigger key={video.id} value={video.id.toString()}>
                  {video.analysis_type === 'ai' ? 'AI 분석' : '사용자 분석'} {index + 1}
                </TabsTrigger>
              ))}
            </TabsList>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => copyToClipboard(currentVideo)}
                disabled={copiedId === currentVideo.id}
              >
                {copiedId === currentVideo.id ? (
                  <Check className="h-4 w-4 mr-2" />
                ) : (
                  <Copy className="h-4 w-4 mr-2" />
                )}
                {copiedId === currentVideo.id ? '복사됨' : 'HTML 복사'}
              </Button>
              {!isEditing && (
                <Button onClick={handleStartEdit} className="bg-blue-600 hover:bg-blue-700">
                  <Edit3 className="h-4 w-4 mr-2" />
                  분석 결과 편집
                </Button>
              )}
            </div>
          </div>

          {videos.map(video => (
            <TabsContent key={video.id} value={video.id.toString()}>
              <div className="mb-4">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <h3 className="text-lg font-semibold">
                      {video.analysis_type === 'ai' ? 'AI 분석' : '사용자 분석'} 결과
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      생성일: {new Date(video.created_at).toLocaleDateString('ko-KR')} | 버전: {video.version}
                    </p>
                  </div>
                </div>
              </div>

              {/* AI 분석 결과 또는 편집 폼 */}
              {isEditing && video.id === currentVideo.id ? (
                <EditableAnalysisResult
                  videoData={video}
                  onUpdate={handleUpdateVideo}
                  onCancel={handleCancelEdit}
                />
              ) : (
                <PartyCard
                  data={{
                    rank: 1,
                    score: video.analysis_result.score,
                    partyData: video.analysis_result.partyData,
                  }}
                  season=""
                  studentsMap={studentsMap}
                  seasonDescription=""
                  linkInfos={[{
                    userId: video.id,
                    youtubeUrl: video.analysis_result.url,
                    score: video.analysis_result.score
                  }]}
                />
              )}
            </TabsContent>
          ))}
        </Tabs>
      ) : (
        <>
          <div className="flex items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-semibold">
                {currentVideo.analysis_type === 'ai' ? 'AI 분석' : '사용자 분석'} 결과
              </h3>
              <p className="text-sm text-muted-foreground">
                생성일: {new Date(currentVideo.created_at).toLocaleDateString('ko-KR')} | 버전: {currentVideo.version}
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => copyToClipboard(currentVideo)}
                disabled={copiedId === currentVideo.id}
              >
                {copiedId === currentVideo.id ? (
                  <Check className="h-4 w-4 mr-2" />
                ) : (
                  <Copy className="h-4 w-4 mr-2" />
                )}
                {copiedId === currentVideo.id ? '복사됨' : 'HTML 복사'}
              </Button>
              {!isEditing && (
                <Button onClick={handleStartEdit} className="bg-blue-600 hover:bg-blue-700">
                  <Edit3 className="h-4 w-4 mr-2" />
                  분석 결과 편집
                </Button>
              )}
            </div>
          </div>

          {/* AI 분석 결과 또는 편집 폼 */}
          {isEditing ? (
            <EditableAnalysisResult
              videoData={currentVideo}
              onUpdate={handleUpdateVideo}
              onCancel={handleCancelEdit}
            />
          ) : (
            <PartyCard
              data={{
                rank: 1,
                score: currentVideo.analysis_result.score,
                partyData: currentVideo.analysis_result.partyData,
              }}
              season=""
              studentsMap={studentsMap}
              seasonDescription=""
              linkInfos={[{
                userId: currentVideo.id,
                youtubeUrl: currentVideo.analysis_result.url,
                score: currentVideo.analysis_result.score
              }]}
            />
          )}
        </>
      )}
    </div>
  )
}