"use client"

import React, { useState, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Trash2, Plus, Save, X, AlertTriangle } from "lucide-react"
import { AnalysisResult, VideoAnalysisData } from "@/types/video"
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
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 block">점수</label>
            <Input
              type="number"
              value={analysisResult.score}
              onChange={(e) => updateScore(parseInt(e.target.value) || 0)}
              placeholder="점수를 입력하세요"
            />
          </div>
          <div>
            <label className="text-sm font-medium mb-2 block">유튜브 URL</label>
            <Input
              value={analysisResult.url}
              onChange={(e) => updateUrl(e.target.value)}
              placeholder="유튜브 URL을 입력하세요"
            />
          </div>
          <div>
            <label className="text-sm font-medium mb-2 block">설명</label>
            <Textarea
              value={analysisResult.description || ''}
              onChange={(e) => updateDescription(e.target.value)}
              placeholder="설명을 입력하세요"
              rows={3}
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
                  <div className="grid grid-cols-6 gap-2">
                    {party.map((charValue, charIndex) => {
                      const charInfo = parseCharacterInfo(charValue)
                      
                      return (
                        <div key={charIndex} className="border rounded p-2 space-y-2">
                          <div className="text-xs text-center font-medium">
                            슬롯 {charIndex + 1}
                          </div>
                          
                          {/* 캐릭터 선택 */}
                          <SearchableSelect
                            options={getCharacterOptions()}
                            value={charInfo?.code?.toString() || ""}
                            onValueChange={(value) => updatePartyData(partyIndex, charIndex, parseInt(value))}
                            placeholder="캐릭터 선택"
                          />
                          
                          {charInfo && (
                            <>
                              {/* 성급 */}
                              <Select 
                                value={charInfo.star.toString()} 
                                onValueChange={(value) => updateCharacterDetails(partyIndex, charIndex, 'star', parseInt(value))}
                              >
                                <SelectTrigger className="h-8">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  {[1, 2, 3, 4, 5].map(star => (
                                    <SelectItem key={star} value={star.toString()}>
                                      {star}성
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              
                              {/* 무기 */}
                              <Select 
                                value={charInfo.weapon.toString()} 
                                onValueChange={(value) => updateCharacterDetails(partyIndex, charIndex, 'weapon', parseInt(value))}
                              >
                                <SelectTrigger className="h-8">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  {[0, 1, 2, 3, 4].map(weapon => (
                                    <SelectItem key={weapon} value={weapon.toString()}>
                                      {weapon === 0 ? '없음' : `전${weapon}`}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              
                              {/* 조력자 */}
                              <Select 
                                value={charInfo.assist.toString()} 
                                onValueChange={(value) => updateCharacterDetails(partyIndex, charIndex, 'assist', parseInt(value))}
                              >
                                <SelectTrigger className="h-8">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="0">일반</SelectItem>
                                  <SelectItem value="1">조력자</SelectItem>
                                </SelectContent>
                              </Select>
                              
                              {/* 캐릭터 정보 표시 */}
                              <div className="text-xs text-center p-1 bg-muted rounded">
                                <div className="font-medium">{getCharacterName(charInfo.code)}</div>
                                <div className="text-muted-foreground">
                                  {charInfo.star}성 | {charInfo.weapon === 0 ? '무기없음' : `전${charInfo.weapon}`}
                                  {charInfo.assist ? ' | 조력자' : ''}
                                </div>
                              </div>
                            </>
                          )}
                          
                          {/* 슬롯 비우기 */}
                          {charInfo && (
                            <Button
                              size="sm"
                              variant="outline"
                              className="w-full h-6 text-xs"
                              onClick={() => updatePartyData(partyIndex, charIndex, 0)}
                            >
                              비우기
                            </Button>
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

      {/* 스킬 순서는 현재 빈 배열이므로 간단한 메시지만 표시 */}
      <Card>
        <CardHeader>
          <CardTitle>스킬 순서</CardTitle>
        </CardHeader>
        <CardContent>
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              스킬 순서 기능은 현재 비어있습니다. 필요한 경우 추후 구현할 수 있습니다.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    </div>
  )
}