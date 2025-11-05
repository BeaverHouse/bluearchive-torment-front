"use client";

import Image from "next/image";
import React, { useState, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Trash2,
  Plus,
  Save,
  X,
  Clock,
  MoreHorizontal,
  Maximize2,
  Minimize2,
  GripVertical,
} from "lucide-react";
import { AnalysisResult, VideoAnalysisData, SkillOrder } from "@/types/video";
import { updateVideoAnalysis } from "@/lib/api";
import { SearchableSelect } from "@/components/features/video/searchable-select";
import { getStudentsMap, getCharacterName } from "@/utils/character";
import { StarRating } from "@/components/features/student/star-rating";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

interface EditableAnalysisResultProps {
  videoData: VideoAnalysisData;
  raidId?: string;
  onUpdate: (updatedData: VideoAnalysisData) => void;
  onCancel: () => void;
}

export function EditableAnalysisResult({
  videoData,
  raidId,
  onUpdate,
  onCancel,
}: EditableAnalysisResultProps) {
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult>(
    videoData.analysis_result
  );
  const [saving, setSaving] = useState(false);
  const [compactMode, setCompactMode] = useState(true); // 기본값을 컴팩트 모드로 설정

  const studentsMap = getStudentsMap();

  const getCharacterOptions = (slotIndex?: number) => {
    return Object.entries(studentsMap)
      .filter(([code]) => {
        // slotIndex가 제공되면 필터링 적용
        if (slotIndex !== undefined) {
          const codeNum = parseInt(code);
          // 슬롯 0-3: 스트라이커만 (1xxxx)
          if (slotIndex < 4) {
            return codeNum >= 10000 && codeNum < 20000;
          }
          // 슬롯 4-5: 스페셜만 (2xxxx)
          else {
            return codeNum >= 20000 && codeNum < 30000;
          }
        }
        return true;
      })
      .map(([code, name]) => ({
        value: parseInt(code),
        label: name,
      }))
      .sort((a, b) => a.label.localeCompare(b.label, "ko"));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateVideoAnalysis(videoData.video_id, analysisResult, raidId);
      onUpdate({
        ...videoData,
        analysis_result: analysisResult,
      });
    } catch (error) {
      console.error("저장 실패:", error);
      alert("저장에 실패했습니다.");
    } finally {
      setSaving(false);
    }
  };

  // 파티 데이터 업데이트
  const updatePartyData = useCallback(
    (partyIndex: number, characterIndex: number, newCharacterCode: number) => {
      setAnalysisResult((prev) => {
        const newPartyData = [...prev.partyData];
        const newParty = [...newPartyData[partyIndex]];

        // newCharacterCode가 0이면 슬롯을 비움
        if (newCharacterCode === 0) {
          newParty[characterIndex] = 0;
          newPartyData[partyIndex] = newParty;
          return {
            ...prev,
            partyData: newPartyData,
          };
        }

        // 캐릭터 코드를 새로운 형식으로 변환 (코드*1000 + 성급*100 + 무기*10 + 조력자여부)
        // 기본값으로 5성, 1무기, 비조력자로 설정
        const existingChar = newParty[characterIndex];
        let newCharValue = newCharacterCode * 1000 + 500 + 10 + 0; // 5성, 1무기, 비조력자

        // 기존에 값이 있다면 기존 설정을 유지
        if (existingChar && existingChar > 0) {
          const star = Math.floor((existingChar % 1000) / 100);
          const weapon = Math.floor((existingChar % 100) / 10);
          const assist = existingChar % 10;
          newCharValue =
            newCharacterCode * 1000 + star * 100 + weapon * 10 + assist;
        }

        newParty[characterIndex] = newCharValue;
        newPartyData[partyIndex] = newParty;

        return {
          ...prev,
          partyData: newPartyData,
        };
      });
    },
    []
  );

  // 파티 추가
  const addParty = useCallback(() => {
    setAnalysisResult((prev) => ({
      ...prev,
      partyData: [...prev.partyData, [0, 0, 0, 0, 0, 0]], // 6자리 빈 파티
    }));
  }, []);

  // 파티 삭제
  const removeParty = useCallback(
    (partyIndex: number) => {
      if (analysisResult.partyData.length <= 1) {
        alert("최소 1개의 파티는 있어야 합니다.");
        return;
      }

      setAnalysisResult((prev) => ({
        ...prev,
        partyData: prev.partyData.filter((_, index) => index !== partyIndex),
      }));
    },
    [analysisResult.partyData.length]
  );

  // 점수 업데이트
  const updateScore = useCallback((newScore: number) => {
    setAnalysisResult((prev) => ({
      ...prev,
      score: newScore,
    }));
  }, []);

  // 설명 업데이트
  const updateDescription = useCallback((newDescription: string) => {
    setAnalysisResult((prev) => ({
      ...prev,
      description: newDescription,
    }));
  }, []);

  // 스킬 순서 추가
  const addSkillOrder = useCallback(() => {
    const newSkill: SkillOrder = {
      partyNumber: 1,
      cost: 100, // 기본값 10.0 (100 = 10.0 * 10)
      remainingTime: "03:00.000",
      type: "striker",
      order: 1,
      description: "",
    };

    setAnalysisResult((prev) => ({
      ...prev,
      skillOrders: [...prev.skillOrders, newSkill],
    }));
  }, []);

  // 스킬 순서 제거
  const removeSkillOrder = useCallback((index: number) => {
    setAnalysisResult((prev) => ({
      ...prev,
      skillOrders: prev.skillOrders.filter((_, i) => i !== index),
    }));
  }, []);

  // 스킬 순서 업데이트
  const updateSkillOrder = useCallback(
    (index: number, updates: Partial<SkillOrder>) => {
      setAnalysisResult((prev) => ({
        ...prev,
        skillOrders: prev.skillOrders.map((skill, i) =>
          i === index ? { ...skill, ...updates } : skill
        ),
      }));
    },
    []
  );

  // 드래그 앤 드롭 센서 설정
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // 드래그 종료 핸들러
  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setAnalysisResult((prev) => {
        const oldIndex = prev.skillOrders.findIndex(
          (_, i) => i.toString() === active.id
        );
        const newIndex = prev.skillOrders.findIndex(
          (_, i) => i.toString() === over.id
        );

        return {
          ...prev,
          skillOrders: arrayMove(prev.skillOrders, oldIndex, newIndex),
        };
      });
    }
  }, []);

  // 파티에서 사용 가능한 캐릭터 목록 가져오기
  const getPartyCharacters = useCallback(
    (partyIndex: number) => {
      if (!analysisResult.partyData[partyIndex]) return [];

      return analysisResult.partyData[partyIndex]
        .map((charValue, slotIndex) => {
          if (charValue === 0) return null;

          const info = parseCharacterInfo(charValue);
          if (!info) return null;

          return {
            code: info.code,
            name: getCharacterName(info.code, studentsMap),
            slotIndex,
            type: slotIndex < 4 ? "striker" : "special", // 첫 4개는 스트라이커, 마지막 2개는 스페셜
            order: (slotIndex < 4 ? slotIndex : slotIndex - 4) + 1,
          };
        })
        .filter(Boolean);
    },
    [analysisResult.partyData, studentsMap]
  );

  // 캐릭터 코드에서 정보 추출
  const parseCharacterInfo = (charValue: number) => {
    if (charValue === 0) return null;

    const code = Math.floor(charValue / 1000);
    const star = Math.floor((charValue % 1000) / 100);
    const weapon = Math.floor((charValue % 100) / 10);
    const assist = charValue % 10;

    return { code, star, weapon, assist };
  };

  // 캐릭터 세부 정보 업데이트 (성급, 무기 등)
  const updateCharacterDetails = useCallback(
    (
      partyIndex: number,
      characterIndex: number,
      field: "star" | "weapon" | "assist",
      value: number
    ) => {
      setAnalysisResult((prev) => {
        const newPartyData = [...prev.partyData];
        const newParty = [...newPartyData[partyIndex]];
        const currentChar = newParty[characterIndex];

        if (currentChar === 0) return prev;

        const info = parseCharacterInfo(currentChar);
        if (!info) return prev;

        // 조력자를 체크하는 경우, 같은 파티의 다른 조력자들을 해제
        if (field === "assist" && value === 1) {
          console.log('조력자 체크 - 파티 정리 시작:', partyIndex, characterIndex);
          for (let i = 0; i < newParty.length; i++) {
            if (i !== characterIndex && newParty[i] !== 0) {
              const otherCharInfo = parseCharacterInfo(newParty[i]);
              console.log(`슬롯 ${i} 캐릭터 정보:`, otherCharInfo);
              if (otherCharInfo && otherCharInfo.assist === 1) {
                // 다른 캐릭터의 조력자 해제
                console.log(`슬롯 ${i}의 조력자 해제`);
                const updatedOtherChar =
                  otherCharInfo.code * 1000 +
                  otherCharInfo.star * 100 +
                  otherCharInfo.weapon * 10 +
                  0; // assist = 0
                newParty[i] = updatedOtherChar;
              }
            }
          }
        }

        const updates = { ...info, [field]: value };
        const newCharValue =
          updates.code * 1000 +
          updates.star * 100 +
          updates.weapon * 10 +
          updates.assist;

        newParty[characterIndex] = newCharValue;
        newPartyData[partyIndex] = newParty;

        return {
          ...prev,
          partyData: newPartyData,
        };
      });
    },
    []
  );

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
          {saving ? "저장 중..." : "저장"}
        </Button>
      </div>

      {/* 기본 정보 */}
      <Card>
        <CardHeader>
          <CardTitle>기본 정보</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-1 gap-3">
            <div>
              <label className="text-xs font-medium mb-2 block text-muted-foreground">
                점수
              </label>
              <Input
                type="number"
                value={analysisResult.score}
                onChange={(e) => updateScore(parseInt(e.target.value) || 0)}
                placeholder="점수를 입력하세요"
                className="h-9 w-full"
              />
            </div>
          </div>
          <div>
            <label className="text-xs font-medium mb-2 block text-muted-foreground">
              설명
            </label>
            <Textarea
              value={analysisResult.description || ""}
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
                      const charInfo = parseCharacterInfo(charValue);

                      return (
                        <div
                          key={`${partyIndex}-${charIndex}-${charValue}`}
                          className="border rounded-lg p-3 space-y-3 min-h-[200px] flex flex-col w-full"
                        >
                          <div className="text-xs text-center font-medium text-muted-foreground">
                            슬롯 {charIndex + 1}
                          </div>

                          {/* 캐릭터 선택 */}
                          <div className="flex-1 w-full">
                            <SearchableSelect
                              options={getCharacterOptions(charIndex)}
                              value={charInfo?.code?.toString() || ""}
                              onValueChange={(value) =>
                                updatePartyData(
                                  partyIndex,
                                  charIndex,
                                  parseInt(value)
                                )
                              }
                              placeholder={charIndex < 4 ? "스트라이커 선택" : "스페셜 선택"}
                              className="w-full"
                            />
                          </div>

                          {charInfo && (
                            <>
                              {/* 성급 별 UI */}
                              <div className="w-full flex justify-center">
                                <StarRating
                                  value={charInfo.star * 10 + charInfo.weapon}
                                  onChange={(gradeKey) => {
                                    // gradeKey: 10,20,30,40,50,51,52,53,54
                                    const star = Math.floor(gradeKey / 10);
                                    const weapon = gradeKey % 10;
                                    updateCharacterDetails(
                                      partyIndex,
                                      charIndex,
                                      "star",
                                      star
                                    );
                                    updateCharacterDetails(
                                      partyIndex,
                                      charIndex,
                                      "weapon",
                                      weapon
                                    );
                                  }}
                                />
                              </div>

                              {/* 조력자 체크박스 */}
                              <div className="flex items-center justify-center space-x-2 w-full">
                                <input
                                  type="checkbox"
                                  id={`assist-${partyIndex}-${charIndex}`}
                                  checked={charInfo.assist === 1}
                                  onChange={(e) =>
                                    updateCharacterDetails(
                                      partyIndex,
                                      charIndex,
                                      "assist",
                                      e.target.checked ? 1 : 0
                                    )
                                  }
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
                                onClick={() =>
                                  updatePartyData(partyIndex, charIndex, 0)
                                }
                              >
                                비우기
                              </Button>
                            </>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* 스킬 순서 */}
      <Card className="relative">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <CardTitle>스킬 순서</CardTitle>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCompactMode(!compactMode)}
                className="h-8"
              >
                {compactMode ? (
                  <Maximize2 className="h-4 w-4" />
                ) : (
                  <Minimize2 className="h-4 w-4" />
                )}
              </Button>
            </div>
            <Badge variant="outline" className="text-xs">
              총 {analysisResult.skillOrders.length}개
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="relative">
          {analysisResult.skillOrders.length === 0 ? (
            <Alert>
              <Clock className="h-4 w-4" />
              <AlertDescription>
                스킬 순서가 없습니다. 하단의 &quot;+&quot; 버튼을 클릭하여
                스킬을 추가하세요.
              </AlertDescription>
            </Alert>
          ) : (
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={analysisResult.skillOrders.map((_, index) =>
                  index.toString()
                )}
                strategy={verticalListSortingStrategy}
              >
                <div className="space-y-2 max-h-[70vh] overflow-y-auto pr-2">
                  {analysisResult.skillOrders.map((skill, index) => (
                    <SortableSkillOrderItem
                      key={index}
                      id={index.toString()}
                      skill={skill}
                      index={index}
                      compactMode={compactMode}
                      partyData={analysisResult.partyData}
                      getPartyCharacters={getPartyCharacters}
                      updateSkillOrder={updateSkillOrder}
                      removeSkillOrder={removeSkillOrder}
                    />
                  ))}
                </div>
              </SortableContext>
            </DndContext>
          )}

          {/* Floating 스킬 추가 버튼 */}
          <div className="sticky bottom-0 mt-4 flex justify-center">
            <Button
              onClick={addSkillOrder}
              className="rounded-full h-12 w-12 shadow-lg"
              size="icon"
            >
              <Plus className="h-6 w-6" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Sortable 스킬 순서 아이템 컴포넌트
interface SortableSkillOrderItemProps {
  id: string;
  skill: SkillOrder;
  index: number;
  compactMode: boolean;
  partyData: number[][];
  getPartyCharacters: (partyIndex: number) => Array<{
    code: number;
    name: string;
    slotIndex: number;
    type: string;
    order: number;
  } | null>;
  updateSkillOrder: (index: number, updates: Partial<SkillOrder>) => void;
  removeSkillOrder: (index: number) => void;
}

function SortableSkillOrderItem(props: SortableSkillOrderItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: props.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style}>
      <SkillOrderItem
        {...props}
        dragHandleProps={{ ...attributes, ...listeners }}
      />
    </div>
  );
}

