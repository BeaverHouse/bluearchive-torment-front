"use client";

import Image from "next/image";
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
  X,
  MoreHorizontal,
  Minimize2,
  GripVertical,
} from "lucide-react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { SkillOrderItemProps, SortableSkillOrderItemProps } from "./types";

export function SortableSkillOrderItem(props: SortableSkillOrderItemProps) {
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
      <SkillOrderItem {...props} dragHandleProps={{ ...attributes, ...listeners }} />
    </div>
  );
}

export function SkillOrderItem({
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
                  src={`${process.env.NEXT_PUBLIC_CDN_URL || ""}/batorment/character/${currentCharacter.code}.webp`}
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
          <div>
            <label className="text-xs font-medium mb-2 block text-muted-foreground">
              파티
            </label>
            <Select
              value={skill.partyNumber.toString()}
              onValueChange={(value) => {
                const newPartyNumber = parseInt(value);
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
                  <SelectItem key={partyIndex} value={(partyIndex + 1).toString()}>
                    파티 {partyIndex + 1}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

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
                    <SelectItem key={charIndex} value={`${char.type}-${char.order}`}>
                      <div className="flex items-center gap-2">
                        <Image
                          src={`${process.env.NEXT_PUBLIC_CDN_URL || ""}/batorment/character/${char.code}.webp`}
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
                          ({char.type === "striker" ? "스트라이커" : "스페셜"} {char.order})
                        </span>
                      </div>
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>

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

          <div>
            <label className="text-xs font-medium mb-2 block text-muted-foreground">
              시간
            </label>
            <Input
              value={skill.remainingTime}
              onChange={(e) => updateSkillOrder(index, { remainingTime: e.target.value })}
              placeholder="03:00.000"
              className="h-9 w-full"
            />
          </div>
        </div>

        <div className="mt-3">
          <label className="text-xs font-medium mb-2 block text-muted-foreground">
            설명 (선택사항)
          </label>
          <Input
            value={skill.description || ""}
            onChange={(e) => updateSkillOrder(index, { description: e.target.value })}
            placeholder="스킬 설명을 입력하세요"
            className="h-9 w-full"
          />
        </div>
      </CardContent>
    </Card>
  );
}
