"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Trash2, Plus, GripVertical } from "lucide-react";
import { SearchableSelect } from "@/components/features/video/searchable-select";
import { StarRating } from "@/components/features/student/star-rating";
import { parseCharacterInfo } from "@/utils/character";
import { CharacterOption, PartyEditorProps } from "./types";
import { StudentSearchData } from "@/utils/search";
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
  horizontalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

function SortableSlot({
  slotId,
  charValue,
  charIndex,
  partyIndex,
  getCharacterOptions,
  onUpdateParty,
  onUpdateCharacterDetails,
  studentSearchMap,
}: {
  slotId: string;
  charValue: number;
  charIndex: number;
  partyIndex: number;
  getCharacterOptions: (slotIndex?: number) => CharacterOption[];
  onUpdateParty: PartyEditorProps["onUpdateParty"];
  onUpdateCharacterDetails: PartyEditorProps["onUpdateCharacterDetails"];
  studentSearchMap: StudentSearchData;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: slotId });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const charInfo = parseCharacterInfo(charValue);

  return (
    <div ref={setNodeRef} style={style} className="border rounded-lg p-2 space-y-2 flex flex-col">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-muted-foreground">
          {charIndex < 4 ? `S${charIndex + 1}` : `SP${charIndex - 3}`}
        </span>
        <button className="cursor-grab active:cursor-grabbing touch-none" {...attributes} {...listeners}>
          <GripVertical className="h-3 w-3 text-muted-foreground" />
        </button>
      </div>

      <SearchableSelect
        options={getCharacterOptions(charIndex)}
        value={charInfo?.code?.toString() || ""}
        onValueChange={(value) => onUpdateParty(partyIndex, charIndex, parseInt(value))}
        placeholder={charIndex < 4 ? "스트라이커" : "스페셜"}
        className="w-full"
        studentSearchMap={studentSearchMap}
      />

      {charInfo && (
        <>
          <div className="flex justify-center">
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

          <div className="flex items-center justify-center gap-1">
            <input
              type="checkbox"
              id={`assist-${partyIndex}-${charIndex}`}
              checked={charInfo.assist === 1}
              onChange={(e) =>
                onUpdateCharacterDetails(partyIndex, charIndex, "assist", e.target.checked ? 1 : 0)
              }
              className="w-3 h-3 rounded border-gray-300"
            />
            <label htmlFor={`assist-${partyIndex}-${charIndex}`} className="text-xs select-none">
              조력자
            </label>
          </div>

          <Button
            size="sm"
            variant="outline"
            className="w-full h-7 text-xs"
            onClick={() => onUpdateParty(partyIndex, charIndex, 0)}
          >
            비우기
          </Button>
        </>
      )}
    </div>
  );
}

