"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Clock, Plus, Maximize2, Minimize2 } from "lucide-react";
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
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { SortableSkillOrderItem } from "./SkillOrderItem";
import { SkillOrderListProps } from "./types";

export function SkillOrderList({
  skillOrders,
  partyData,
  compactMode,
  onToggleCompactMode,
  onAddSkillOrder,
  onRemoveSkillOrder,
  onUpdateSkillOrder,
  onReorder,
  getPartyCharacters,
}: SkillOrderListProps) {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = skillOrders.findIndex((_, i) => i.toString() === active.id);
      const newIndex = skillOrders.findIndex((_, i) => i.toString() === over.id);
      onReorder(oldIndex, newIndex);
    }
  };

  return (
    <Card className="relative">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <CardTitle>스킬 순서</CardTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={onToggleCompactMode}
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
            총 {skillOrders.length}개
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="relative">
        {skillOrders.length === 0 ? (
          <Alert>
            <Clock className="h-4 w-4" />
            <AlertDescription>
              스킬 순서가 없습니다. 하단의 &quot;+&quot; 버튼을 클릭하여 스킬을 추가하세요.
            </AlertDescription>
          </Alert>
        ) : (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={skillOrders.map((_, index) => index.toString())}
              strategy={verticalListSortingStrategy}
            >
              <div className="space-y-2 max-h-[70vh] overflow-y-auto pr-2">
                {skillOrders.map((skill, index) => (
                  <SortableSkillOrderItem
                    key={index}
                    id={index.toString()}
                    skill={skill}
                    index={index}
                    compactMode={compactMode}
                    partyData={partyData}
                    getPartyCharacters={getPartyCharacters}
                    updateSkillOrder={onUpdateSkillOrder}
                    removeSkillOrder={onRemoveSkillOrder}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        )}

        <div className="sticky bottom-0 mt-4 flex justify-center">
          <Button
            onClick={onAddSkillOrder}
            className="rounded-full h-12 w-12 shadow-lg"
            size="icon"
          >
            <Plus className="h-6 w-6" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
