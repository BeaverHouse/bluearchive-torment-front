"use client"

import React, { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Trash2, Plus, Save, X, Edit3, AlertTriangle } from "lucide-react"
import { PartyComposition, Character, SkillOrder, AnalysisResult, VideoAnalysisData } from "@/types/video"
import { validateAnalysisResult, ValidationError } from "@/lib/validation"
import { updateVideoAnalysis } from "@/lib/api"
import studentsData from "../../data/students.json"

interface EditableAnalysisResultProps {
  videoData: VideoAnalysisData
  onUpdate: (updatedData: VideoAnalysisData) => void
  onCancel: () => void
}

export function EditableAnalysisResult({ videoData, onUpdate, onCancel }: EditableAnalysisResultProps) {
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult>(videoData.analysis_result)
  const [validationErrors, setValidationErrors] = useState<ValidationError[]>([])
  const [saving, setSaving] = useState(false)
  
  const studentsMap = studentsData as Record<string, string>

  useEffect(() => {
    // 초기 데이터 로딩 시 skill_orders에 character_code 추가
    if (analysisResult.skill_orders.length > 0 && !analysisResult.skill_orders[0].character_code) {
      const updatedSkillOrders = analysisResult.skill_orders.map(skill => ({
        ...skill,
        character_code: getSkillCharacterCode(skill)
      }))
      setAnalysisResult(prev => ({
        ...prev,
        skill_orders: updatedSkillOrders
      }))
      return
    }

    // 데이터가 변경될 때마다 검증
    const apiAnalysisResult = {
      ...analysisResult,
      skill_orders: convertSkillOrdersForAPI(analysisResult.skill_orders)
    }
    const errors = validateAnalysisResult(apiAnalysisResult)
    setValidationErrors(errors)
  }, [analysisResult])

  const getCharacterName = (code: number): string => {
    return studentsMap[code.toString()] || `캐릭터 ${code}`
  }

  const getCharacterOptions = () => {
    return Object.entries(studentsMap).map(([code, name]) => ({
      code: parseInt(code),
      name
    })).sort((a, b) => a.name.localeCompare(b.name, 'ko'))
  }

  // 특정 파티의 모든 캐릭터를 가져오는 함수
  const getPartyCharacters = (partyNumber: number) => {
    const party = analysisResult.party_compositions.find(p => p.party_number === partyNumber)
    if (!party) return []

    const characters = [
      ...party.strikers.map(char => ({ ...char, type: 'striker' as const })),
      ...party.specials.map(char => ({ ...char, type: 'special' as const }))
    ]

    return characters.map(char => ({
      code: char.code,
      name: getCharacterName(char.code),
      type: char.type
    }))
  }

  // 스킬에서 현재 선택된 캐릭터 코드를 가져오는 함수
  const getSkillCharacterCode = (skill: any): number => {
    if (skill.character_code) {
      return skill.character_code
    }
    
    // 기존 type/order로부터 캐릭터 코드 역산
    const party = analysisResult.party_compositions.find(p => p.party_number === skill.party_number)
    if (!party) return 10001

    const characters = skill.type === 'striker' ? party.strikers : party.specials
    const character = characters[skill.order - 1]
    return character ? character.code : 10001
  }

  const handleSave = async () => {
    // 스킬 순서를 API 형식으로 변환
    const apiAnalysisResult = {
      ...analysisResult,
      skill_orders: convertSkillOrdersForAPI(analysisResult.skill_orders)
    }
    
    const errors = validateAnalysisResult(apiAnalysisResult)
    if (errors.length > 0) {
      alert('검증 오류가 있습니다. 모든 오류를 수정해주세요.')
      return
    }

    try {
      setSaving(true)
      await updateVideoAnalysis(videoData.video_id, apiAnalysisResult)
      
      // 업데이트된 데이터로 부모 컴포넌트 알림
      const updatedVideoData = {
        ...videoData,
        analysis_result: apiAnalysisResult
      }
      onUpdate(updatedVideoData)
    } catch (error) {
      console.error('저장 실패:', error)
      alert('저장에 실패했습니다.')
    } finally {
      setSaving(false)
    }
  }

  const addCharacterToParty = (partyNumber: number, type: 'striker' | 'special') => {
    setAnalysisResult(prev => ({
      ...prev,
      party_compositions: prev.party_compositions.map(party => {
        if (party.party_number === partyNumber) {
          const newCharacter: Character = {
            code: 10001,
            star: 5,
            weapon_star: 1,
            is_assist: false,
            coordinate: [0, 0]
          }
          return {
            ...party,
            [type === 'striker' ? 'strikers' : 'specials']: [
              ...party[type === 'striker' ? 'strikers' : 'specials'],
              newCharacter
            ]
          }
        }
        return party
      })
    }))
  }

  const removeCharacterFromParty = (partyNumber: number, type: 'striker' | 'special', index: number) => {
    setAnalysisResult(prev => ({
      ...prev,
      party_compositions: prev.party_compositions.map(party => {
        if (party.party_number === partyNumber) {
          const characters = party[type === 'striker' ? 'strikers' : 'specials']
          return {
            ...party,
            [type === 'striker' ? 'strikers' : 'specials']: characters.filter((_, i) => i !== index)
          }
        }
        return party
      })
    }))
  }

  const updateCharacter = (partyNumber: number, type: 'striker' | 'special', index: number, updates: Partial<Character>) => {
    setAnalysisResult(prev => ({
      ...prev,
      party_compositions: prev.party_compositions.map(party => {
        if (party.party_number === partyNumber) {
          const characters = [...party[type === 'striker' ? 'strikers' : 'specials']]
          characters[index] = { ...characters[index], ...updates }
          return {
            ...party,
            [type === 'striker' ? 'strikers' : 'specials']: characters
          }
        }
        return party
      })
    }))
  }

  // 스킬 순서에서 사용할 확장된 스킬 인터페이스
  interface ExtendedSkillOrder extends SkillOrder {
    character_code?: number // UI에서만 사용
  }

  const addSkillOrder = (insertIndex?: number) => {
    const newSkill: ExtendedSkillOrder = {
      party_number: 1,
      cost: 0,
      remaining_time: "03:00.000",
      type: "striker",
      order: 1,
      character_code: 10001 // 기본값
    }
    
    setAnalysisResult(prev => {
      const newSkillOrders = [...prev.skill_orders]
      if (insertIndex !== undefined) {
        newSkillOrders.splice(insertIndex + 1, 0, newSkill)
      } else {
        newSkillOrders.push(newSkill)
      }
      return {
        ...prev,
        skill_orders: newSkillOrders
      }
    })
  }

  // 캐릭터 코드로부터 파티/타입/순서 역산
  const getCharacterPosition = (characterCode: number, partyNumber: number) => {
    const party = analysisResult.party_compositions.find(p => p.party_number === partyNumber)
    if (!party) return { type: 'striker', order: 1 }

    const strikerIndex = party.strikers.findIndex(s => s.code === characterCode)
    if (strikerIndex !== -1) {
      return { type: 'striker', order: strikerIndex + 1 }
    }

    const specialIndex = party.specials.findIndex(s => s.code === characterCode)
    if (specialIndex !== -1) {
      return { type: 'special', order: specialIndex + 1 }
    }

    return { type: 'striker', order: 1 }
  }

  // 저장 시 character_code를 제거하고 올바른 type/order로 변환
  const convertSkillOrdersForAPI = (skillOrders: any[]) => {
    return skillOrders.map((skill: any) => {
      if (skill.character_code) {
        const position = getCharacterPosition(skill.character_code, skill.party_number)
        return {
          party_number: skill.party_number,
          cost: skill.cost,
          remaining_time: skill.remaining_time,
          type: position.type,
          order: position.order,
          description: skill.description
        }
      }
      return {
        party_number: skill.party_number,
        cost: skill.cost,
        remaining_time: skill.remaining_time,
        type: skill.type,
        order: skill.order,
        description: skill.description
      }
    })
  }

  const removeSkillOrder = (index: number) => {
    setAnalysisResult(prev => ({
      ...prev,
      skill_orders: prev.skill_orders.filter((_, i) => i !== index)
    }))
  }

  const updateSkillOrder = (index: number, updates: Partial<SkillOrder>) => {
    setAnalysisResult(prev => ({
      ...prev,
      skill_orders: prev.skill_orders.map((skill, i) => 
        i === index ? { ...skill, ...updates } : skill
      )
    }))
  }

  const getPartyErrors = (partyNumber: number): ValidationError[] => {
    return validationErrors.filter(error => error.partyNumber === partyNumber)
  }

  const hasErrors = validationErrors.length > 0
  
  // 파티 구성에 문제가 있는지 확인
  const hasPartyCompositionErrors = validationErrors.some(error => 
    error.partyNumber !== undefined || 
    error.field.includes('party') || 
    error.field.includes('character')
  )

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Edit3 className="h-5 w-5 text-blue-600" />
            분석 결과 편집
          </span>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={onCancel} disabled={saving}>
              <X className="h-4 w-4 mr-1" />
              취소
            </Button>
            <Button 
              onClick={handleSave} 
              disabled={hasErrors || saving}
              className="bg-green-600 hover:bg-green-700"
            >
              <Save className="h-4 w-4 mr-1" />
              {saving ? '저장 중...' : '저장'}
            </Button>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* 기본 정보 편집 */}
        <Card className="mb-4">
          <CardHeader>
            <CardTitle className="text-lg">기본 정보</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">YouTube URL (변경 불가)</label>
              <Input
                value={analysisResult.url}
                disabled
                className="bg-muted cursor-not-allowed"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">총점</label>
              <Input
                type="number"
                value={analysisResult.total_score}
                onChange={(e) => setAnalysisResult(prev => ({ ...prev, total_score: parseInt(e.target.value) || 0 }))}
                placeholder="점수를 입력하세요"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">설명 (선택사항)</label>
              <Textarea
                value={analysisResult.description || ''}
                onChange={(e) => setAnalysisResult(prev => ({ ...prev, description: e.target.value }))}
                placeholder="분석에 대한 설명을 입력하세요"
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        {/* 전체 검증 오류 표시 */}
        {hasErrors && (
          <Alert className="mb-4 border-red-200 bg-red-50">
            <AlertTriangle className="h-4 w-4 text-red-500" />
            <AlertDescription>
              <div className="font-medium mb-2">검증 오류 ({validationErrors.length}개):</div>
              <ul className="list-disc list-inside space-y-1 text-sm">
                {validationErrors.filter(error => !error.partyNumber).map((error, index) => (
                  <li key={index}>{error.message}</li>
                ))}
              </ul>
            </AlertDescription>
          </Alert>
        )}

        {/* 파티 구성 편집 */}
        <Card className="mb-4">
          <CardHeader>
            <CardTitle className="text-lg">파티 구성</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analysisResult.party_compositions.map((party) => {
                const partyErrors = getPartyErrors(party.party_number)
                return (
                  <Card key={party.party_number} className="relative">
                    <CardContent className="px-4 py-3">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="font-medium">
                            파티 {party.party_number}
                          </Badge>
                          {partyErrors.length > 0 && (
                            <AlertTriangle className="h-4 w-4 text-red-500" />
                          )}
                        </div>
                      </div>

                      {/* 파티별 오류 표시 */}
                      {partyErrors.length > 0 && (
                        <Alert className="mb-3 border-red-200 bg-red-50">
                          <AlertTriangle className="h-4 w-4 text-red-500" />
                          <AlertDescription>
                            <ul className="list-disc list-inside space-y-1 text-sm">
                              {partyErrors.map((error, index) => (
                                <li key={index}>{error.message}</li>
                              ))}
                            </ul>
                          </AlertDescription>
                        </Alert>
                      )}

                      <div className="flex gap-4">
                        {/* 스트라이커 편집 */}
                        <div className="w-2/3">
                          <div className="flex items-center justify-between mb-2">
                            <Badge className="bg-blue-500 text-white text-xs">
                              STRIKER ({party.strikers.length}/4)
                            </Badge>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => addCharacterToParty(party.party_number, 'striker')}
                              disabled={party.strikers.length >= 4}
                            >
                              <Plus className="h-3 w-3" />
                            </Button>
                          </div>
                          <div className="grid grid-cols-2 gap-2">
                            {party.strikers.map((character, index) => (
                              <div key={index} className="border rounded p-2 bg-blue-50">
                                <div className="flex items-center justify-between mb-2">
                                  <span className="text-xs font-medium">{index + 1}번</span>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    className="h-6 w-6 p-0"
                                    onClick={() => removeCharacterFromParty(party.party_number, 'striker', index)}
                                  >
                                    <Trash2 className="h-3 w-3" />
                                  </Button>
                                </div>
                                <div className="space-y-2">
                                  <div>
                                    <label className="block text-xs font-medium mb-1">학생</label>
                                    <Select
                                      value={character.code.toString()}
                                      onValueChange={(value) => updateCharacter(party.party_number, 'striker', index, 
                                        { code: parseInt(value) })}
                                    >
                                      <SelectTrigger className="text-xs w-full">
                                        <SelectValue placeholder="학생 선택" />
                                      </SelectTrigger>
                                      <SelectContent className="max-h-60">
                                        {getCharacterOptions().map(option => (
                                          <SelectItem key={option.code} value={option.code.toString()}>
                                            <div className="flex items-center gap-2">
                                              <img 
                                                src={`${process.env.NEXT_PUBLIC_CDN_URL || ""}/batorment/character/${option.code}.webp`}
                                                alt={option.name}
                                                className="w-6 h-6 rounded object-cover"
                                                onError={(e) => {
                                                  const target = e.target as HTMLImageElement
                                                  target.src = "/empty.webp"
                                                }}
                                              />
                                              <span>{option.name}</span>
                                            </div>
                                          </SelectItem>
                                        ))}
                                      </SelectContent>
                                    </Select>
                                  </div>
                                  <div className="flex gap-1">
                                    <div className="flex-1">
                                      <label className="block text-xs font-medium mb-1">성급</label>
                                      <Select
                                        value={character.star?.toString() || "5"}
                                        onValueChange={(value) => updateCharacter(party.party_number, 'striker', index, 
                                          { star: parseInt(value) })}
                                      >
                                        <SelectTrigger className="text-xs w-full">
                                          <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                          <SelectItem value="1">1성</SelectItem>
                                          <SelectItem value="2">2성</SelectItem>
                                          <SelectItem value="3">3성</SelectItem>
                                          <SelectItem value="4">4성</SelectItem>
                                          <SelectItem value="5">5성</SelectItem>
                                        </SelectContent>
                                      </Select>
                                    </div>
                                    <div className="flex-1">
                                      <label className="block text-xs font-medium mb-1">전용무기</label>
                                      <Select
                                        value={character.weapon_star?.toString() || "1"}
                                        onValueChange={(value) => updateCharacter(party.party_number, 'striker', index, 
                                          { weapon_star: parseInt(value) })}
                                      >
                                        <SelectTrigger className="text-xs w-full">
                                          <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                          <SelectItem value="0">없음</SelectItem>
                                          <SelectItem value="1">1성</SelectItem>
                                          <SelectItem value="2">2성</SelectItem>
                                          <SelectItem value="3">3성</SelectItem>
                                          <SelectItem value="4">4성</SelectItem>
                                        </SelectContent>
                                      </Select>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* 스페셜 편집 */}
                        <div className="w-1/3">
                          <div className="flex items-center justify-between mb-2">
                            <Badge className="bg-gray-500 text-white text-xs">
                              SPECIAL ({party.specials.length}/2)
                            </Badge>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => addCharacterToParty(party.party_number, 'special')}
                              disabled={party.specials.length >= 2}
                            >
                              <Plus className="h-3 w-3" />
                            </Button>
                          </div>
                          <div className="grid grid-cols-1 gap-2">
                            {party.specials.map((character, index) => (
                              <div key={index} className="border rounded p-2 bg-gray-50">
                                <div className="flex items-center justify-between mb-2">
                                  <span className="text-xs font-medium">{index + 1}번</span>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    className="h-6 w-6 p-0"
                                    onClick={() => removeCharacterFromParty(party.party_number, 'special', index)}
                                  >
                                    <Trash2 className="h-3 w-3" />
                                  </Button>
                                </div>
                                <div className="space-y-2">
                                  <div>
                                    <label className="block text-xs font-medium mb-1">학생</label>
                                    <Select
                                      value={character.code.toString()}
                                      onValueChange={(value) => updateCharacter(party.party_number, 'special', index, 
                                        { code: parseInt(value) })}
                                    >
                                      <SelectTrigger className="text-xs w-full">
                                        <SelectValue placeholder="학생 선택" />
                                      </SelectTrigger>
                                      <SelectContent className="max-h-60">
                                        {getCharacterOptions().map(option => (
                                          <SelectItem key={option.code} value={option.code.toString()}>
                                            <div className="flex items-center gap-2">
                                              <img 
                                                src={`${process.env.NEXT_PUBLIC_CDN_URL || ""}/batorment/character/${option.code}.webp`}
                                                alt={option.name}
                                                className="w-6 h-6 rounded object-cover"
                                                onError={(e) => {
                                                  const target = e.target as HTMLImageElement
                                                  target.src = "/empty.webp"
                                                }}
                                              />
                                              <span>{option.name}</span>
                                            </div>
                                          </SelectItem>
                                        ))}
                                      </SelectContent>
                                    </Select>
                                  </div>
                                  <div className="flex gap-1">
                                    <div className="flex-1">
                                      <label className="block text-xs font-medium mb-1">성급</label>
                                      <Select
                                        value={character.star?.toString() || "5"}
                                        onValueChange={(value) => updateCharacter(party.party_number, 'special', index, 
                                          { star: parseInt(value) })}
                                      >
                                        <SelectTrigger className="text-xs w-full">
                                          <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                          <SelectItem value="1">1성</SelectItem>
                                          <SelectItem value="2">2성</SelectItem>
                                          <SelectItem value="3">3성</SelectItem>
                                          <SelectItem value="4">4성</SelectItem>
                                          <SelectItem value="5">5성</SelectItem>
                                        </SelectContent>
                                      </Select>
                                    </div>
                                    <div className="flex-1">
                                      <label className="block text-xs font-medium mb-1">전용무기</label>
                                      <Select
                                        value={character.weapon_star?.toString() || "1"}
                                        onValueChange={(value) => updateCharacter(party.party_number, 'special', index, 
                                          { weapon_star: parseInt(value) })}
                                      >
                                        <SelectTrigger className="text-xs w-full">
                                          <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                          <SelectItem value="0">없음</SelectItem>
                                          <SelectItem value="1">1성</SelectItem>
                                          <SelectItem value="2">2성</SelectItem>
                                          <SelectItem value="3">3성</SelectItem>
                                          <SelectItem value="4">4성</SelectItem>
                                        </SelectContent>
                                      </Select>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </CardContent>
        </Card>

        {/* 스킬 순서 편집 */}
        <Card className={hasPartyCompositionErrors ? "opacity-50" : ""}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg">스킬 순서</CardTitle>
                {hasPartyCompositionErrors && (
                  <p className="text-sm text-orange-500 mt-1">
                    파티 구성 오류를 먼저 수정해주세요
                  </p>
                )}
              </div>
              <Button 
                size="sm" 
                variant="outline" 
                onClick={addSkillOrder}
                disabled={hasPartyCompositionErrors}
              >
                <Plus className="h-4 w-4 mr-1" />
                스킬 추가
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {analysisResult.skill_orders.map((skill, index) => {
                const partyCharacters = getPartyCharacters(skill.party_number)
                const currentCharacterCode = getSkillCharacterCode(skill)
                
                return (
                  <div key={index}>
                    <div className="border rounded p-3 bg-muted/30">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">스킬 {index + 1}</span>
                        <div className="flex gap-1">
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-6 px-2"
                            onClick={() => addSkillOrder(index)}
                            disabled={hasPartyCompositionErrors}
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-6 w-6 p-0"
                            onClick={() => removeSkillOrder(index)}
                            disabled={hasPartyCompositionErrors}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                      <div className="grid grid-cols-4 gap-2 mb-2">
                        <div>
                          <label className="block text-xs font-medium mb-1">파티</label>
                          <Select
                            value={skill.party_number.toString()}
                            onValueChange={(value) => {
                              const newPartyNumber = parseInt(value)
                              updateSkillOrder(index, { 
                                party_number: newPartyNumber,
                                character_code: 10001 // 파티 변경시 기본 캐릭터로 리셋
                              })
                            }}
                            disabled={hasPartyCompositionErrors}
                          >
                            <SelectTrigger className="text-xs w-full">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {analysisResult.party_compositions.map(party => (
                                <SelectItem key={party.party_number} value={party.party_number.toString()}>
                                  파티 {party.party_number}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <label className="block text-xs font-medium mb-1">학생</label>
                          <Select
                            value={currentCharacterCode.toString()}
                            onValueChange={(value) => updateSkillOrder(index, { character_code: parseInt(value) })}
                            disabled={hasPartyCompositionErrors}
                          >
                            <SelectTrigger className="text-xs w-full">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {partyCharacters.map(char => (
                                <SelectItem key={char.code} value={char.code.toString()}>
                                  <div className="flex items-center gap-2">
                                    <img 
                                      src={`${process.env.NEXT_PUBLIC_CDN_URL || ""}/batorment/character/${char.code}.webp`}
                                      alt={char.name}
                                      className="w-6 h-6 rounded object-cover"
                                      onError={(e) => {
                                        const target = e.target as HTMLImageElement
                                        target.src = "/empty.webp"
                                      }}
                                    />
                                    <span>{char.name} ({char.type === 'striker' ? 'S' : 'SP'})</span>
                                  </div>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <label className="block text-xs font-medium mb-1">시간</label>
                          <Input
                            value={skill.remaining_time}
                            onChange={(e) => updateSkillOrder(index, { remaining_time: e.target.value })}
                            placeholder="03:00.000"
                            className="text-xs"
                            disabled={hasPartyCompositionErrors}
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium mb-1">코스트</label>
                          <Input
                            type="number"
                            min="0"
                            max="10"
                            step="0.1"
                            value={(skill.cost / 10).toFixed(1)}
                            onChange={(e) => updateSkillOrder(index, { cost: Math.round((parseFloat(e.target.value) || 0) * 10) })}
                            className="text-xs"
                            disabled={hasPartyCompositionErrors}
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs font-medium mb-1">설명 (선택사항)</label>
                        <Textarea
                          value={skill.description || ''}
                          onChange={(e) => updateSkillOrder(index, { description: e.target.value })}
                          placeholder="이 스킬 사용에 대한 설명을 입력하세요"
                          className="text-xs"
                          rows={2}
                          disabled={hasPartyCompositionErrors}
                        />
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      </CardContent>
    </Card>
  )
}