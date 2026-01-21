"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Trash2, Plus } from "lucide-react";
import { SearchableSelect } from "@/components/features/video/searchable-select";
import { StarRating } from "@/components/features/student/star-rating";
import { parseCharacterInfo } from "@/utils/character";
import { CharacterOption } from "./types";
import { StudentSearchData } from "@/utils/search";

interface PartyEditorProps {
  partyData: number[][];
  getCharacterOptions: (slotIndex?: number) => CharacterOption[];
  onUpdateParty: (partyIndex: number, characterIndex: number, newCharacterCode: number) => void;
  onUpdateCharacterDetails: (
    partyIndex: number,
    characterIndex: number,
    field: "star" | "weapon" | "assist",
    value: number
  ) => void;
  onAddParty: () => void;
  onRemoveParty: (partyIndex: number) => void;
  studentSearchMap: StudentSearchData;
}

export function PartyEditor({
  partyData,
  getCharacterOptions,
  onUpdateParty,
  onUpdateCharacterDetails,
  onAddParty,
  onRemoveParty,
  studentSearchMap,
}: PartyEditorProps) {
  const parseCharacterInfoSafe = (charValue: number) => {
    if (charValue === 0) return null;
    return parseCharacterInfo(charValue);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>파티 구성</CardTitle>
          <Button size="sm" onClick={onAddParty}>
            <Plus className="h-4 w-4 mr-2" />
            파티 추가
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {partyData.map((party, partyIndex) => (
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
                    onClick={() => onRemoveParty(partyIndex)}
                    disabled={partyData.length <= 1}
                    className="h-8 px-2"
                  >
                    <Trash2 className="h-4 w-4 mr-1" />
                    파티 삭제
                  </Button>
                </div>

                <div className="grid grid-cols-6 gap-3">
                  {party.map((charValue, charIndex) => {
                    const charInfo = parseCharacterInfoSafe(charValue);

                    return (
                      <div
                        key={`${partyIndex}-${charIndex}-${charValue}`}
                        className="border rounded-lg p-3 space-y-3 min-h-[200px] flex flex-col w-full"
                      >
                        <div className="text-xs text-center font-medium text-muted-foreground">
                          슬롯 {charIndex + 1}
                        </div>

                        <div className="flex-1 w-full">
                          <SearchableSelect
                            options={getCharacterOptions(charIndex)}
                            value={charInfo?.code?.toString() || ""}
                            onValueChange={(value) =>
                              onUpdateParty(partyIndex, charIndex, parseInt(value))
                            }
                            placeholder={charIndex < 4 ? "스트라이커 선택" : "스페셜 선택"}
                            className="w-full"
                            studentSearchMap={studentSearchMap}
                          />
                        </div>

                        {charInfo && (
                          <>
                            <div className="w-full flex justify-center">
                              <StarRating
                                value={charInfo.star * 10 + charInfo.weapon}
                                onChange={(gradeKey) => {
                                  const star = Math.floor(gradeKey / 10);
                                  const weapon = gradeKey % 10;
                                  onUpdateCharacterDetails(partyIndex, charIndex, "star", star);
                                  onUpdateCharacterDetails(partyIndex, charIndex, "weapon", weapon);
                                }}
                              />
                            </div>

                            <div className="flex items-center justify-center space-x-2 w-full">
                              <input
                                type="checkbox"
                                id={`assist-${partyIndex}-${charIndex}`}
                                checked={charInfo.assist === 1}
                                onChange={(e) =>
                                  onUpdateCharacterDetails(
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

                            <Button
                              size="sm"
                              variant="outline"
                              className="w-full h-8 text-xs"
                              onClick={() => onUpdateParty(partyIndex, charIndex, 0)}
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
  );
}
