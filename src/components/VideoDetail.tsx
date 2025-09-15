"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { ArrowLeft, Edit3, Copy, Check } from "lucide-react"
import { YouTubeEmbed } from "@/components/YouTubeEmbed"
import { AIPartyDisplay } from "@/components/AIPartyDisplay"
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

  const getStudentNameFromSkill = (skill: any, video: VideoAnalysisData): string => {
    const party = video.analysis_result.party_compositions.find(p => p.party_number === skill.party_number)
    if (!party) return "알 수 없음"
    
    const characters = skill.type === 'striker' ? party.strikers : party.specials
    const character = characters[skill.order - 1]
    
    return character ? getCharacterName(character.code) : "알 수 없음"
  }

  const generateHTML = (video: VideoAnalysisData) => {
    const { analysis_result } = video
    
    let html = `
<div style="font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px;">
  <h2 style="color: #1f2937; margin-bottom: 20px;">분석 결과 (${video.analysis_type === 'ai' ? 'AI 분석' : '사용자 분석'})</h2>
  <p style="color: #6b7280; margin-bottom: 20px;">총점: ${analysis_result.total_score.toLocaleString()}</p>
  
  <h3 style="color: #374151; margin: 30px 0 15px 0;">파티 구성</h3>`

    analysis_result.party_compositions.forEach(party => {
      html += `
  <div style="border: 1px solid #d1d5db; border-radius: 8px; padding: 15px; margin-bottom: 15px;">
    <h4 style="color: #111827; margin: 0 0 15px 0;">파티 ${party.party_number}</h4>
    <div style="display: flex; gap: 20px;">
      <div style="flex: 2;">
        <div style="background: #dbeafe; padding: 10px; border-radius: 6px;">
          <h5 style="color: #1e40af; margin: 0 0 10px 0; font-size: 14px;">STRIKER (${party.strikers.length}명)</h5>
          <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 8px;">`

      party.strikers.forEach((character, index) => {
        const name = getCharacterName(character.code)
        const starRank = character.star ? `${character.star}★` : '정보없음'
        const weaponStar = character.weapon_star ? `전무 ${character.weapon_star}성` : '없음'
        html += `
            <div style="background: white; padding: 8px; border-radius: 4px; font-size: 12px;">
              <div style="font-weight: bold;">${index + 1}. ${name}</div>
              <div style="color: #6b7280;">${starRank} / ${weaponStar}</div>
            </div>`
      })

      html += `
          </div>
        </div>
      </div>
      <div style="flex: 1;">
        <div style="background: #f3f4f6; padding: 10px; border-radius: 6px;">
          <h5 style="color: #374151; margin: 0 0 10px 0; font-size: 14px;">SPECIAL (${party.specials.length}명)</h5>
          <div style="display: flex; flex-direction: column; gap: 8px;">`

      party.specials.forEach((character, index) => {
        const name = getCharacterName(character.code)
        const starRank = character.star ? `${character.star}★` : '정보없음'
        const weaponStar = character.weapon_star ? `전무 ${character.weapon_star}성` : '없음'
        html += `
            <div style="background: white; padding: 8px; border-radius: 4px; font-size: 12px;">
              <div style="font-weight: bold;">${index + 1}. ${name}</div>
              <div style="color: #6b7280;">${starRank} / ${weaponStar}</div>
            </div>`
      })

      html += `
          </div>
        </div>
      </div>
    </div>
  </div>`
    })

    html += `
  <h3 style="color: #374151; margin: 30px 0 15px 0;">스킬 순서</h3>
  <div style="overflow-x: auto;">
    <table style="width: 100%; border-collapse: collapse; border: 1px solid #d1d5db;">
      <thead>
        <tr style="background: #f9fafb;">
          <th style="border: 1px solid #d1d5db; padding: 8px; text-align: left; font-size: 14px;">파티</th>
          <th style="border: 1px solid #d1d5db; padding: 8px; text-align: left; font-size: 14px;">시간</th>
          <th style="border: 1px solid #d1d5db; padding: 8px; text-align: left; font-size: 14px;">학생</th>
          <th style="border: 1px solid #d1d5db; padding: 8px; text-align: left; font-size: 14px;">코스트</th>`
    
    if (analysis_result.skill_orders.some(skill => skill.description)) {
      html += `<th style="border: 1px solid #d1d5db; padding: 8px; text-align: left; font-size: 14px;">설명</th>`
    }
    
    html += `
        </tr>
      </thead>
      <tbody>`

    const sortedSkills = [...analysis_result.skill_orders].sort((a, b) => {
      if (a.party_number !== b.party_number) {
        return a.party_number - b.party_number
      }
      return b.remaining_time.localeCompare(a.remaining_time)
    })

    sortedSkills.forEach(skill => {
      const studentName = getStudentNameFromSkill(skill, video)
      const typeLabel = skill.type === 'striker' ? 'S' : 'SP'
      const cost = (skill.cost / 10).toFixed(1)
      
      html += `
        <tr>
          <td style="border: 1px solid #d1d5db; padding: 8px; font-size: 13px;">${skill.party_number}</td>
          <td style="border: 1px solid #d1d5db; padding: 8px; font-size: 13px;">${skill.remaining_time}</td>
          <td style="border: 1px solid #d1d5db; padding: 8px; font-size: 13px;">
            <span style="background: ${skill.type === 'striker' ? '#3b82f6' : '#6b7280'}; color: white; padding: 2px 6px; border-radius: 4px; font-size: 11px; margin-right: 8px;">${typeLabel}</span>
            ${studentName}
          </td>
          <td style="border: 1px solid #d1d5db; padding: 8px; font-size: 13px;">${cost}</td>`
      
      if (analysis_result.skill_orders.some(s => s.description)) {
        html += `<td style="border: 1px solid #d1d5db; padding: 8px; font-size: 13px;">${skill.description || ''}</td>`
      }
      
      html += `</tr>`
    })

    html += `
      </tbody>
    </table>
  </div>`

    if (analysis_result.description) {
      html += `
  <h3 style="color: #374151; margin: 30px 0 15px 0;">설명</h3>
  <div style="background: #f9fafb; border: 1px solid #d1d5db; border-radius: 6px; padding: 15px;">
    <p style="margin: 0; color: #374151; line-height: 1.5;">${analysis_result.description}</p>
  </div>`
    }

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
                <AIPartyDisplay 
                  partyCompositions={video.analysis_result.party_compositions}
                  skillOrders={video.analysis_result.skill_orders}
                  totalScore={video.analysis_result.total_score}
                  validationErrors={video.analysis_result.validation_errors}
                  analysisType={video.analysis_type}
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
            <AIPartyDisplay 
              partyCompositions={currentVideo.analysis_result.party_compositions}
              skillOrders={currentVideo.analysis_result.skill_orders}
              totalScore={currentVideo.analysis_result.total_score}
              validationErrors={currentVideo.analysis_result.validation_errors}
              analysisType={currentVideo.analysis_type}
            />
          )}
        </>
      )}
    </div>
  )
}