function SortableParty({
  partyIndex,
  party,
  partyCount,
  getCharacterOptions,
  onUpdateParty,
  onUpdateCharacterDetails,
  onRemoveParty,
  onSwapCharacter,
  studentSearchMap,
}: {
  partyIndex: number;
  party: number[];
  partyCount: number;
  getCharacterOptions: (slotIndex?: number) => CharacterOption[];
  onUpdateParty: PartyEditorProps["onUpdateParty"];
  onUpdateCharacterDetails: PartyEditorProps["onUpdateCharacterDetails"];
  onRemoveParty: PartyEditorProps["onRemoveParty"];
  onSwapCharacter: PartyEditorProps["onSwapCharacter"];
  studentSearchMap: StudentSearchData;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: `party-${partyIndex}` });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const strikerSensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );
  const specialSensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleStrikerDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldSlot = parseInt(String(active.id).split("-")[1]);
    const newSlot = parseInt(String(over.id).split("-")[1]);
    onSwapCharacter(partyIndex, oldSlot, newSlot);
  };

  const handleSpecialDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldSlot = parseInt(String(active.id).split("-")[1]);
    const newSlot = parseInt(String(over.id).split("-")[1]);
    onSwapCharacter(partyIndex, oldSlot, newSlot);
  };

  const strikers = party.slice(0, 4);
  const specials = party.slice(4, 6);

  return (
    <Card ref={setNodeRef} style={style} className="relative">
      <CardContent className="px-4 py-3">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <button
              className="cursor-grab active:cursor-grabbing touch-none p-1"
              {...attributes}
              {...listeners}
            >
              <GripVertical className="h-4 w-4 text-muted-foreground" />
            </button>
            <Badge variant="outline" className="font-medium">파티 {partyIndex + 1}</Badge>
          </div>
          <Button
            size="sm"
            variant="destructive"
            onClick={() => onRemoveParty(partyIndex)}
            disabled={partyCount <= 1}
            className="h-8 px-2"
          >
            <Trash2 className="h-4 w-4 mr-1" />
            삭제
          </Button>
        </div>

        {/* STRIKER row */}
        <div className="mb-2">
          <span className="text-xs font-semibold text-muted-foreground mb-1 block">STRIKER</span>
          <DndContext sensors={strikerSensors} collisionDetection={closestCenter} onDragEnd={handleStrikerDragEnd}>
            <SortableContext items={strikers.map((_, i) => `slot-${i}`)} strategy={horizontalListSortingStrategy}>
              <div className="grid grid-cols-4 gap-2">
                {strikers.map((charValue, i) => (
                  <SortableSlot
                    key={`${partyIndex}-striker-${i}`}
                    slotId={`slot-${i}`}
                    charValue={charValue}
                    charIndex={i}
                    partyIndex={partyIndex}
                    getCharacterOptions={getCharacterOptions}
                    onUpdateParty={onUpdateParty}
                    onUpdateCharacterDetails={onUpdateCharacterDetails}
                    studentSearchMap={studentSearchMap}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        </div>

        {/* SPECIAL row */}
        <div>
          <span className="text-xs font-semibold text-muted-foreground mb-1 block">SPECIAL</span>
          <DndContext sensors={specialSensors} collisionDetection={closestCenter} onDragEnd={handleSpecialDragEnd}>
            <SortableContext items={specials.map((_, i) => `slot-${i + 4}`)} strategy={horizontalListSortingStrategy}>
              <div className="grid grid-cols-2 gap-2">
                {specials.map((charValue, i) => (
                  <SortableSlot
                    key={`${partyIndex}-special-${i}`}
                    slotId={`slot-${i + 4}`}
                    charValue={charValue}
                    charIndex={i + 4}
                    partyIndex={partyIndex}
                    getCharacterOptions={getCharacterOptions}
                    onUpdateParty={onUpdateParty}
                    onUpdateCharacterDetails={onUpdateCharacterDetails}
                    studentSearchMap={studentSearchMap}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        </div>
      </CardContent>
    </Card>
  );
}

export function PartyEditor({
  partyData,
  getCharacterOptions,
  onUpdateParty,
  onUpdateCharacterDetails,
  onAddParty,
  onRemoveParty,
  onReorderParty,
  onSwapCharacter,
  studentSearchMap,
}: PartyEditorProps & { getCharacterOptions: (slotIndex?: number) => CharacterOption[] }) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = partyData.findIndex((_, i) => `party-${i}` === active.id);
    const newIndex = partyData.findIndex((_, i) => `party-${i}` === over.id);
    onReorderParty(oldIndex, newIndex);
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
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={partyData.map((_, i) => `party-${i}`)} strategy={verticalListSortingStrategy}>
            <div className="space-y-4">
              {partyData.map((party, partyIndex) => (
                <SortableParty
                  key={partyIndex}
                  partyIndex={partyIndex}
                  party={party}
                  partyCount={partyData.length}
                  getCharacterOptions={getCharacterOptions}
                  onUpdateParty={onUpdateParty}
                  onUpdateCharacterDetails={onUpdateCharacterDetails}
                  onRemoveParty={onRemoveParty}
                  onSwapCharacter={onSwapCharacter}
                  studentSearchMap={studentSearchMap}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      </CardContent>
    </Card>
  );
}
