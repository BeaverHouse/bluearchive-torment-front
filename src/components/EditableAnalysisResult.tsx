"use client"

import React, { useState, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Trash2, Plus, Save, X, Clock } from "lucide-react"
import { AnalysisResult, VideoAnalysisData, SkillOrder } from "@/types/video"
import { updateVideoAnalysis } from "@/lib/api"
import studentsData from "../../data/students.json"
import { SearchableSelect } from "@/components/SearchableSelect"

interface EditableAnalysisResultProps {
  videoData: VideoAnalysisData
  onUpdate: (updatedData: VideoAnalysisData) => void
  onCancel: () => void
}

export function EditableAnalysisResult({ videoData, onUpdate, onCancel }: EditableAnalysisResultProps) {
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult>(videoData.analysis_result)
  const [saving, setSaving] = useState(false)
  
  const studentsMap = studentsData as Record<string, string>

  const getCharacterName = useCallback((code: number): string => {
    return studentsMap[code.toString()] || `캐릭터 ${code}`
  }, [studentsMap])

  const getCharacterOptions = () => {
    return Object.entries(studentsMap).map(([code, name]) => ({
      code: parseInt(code),
      name
    })).sort((a, b) => a.name.localeCompare(b.name, 'ko'))
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      await updateVideoAnalysis(videoData.video_id, analysisResult)
      onUpdate({
        ...videoData,
        analysis_result: analysisResult
      })
    } catch (error) {
      console.error('저장 실패:', error)
      alert('저장에 실패했습니다.')
    } finally {
      setSaving(false)
    }
  }

  // 파티 데이터 업데이트
  const updatePartyData = useCallback((partyIndex: number, characterIndex: number, newCharacterCode: number) => {
    setAnalysisResult(prev => {
      const newPartyData = [...prev.partyData]
      const newParty = [...newPartyData[partyIndex]]
      
      // 캐릭터 코드를 새로운 형식으로 변환 (코드*1000 + 성급*100 + 무기*10 + 조력자여부)
      // 기본값으로 5성, 1무기, 비조력자로 설정
      const existingChar = newParty[characterIndex]
      let newCharValue = newCharacterCode * 1000 + 500 + 10 + 0 // 5성, 1무기, 비조력자
      
      // 기존에 값이 있다면 기존 설정을 유지
      if (existingChar && existingChar > 0) {
        const star = Math.floor((existingChar % 1000) / 100)
        const weapon = Math.floor((existingChar % 100) / 10)
        const assist = existingChar % 10
        newCharValue = newCharacterCode * 1000 + star * 100 + weapon * 10 + assist
      }
      
      newParty[characterIndex] = newCharValue
      newPartyData[partyIndex] = newParty
      
      return {
        ...prev,
        partyData: newPartyData
      }
    })
  }, [])

  // 파티 추가
  const addParty = useCallback(() => {
    setAnalysisResult(prev => ({
      ...prev,
      partyData: [...prev.partyData, [0, 0, 0, 0, 0, 0]] // 6자리 빈 파티
    }))
  }, [])

  // 파티 삭제
  const removeParty = useCallback((partyIndex: number) => {
    if (analysisResult.partyData.length <= 1) {
      alert('최소 1개의 파티는 있어야 합니다.')
      return
    }

    setAnalysisResult(prev => ({
      ...prev,
      partyData: prev.partyData.filter((_, index) => index !== partyIndex)
    }))
  }, [analysisResult.partyData.length])

  // 점수 업데이트
  const updateScore = useCallback((newScore: number) => {
    setAnalysisResult(prev => ({
      ...prev,
      score: newScore
    }))
  }, [])

  // URL 업데이트
  const updateUrl = useCallback((newUrl: string) => {
    setAnalysisResult(prev => ({
      ...prev,
      url: newUrl
    }))
  }, [])

  // 설명 업데이트
  const updateDescription = useCallback((newDescription: string) => {
    setAnalysisResult(prev => ({
      ...prev,
      description: newDescription
    }))
  }, [])

  // 스킬 순서 추가
  const addSkillOrder = useCallback(() => {
    const newSkill: SkillOrder = {
      party_number: 1,
      cost: 100, // 기본값 10.0 (100 = 10.0 * 10)
      remaining_time: "03:00.000",
      type: "striker",
      order: 1,
      description: ""
    }
    
    setAnalysisResult(prev => ({
      ...prev,
      skillOrders: [...prev.skillOrders, newSkill]
    }))
  }, [])

  // 스킬 순서 제거
  const removeSkillOrder = useCallback((index: number) => {
    setAnalysisResult(prev => ({
      ...prev,
      skillOrders: prev.skillOrders.filter((_, i) => i !== index)
    }))
  }, [])

  // 스킬 순서 업데이트
  const updateSkillOrder = useCallback((index: number, updates: Partial<SkillOrder>) => {
    setAnalysisResult(prev => ({
      ...prev,
      skillOrders: prev.skillOrders.map((skill, i) => 
        i === index ? { ...skill, ...updates } : skill
      )
    }))
  }, [])

  // 파티에서 사용 가능한 캐릭터 목록 가져오기
  const getPartyCharacters = useCallback((partyIndex: number) => {
    if (!analysisResult.partyData[partyIndex]) return []
    
    return analysisResult.partyData[partyIndex]
      .map((charValue, slotIndex) => {
        if (charValue === 0) return null
        
        const info = parseCharacterInfo(charValue)
        if (!info) return null
        
        return {
          code: info.code,
          name: getCharacterName(info.code),
          slotIndex,
          type: slotIndex < 4 ? 'striker' : 'special', // 첫 4개는 스트라이커, 마지막 2개는 스페셜
          order: (slotIndex < 4 ? slotIndex : slotIndex - 4) + 1
        }
      })
      .filter(Boolean)
  }, [analysisResult.partyData, getCharacterName])

  // 캐릭터 코드에서 정보 추출
  const parseCharacterInfo = (charValue: number) => {
    if (charValue === 0) return null
    
    const code = Math.floor(charValue / 1000)
    const star = Math.floor((charValue % 1000) / 100)
    const weapon = Math.floor((charValue % 100) / 10)
    const assist = charValue % 10
    
    return { code, star, weapon, assist }
  }

  // 캐릭터 세부 정보 업데이트 (성급, 무기 등)
  const updateCharacterDetails = useCallback((partyIndex: number, characterIndex: number, field: 'star' | 'weapon' | 'assist', value: number) => {
    setAnalysisResult(prev => {
      const newPartyData = [...prev.partyData]
      const newParty = [...newPartyData[partyIndex]]
      const currentChar = newParty[characterIndex]
      
      if (currentChar === 0) return prev
      
      const info = parseCharacterInfo(currentChar)
      if (!info) return prev
      
      const updates = { ...info, [field]: value }
      const newCharValue = updates.code * 1000 + updates.star * 100 + updates.weapon * 10 + updates.assist
      
      newParty[characterIndex] = newCharValue
      newPartyData[partyIndex] = newParty
      
      return {
        ...prev,
        partyData: newPartyData
      }
    })
  }, [])

  return (
    <div className="space-y-6">
      {/* 저장/취소 버튼 */}
      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={onCancel}>
          <X className="h-4 w-4 mr-2" />
          취소
        </Button>
        <Button onClick={handleSave} disabled={saving}>
          <Save className="h-4 w-4 mr-2" />
          {saving ? '저장 중...' : '저장'}
        </Button>
      </div>

      {/* 기본 정보 */}
      <Card>
        <CardHeader>
          <CardTitle>기본 정보</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium mb-2 block text-muted-foreground">점수</label>
              <Input
                type="number"
                value={analysisResult.score}
                onChange={(e) => updateScore(parseInt(e.target.value) || 0)}
                placeholder="점수를 입력하세요"
                className="h-9 w-full"
              />
            </div>
            <div>
              <label className="text-xs font-medium mb-2 block text-muted-foreground">유튜브 URL</label>
              <Input
                value={analysisResult.url}
                onChange={(e) => updateUrl(e.target.value)}
                placeholder="유튜브 URL을 입력하세요"
                className="h-9 w-full"
              />
            </div>
          </div>
          <div>
            <label className="text-xs font-medium mb-2 block text-muted-foreground">설명</label>
            <Textarea
              value={analysisResult.description || ''}
              onChange={(e) => updateDescription(e.target.value)}
              placeholder="설명을 입력하세요"
              rows={3}
              className="w-full resize-none"
            />
          </div>
        </CardContent>
      </Card>

      {/* 파티 구성 */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>파티 구성</CardTitle>
            <Button size="sm" onClick={addParty}>
              <Plus className="h-4 w-4 mr-2" />
              파티 추가
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {analysisResult.partyData.map((party, partyIndex) => (
              <Card key={partyIndex} className="relative">
                <CardContent className="px-4 py-3">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="font-medium">
                        파티 {partyIndex + 1}
                      </Badge>
                    </div>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => removeParty(partyIndex)}
                      disabled={analysisResult.partyData.length <= 1}
                      className="h-8 px-2"
                    >
                      <Trash2 className="h-4 w-4 mr-1" />
                      파티 삭제
                    </Button>
                  </div>

                  {/* 캐릭터 슬롯 */}
                  <div className="grid grid-cols-6 gap-3">
                    {party.map((charValue, charIndex) => {
                      const charInfo = parseCharacterInfo(charValue)
                      
                      return (
                        <div key={charIndex} className="border rounded-lg p-3 space-y-3 min-h-[200px] flex flex-col w-full">
                          <div className="text-xs text-center font-medium text-muted-foreground">
                            슬롯 {charIndex + 1}
                          </div>
                          
                          {/* 캐릭터 선택 */}
                          <div className="flex-1 w-full">
                            <SearchableSelect
                              options={getCharacterOptions()}
                              value={charInfo?.code?.toString() || ""}
                              onValueChange={(value) => updatePartyData(partyIndex, charIndex, parseInt(value))}
                              placeholder="캐릭터 선택"
                              className="w-full"
                            />
                          </div>
                          
                          {charInfo && (
                            <>
                              {/* 성급 + 무기 통합 셀렉트 */}
                              <div className="w-full">
                                <Select 
                                  value={`${charInfo.star}-${charInfo.weapon}`}
                                  onValueChange={(value) => {
                                    const [star, weapon] = value.split('-').map(Number)
                                    updateCharacterDetails(partyIndex, charIndex, 'star', star)
                                    updateCharacterDetails(partyIndex, charIndex, 'weapon', weapon)
                                  }}
                                >
                                  <SelectTrigger className="h-9 w-full">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {/* 성급 옵션 */}
                                    {[1, 2, 3, 4, 5].map(star => (
                                      <SelectItem key={`star-${star}`} value={`${star}-0`}>
                                        {star}성
                                      </SelectItem>
                                    ))}
                                    
                                    {/* 전용무기 옵션 */}
                                    {[1, 2, 3, 4].map(weapon => (
                                      <SelectItem key={`weapon-${weapon}`} value={`5-${weapon}`}>
                                        전{weapon}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>
                              
                              {/* 조력자 체크박스 */}
                              <div className="flex items-center justify-center space-x-2 w-full">
                                <input
                                  type="checkbox"
                                  id={`assist-${partyIndex}-${charIndex}`}
                                  checked={charInfo.assist === 1}
                                  onChange={(e) => updateCharacterDetails(partyIndex, charIndex, 'assist', e.target.checked ? 1 : 0)}
                                  className="w-4 h-4 rounded border-gray-300"
                                />
                                <label 
                                  htmlFor={`assist-${partyIndex}-${charIndex}`}
                                  className="text-xs text-gray-700 select-none"
                                >
                                  조력자
                                </label>
                              </div>
                              
                              {/* 슬롯 비우기 */}
                              <Button
                                size="sm"
                                variant="outline"
                                className="w-full h-8 text-xs"
                                onClick={() => updatePartyData(partyIndex, charIndex, 0)}
                              >
                                비우기
                              </Button>
                            </>
                          )}
                        </div>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* 스킬 순서 */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>스킬 순서</CardTitle>
            <Button size="sm" onClick={addSkillOrder}>
              <Plus className="h-4 w-4 mr-2" />
              스킬 추가
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {analysisResult.skillOrders.length === 0 ? (
            <Alert>
              <Clock className="h-4 w-4" />
              <AlertDescription>
                스킬 순서가 없습니다. &quot;스킬 추가&quot; 버튼을 클릭하여 스킬을 추가하세요.
              </AlertDescription>
            </Alert>
          ) : (
            <div className="space-y-3">
              {analysisResult.skillOrders.map((skill, index) => (
                <SkillOrderItem
                  key={index}
                  skill={skill}
                  index={index}
                  partyData={analysisResult.partyData}
                  getPartyCharacters={getPartyCharacters}
                  updateSkillOrder={updateSkillOrder}
                  removeSkillOrder={removeSkillOrder}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

// 개별 스킬 순서 아이템 컴포넌트
interface SkillOrderItemProps {
  skill: SkillOrder
  index: number
  partyData: number[][]
  getPartyCharacters: (partyIndex: number) => Array<{code: number, name: string, slotIndex: number, type: string, order: number} | null>
  updateSkillOrder: (index: number, updates: Partial<SkillOrder>) => void
  removeSkillOrder: (index: number) => void
}

function SkillOrderItem({
  skill,
  index,
  partyData,
  getPartyCharacters,
  updateSkillOrder,
  removeSkillOrder
}: SkillOrderItemProps) {
  const partyCharacters = getPartyCharacters(skill.party_number - 1)

  return (
    <Card className="border rounded-lg">
      <CardContent className="px-4 py-3">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="font-medium">
              스킬 #{index + 1}
            </Badge>
          </div>
          <Button
            size="sm"
            variant="destructive"
            onClick={() => removeSkillOrder(index)}
            className="h-8 px-2"
          >
            <Trash2 className="h-4 w-4 mr-1" />
            삭제
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
          {/* 파티 선택 */}
          <div>
            <label className="text-xs font-medium mb-2 block text-muted-foreground">파티</label>
            <Select
              value={skill.party_number.toString()}
              onValueChange={(value) => {
                const newPartyNumber = parseInt(value)
                // 파티 변경시 첫 번째 캐릭터로 초기화
                const newPartyChars = getPartyCharacters(newPartyNumber - 1)
                if (newPartyChars.length > 0 && newPartyChars[0]) {
                  updateSkillOrder(index, { 
                    party_number: newPartyNumber,
                    type: newPartyChars[0].type as "striker" | "special",
                    order: newPartyChars[0].order
                  })
                } else {
                  updateSkillOrder(index, { 
                    party_number: newPartyNumber,
                    type: "striker",
                    order: 1
                  })
                }
              }}
            >
              <SelectTrigger className="h-9 w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {partyData.map((_, partyIndex) => (
                  <SelectItem key={partyIndex} value={(partyIndex + 1).toString()}>
                    파티 {partyIndex + 1}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* 캐릭터 선택 (타입+순서 통합) */}
          <div className="md:col-span-2">
            <label className="text-xs font-medium mb-2 block text-muted-foreground">캐릭터</label>
            <Select
              value={`${skill.type}-${skill.order}`}
              onValueChange={(value) => {
                const [type, order] = value.split('-')
                updateSkillOrder(index, { 
                  type: type as "striker" | "special",
                  order: parseInt(order)
                })
              }}
            >
              <SelectTrigger className="h-9 w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {partyCharacters.map((char, charIndex) => {
                  if (!char) return null
                  return (
                    <SelectItem key={charIndex} value={`${char.type}-${char.order}`}>
                      <div className="flex items-center gap-2">
                        <img
                          src={`${process.env.NEXT_PUBLIC_CDN_URL || ""}/batorment/character/${char.code}.webp`}
                          alt={char.name}
                          className="w-6 h-6 object-cover rounded"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement
                            target.src = "/empty.webp"
                          }}
                        />
                        <span className="text-sm">{char.name}</span>
                        <span className="text-xs text-muted-foreground">
                          ({char.type === 'striker' ? '스트라이커' : '스페셜'} {char.order})
                        </span>
                      </div>
                    </SelectItem>
                  )
                })}
              </SelectContent>
            </Select>
          </div>

          {/* 코스트 */}
          <div>
            <label className="text-xs font-medium mb-2 block text-muted-foreground">코스트</label>
            <Input
              type="number"
              step="0.1"
              min="0"
              max="100"
              value={skill.cost / 10}
              onChange={(e) => updateSkillOrder(index, { cost: Math.round(parseFloat(e.target.value || "0") * 10) })}
              placeholder="0.0"
              className="h-9 w-full"
            />
          </div>

          {/* 남은 시간 */}
          <div>
            <label className="text-xs font-medium mb-2 block text-muted-foreground">시간</label>
            <Input
              value={skill.remaining_time}
              onChange={(e) => updateSkillOrder(index, { remaining_time: e.target.value })}
              placeholder="03:00.000"
              className="h-9 w-full"
            />
          </div>
        </div>

        {/* 설명 */}
        <div className="mt-3">
          <label className="text-xs font-medium mb-2 block text-muted-foreground">설명 (선택사항)</label>
          <Input
            value={skill.description || ""}
            onChange={(e) => updateSkillOrder(index, { description: e.target.value })}
            placeholder="스킬 설명을 입력하세요"
            className="h-9 w-full"
          />
        </div>
      </CardContent>
    </Card>
  )
}