// 개별 스킬 순서 아이템 컴포넌트
interface SkillOrderItemProps {
  skill: SkillOrder;
  index: number;
  compactMode: boolean;
  partyData: number[][];
  getPartyCharacters: (partyIndex: number) => Array<{
    code: number;
    name: string;
    slotIndex: number;
    type: string;
    order: number;
  } | null>;
  updateSkillOrder: (index: number, updates: Partial<SkillOrder>) => void;
  removeSkillOrder: (index: number) => void;
  dragHandleProps?: Record<string, unknown>;
}

function SkillOrderItem({
  skill,
  index,
  compactMode,
  partyData,
  getPartyCharacters,
  updateSkillOrder,
  removeSkillOrder,
  dragHandleProps,
}: SkillOrderItemProps) {
  const partyCharacters = getPartyCharacters(skill.partyNumber - 1);
  const [expanded, setExpanded] = useState(false);

  if (compactMode && !expanded) {
    // 컴팩트 모드 - 한 줄로 표시
    const currentCharacter = partyCharacters.find(
      (char) => char && char.type === skill.type && char.order === skill.order
    );

    return (
      <Card className="border rounded-lg bg-muted/30">
        <CardContent className="px-3 py-2">
          <div className="flex items-center gap-3">
            <div
              {...dragHandleProps}
              className="cursor-grab active:cursor-grabbing touch-none"
            >
              <GripVertical className="h-4 w-4 text-muted-foreground" />
            </div>
            <Badge variant="outline" className="text-xs font-medium min-w-fit">
              #{index + 1}
            </Badge>

            <div className="flex items-center gap-2 min-w-0 flex-1">
              {currentCharacter && (
                <Image
                  src={`${
                    process.env.NEXT_PUBLIC_CDN_URL || ""
                  }/batorment/character/${currentCharacter.code}.webp`}
                  alt={currentCharacter.name}
                  width={20}
                  height={20}
                  className="object-cover rounded flex-shrink-0"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = "/empty.webp";
                  }}
                />
              )}
              <span className="text-sm font-medium truncate">
                {currentCharacter?.name || "미선택"}
              </span>
            </div>

            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span>P{skill.partyNumber}</span>
              <span>{skill.cost / 10}</span>
              <span className="font-mono">{skill.remainingTime}</span>
            </div>

            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setExpanded(true)}
                className="h-6 w-6 p-0"
              >
                <MoreHorizontal className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => removeSkillOrder(index)}
                className="h-6 w-6 p-0 text-red-500 hover:text-red-700"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // 확장 모드 또는 기본 모드
  return (
    <Card className="border rounded-lg">
      <CardContent className="px-4 py-3">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <div
              {...dragHandleProps}
              className="cursor-grab active:cursor-grabbing touch-none"
            >
              <GripVertical className="h-4 w-4 text-muted-foreground" />
            </div>
            <Badge variant="outline" className="font-medium">
              스킬 #{index + 1}
            </Badge>
            {compactMode && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setExpanded(false)}
                className="h-6 w-6 p-0"
              >
                <Minimize2 className="h-4 w-4" />
              </Button>
            )}
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
            <label className="text-xs font-medium mb-2 block text-muted-foreground">
              파티
            </label>
            <Select
              value={skill.partyNumber.toString()}
              onValueChange={(value) => {
                const newPartyNumber = parseInt(value);
                // 파티 변경시 첫 번째 캐릭터로 초기화
                const newPartyChars = getPartyCharacters(newPartyNumber - 1);
                if (newPartyChars.length > 0 && newPartyChars[0]) {
                  updateSkillOrder(index, {
                    partyNumber: newPartyNumber,
                    type: newPartyChars[0].type as "striker" | "special",
                    order: newPartyChars[0].order,
                  });
                } else {
                  updateSkillOrder(index, {
                    partyNumber: newPartyNumber,
                    type: "striker",
                    order: 1,
                  });
                }
              }}
            >
              <SelectTrigger className="h-9 w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {partyData.map((_, partyIndex) => (
                  <SelectItem
                    key={partyIndex}
                    value={(partyIndex + 1).toString()}
                  >
                    파티 {partyIndex + 1}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* 캐릭터 선택 (타입+순서 통합) */}
          <div className="md:col-span-2">
            <label className="text-xs font-medium mb-2 block text-muted-foreground">
              캐릭터
            </label>
            <Select
              value={`${skill.type}-${skill.order}`}
              onValueChange={(value) => {
                const [type, order] = value.split("-");
                updateSkillOrder(index, {
                  type: type as "striker" | "special",
                  order: parseInt(order),
                });
              }}
            >
              <SelectTrigger className="h-9 w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {partyCharacters.map((char, charIndex) => {
                  if (!char) return null;
                  return (
                    <SelectItem
                      key={charIndex}
                      value={`${char.type}-${char.order}`}
                    >
                      <div className="flex items-center gap-2">
                        <Image
                          src={`${
                            process.env.NEXT_PUBLIC_CDN_URL || ""
                          }/batorment/character/${char.code}.webp`}
                          alt={char.name}
                          width={24}
                          height={24}
                          className="object-cover rounded"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src = "/empty.webp";
                          }}
                        />
                        <span className="text-sm">{char.name}</span>
                        <span className="text-xs text-muted-foreground">
                          ({char.type === "striker" ? "스트라이커" : "스페셜"}{" "}
                          {char.order})
                        </span>
                      </div>
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>

          {/* 코스트 */}
          <div>
            <label className="text-xs font-medium mb-2 block text-muted-foreground">
              코스트
            </label>
            <Input
              type="number"
              step="0.1"
              min="0"
              max="100"
              value={skill.cost / 10}
              onChange={(e) =>
                updateSkillOrder(index, {
                  cost: Math.round(parseFloat(e.target.value || "0") * 10),
                })
              }
              placeholder="0.0"
              className="h-9 w-full"
            />
          </div>

          {/* 남은 시간 */}
          <div>
            <label className="text-xs font-medium mb-2 block text-muted-foreground">
              시간
            </label>
            <Input
              value={skill.remainingTime}
              onChange={(e) =>
                updateSkillOrder(index, { remainingTime: e.target.value })
              }
              placeholder="03:00.000"
              className="h-9 w-full"
            />
          </div>
        </div>

        {/* 설명 */}
        <div className="mt-3">
          <label className="text-xs font-medium mb-2 block text-muted-foreground">
            설명 (선택사항)
          </label>
          <Input
            value={skill.description || ""}
            onChange={(e) =>
              updateSkillOrder(index, { description: e.target.value })
            }
            placeholder="스킬 설명을 입력하세요"
            className="h-9 w-full"
          />
        </div>
      </CardContent>
    </Card>
  );
}
