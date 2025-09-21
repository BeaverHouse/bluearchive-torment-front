"use client"

import React, { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { AlertTriangle, Trophy } from "lucide-react"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { PartyComposition, Character, SkillOrder } from "@/types/video"
import studentsData from "../../data/students.json"

interface AIPartyDisplayProps {
  partyCompositions: PartyComposition[]
  skillOrders: SkillOrder[]
  validationErrors?: string[]
  totalScore: number
  analysisType?: string
}

export function AIPartyDisplay({ partyCompositions, skillOrders, validationErrors, totalScore, analysisType = 'ai' }: AIPartyDisplayProps) {
  const [openTooltips, setOpenTooltips] = useState<Set<string>>(new Set())
  const [isTouchDevice, setIsTouchDevice] = useState(false)
  
  const studentsMap = studentsData as Record<string, string>

  useEffect(() => {
    setIsTouchDevice("ontouchstart" in window || navigator.maxTouchPoints > 0)
  }, [])

  const getCharacterName = (code: number): string => {
    return studentsMap[code.toString()] || `캐릭터 ${code}`
  }

  const getStarRankLabel = (character: Character): string => {
    if (character.star_rank) return character.star_rank
    if (character.star !== undefined && character.weapon_star !== undefined) {
      if (character.star === 5 && character.weapon_star > 0) {
        return `전무 ${character.weapon_star}성`
      }
      return `${character.star}★`
    }
    return "정보없음"
  }

  // 스킬 순서에서 학생 이름을 찾는 함수
  const getStudentNameFromSkill = (skill: SkillOrder): string => {
    const party = partyCompositions.find(p => p.party_number === skill.party_number)
    if (!party) return "알 수 없음"
    
    const characters = skill.type === 'striker' ? party.strikers : party.specials
    const character = characters[skill.order - 1] // order는 1부터 시작
    
    return character ? getCharacterName(character.code) : "알 수 없음"
  }

  const hasValidationErrors = analysisType === 'ai' && validationErrors && validationErrors.length > 0 && validationErrors.some(error => error.trim().length > 0)

  // 파티별 validation 에러 매핑
  const getPartyValidationErrors = (partyNumber: number): string[] => {
    if (analysisType !== 'ai' || !validationErrors) return []
    return validationErrors.filter(error => 
      error && error.trim().length > 0 && (
        error.toLowerCase().includes(`party ${partyNumber}`) || 
        error.toLowerCase().includes(`파티 ${partyNumber}`)
      )
    )
  }

  const renderCharacter = (character: Character, index: number, partyNumber: number, type: 'striker' | 'special') => {
    const name = getCharacterName(character.code)
    const starRank = getStarRankLabel(character)
    const tooltipId = `ai-party-${partyNumber}-${type}-${index}`
    const isOpen = openTooltips.has(tooltipId)
    
    // 이미지 에러 처리를 위한 대체 이미지
    const imageUrl = `${process.env.NEXT_PUBLIC_CDN_URL || ""}/batorment/character/${character.code}.webp`
    const fallbackImageUrl = "/empty.webp"

    return (
      <TooltipProvider key={index}>
        <Tooltip delayDuration={0} open={isTouchDevice ? isOpen : undefined}>
          <TooltipTrigger asChild>
            <button
              type="button"
              className="flex flex-col items-center cursor-pointer bg-transparent border-none p-0 m-0 select-none"
              style={{
                userSelect: "none",
                WebkitUserSelect: "none",
                WebkitTouchCallout: "none",
              }}
              onTouchStart={(e) => {
                const touch = e.touches[0]
                const target = e.target as HTMLElement & {
                  touchStartX?: number
                  touchStartY?: number
                  touchStartTime?: number
                }
                target.touchStartX = touch.clientX
                target.touchStartY = touch.clientY
                target.touchStartTime = Date.now()
              }}
              onTouchEnd={(e) => {
                const touch = e.changedTouches[0]
                const target = e.target as HTMLElement & {
                  touchStartX?: number
                  touchStartY?: number
                  touchStartTime?: number
                }
                const deltaX = Math.abs(touch.clientX - (target.touchStartX || 0))
                const deltaY = Math.abs(touch.clientY - (target.touchStartY || 0))
                const deltaTime = Date.now() - (target.touchStartTime || 0)

                if (deltaX < 10 && deltaY < 10 && deltaTime < 300) {
                  e.preventDefault()
                  const newTooltips = new Set(openTooltips)
                  if (isOpen) {
                    newTooltips.delete(tooltipId)
                  } else {
                    newTooltips.add(tooltipId)
                  }
                  setOpenTooltips(newTooltips)
                }
              }}
              onContextMenu={(e) => e.preventDefault()}
            >
              <div className="w-12 h-12 mb-1 relative">
                <img
                  src={imageUrl}
                  alt={name}
                  className={`w-full h-full object-cover rounded ${
                    character.is_assist
                      ? "border-2 border-green-500"
                      : "border-2 border-transparent"
                  }`}
                  draggable={false}
                  onError={(e) => {
                    const target = e.target as HTMLImageElement
                    target.src = fallbackImageUrl
                  }}
                />
              </div>
              <div
                className={`text-xs text-center truncate w-full ${
                  character.is_assist
                    ? "text-green-600 font-bold"
                    : "text-muted-foreground"
                }`}
              >
                {starRank}
              </div>
            </button>
          </TooltipTrigger>
          <TooltipContent side="top" sideOffset={5}>
            <p>{character.is_assist ? `${name} (조력자)` : name}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    )
  }


  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-blue-600" />
            {analysisType === 'ai' ? 'AI 분석' : '사용자 분석'} 파티 구성
          </span>
          <div className="flex items-center gap-2">
            <Badge className="bg-primary text-primary-foreground text-lg px-4 py-2">
              점수: {totalScore.toLocaleString()}
            </Badge>
            {hasValidationErrors && (
              <AlertTriangle className="h-5 w-5 text-orange-500" />
            )}
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {partyCompositions.map((party) => {
            const partyErrors = getPartyValidationErrors(party.party_number)
            
            return (
              <Card key={party.party_number} className="relative">
                <CardContent className="px-4 py-3">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="font-medium">
                        파티 {party.party_number}
                      </Badge>
                      {partyErrors.length > 0 && (
                        <AlertTriangle className="h-4 w-4 text-orange-500" />
                      )}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      스트라이커 {party.strikers.length}명, 스페셜 {party.specials.length}명
                    </div>
                  </div>

                  {/* 파티별 validation 에러 표시 */}
                  {partyErrors.length > 0 && (
                    <Alert className="mb-3 border-orange-200 bg-orange-50">
                      <AlertTriangle className="h-4 w-4 text-orange-500" />
                      <AlertDescription>
                        <div className="font-medium mb-1">이 파티의 검증 오류:</div>
                        <ul className="list-disc list-inside space-y-1 text-sm">
                          {partyErrors.map((error, index) => (
                            <li key={index}>{error}</li>
                          ))}
                        </ul>
                      </AlertDescription>
                    </Alert>
                  )}

                  {/* 스트라이커와 스페셜을 구분하여 표시 */}
                  <div className="flex gap-2">
                    {/* 스트라이커 섹션 - 2/3 너비 */}
                    {party.strikers.length > 0 && (
                      <div className="w-2/3">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge className="bg-blue-500 text-white text-xs">STRIKER</Badge>
                          <span className="text-xs text-muted-foreground">{party.strikers.length}명</span>
                        </div>
                        <div className="grid grid-cols-4 gap-2 p-2 rounded border bg-blue-50 dark:bg-blue-950/20 justify-items-center">
                          {party.strikers.map((character, index) => (
                            <div key={`${party.party_number}-striker-${character.code}-${index}`}>
                              {renderCharacter(character, index, party.party_number, 'striker')}
                            </div>
                          ))}
                          {/* 빈 슬롯 채우기 */}
                          {Array.from({ length: 4 - party.strikers.length }, (_, emptyIndex) => (
                            <div key={`empty-striker-${party.party_number}-${emptyIndex}`} className="w-12 h-12"></div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* 스페셜 섹션 - 1/3 너비 */}
                    {party.specials.length > 0 && (
                      <div className="w-1/3">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge className="bg-gray-500 text-white text-xs">SPECIAL</Badge>
                          <span className="text-xs text-muted-foreground">{party.specials.length}명</span>
                        </div>
                        <div className="grid grid-cols-2 gap-2 p-2 rounded border bg-gray-50 dark:bg-gray-950/20 justify-items-center">
                          {party.specials.map((character, index) => (
                            <div key={`${party.party_number}-special-${character.code}-${index}`}>
                              {renderCharacter(character, index, party.party_number, 'special')}
                            </div>
                          ))}
                          {/* 빈 슬롯 채우기 */}
                          {Array.from({ length: 2 - party.specials.length }, (_, emptyIndex) => (
                            <div key={`empty-special-${party.party_number}-${emptyIndex}`} className="w-12 h-12"></div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
        
        {/* 스킬 순서 테이블 */}
        {skillOrders.length > 0 && (
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="text-card-foreground">스킬 순서</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="max-h-96 overflow-y-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>파티</TableHead>
                      <TableHead>시간</TableHead>
                      <TableHead>학생</TableHead>
                      <TableHead>코스트</TableHead>
                      <TableHead>설명</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {skillOrders
                      .sort((a, b) => {
                        if (a.party_number !== b.party_number) {
                          return a.party_number - b.party_number
                        }
                        return b.remaining_time.localeCompare(a.remaining_time)
                      })
                      .map((skill, index) => (
                        <TableRow key={index}>
                          <TableCell>{skill.party_number}</TableCell>
                          <TableCell>{skill.remaining_time}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Badge
                                variant={skill.type === "striker" ? "default" : "secondary"}
                                className={`text-xs ${skill.type === "striker" ? "bg-blue-500" : "bg-gray-500"}`}
                              >
                                {skill.type === "striker" ? "S" : "SP"}
                              </Badge>
                              <span>{getStudentNameFromSkill(skill)}</span>
                            </div>
                          </TableCell>
                          <TableCell>{(skill.cost / 10).toFixed(1)}</TableCell>
                          <TableCell className="max-w-xs">
                            {skill.description && (
                              <div className="text-sm text-muted-foreground truncate" title={skill.description}>
                                {skill.description}
                              </div>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        )}
      </CardContent>
    </Card>
  )
}