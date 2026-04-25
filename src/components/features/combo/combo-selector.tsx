"use client";

import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { X } from "lucide-react";
import Image from "next/image";
import { useStudentMaps } from "@/hooks/use-student-maps";
import { matchesStudentSearch } from "@/utils/search";
import useSearchModeStore from "@/store/useSearchModeStore";

const STRIKER_MAX = 4;
const SPECIAL_MAX = 2;

function isStrikerCode(code: number): boolean {
  return code >= 10000 && code < 20000;
}

function isSpecialCode(code: number): boolean {
  return code >= 20000 && code < 30000;
}

function StudentSlot({
  code,
  name,
  onClick,
  onClear,
}: {
  code: number | null;
  name?: string;
  onClick: () => void;
  onClear?: () => void;
}) {
  if (code === null) {
    return (
      <button
        type="button"
        onClick={onClick}
        className="w-10 h-10 sm:w-12 sm:h-12 rounded border border-dashed border-muted-foreground/40 hover:border-primary hover:bg-primary/5 transition-colors flex items-center justify-center text-muted-foreground"
        aria-label="학생 추가"
      >
        +
      </button>
    );
  }
  return (
    <div className="relative w-10 h-10 sm:w-12 sm:h-12">
      <Image
        src={`${
          process.env.NEXT_PUBLIC_CDN_URL || ""
        }/batorment/character/${code}.webp`}
        alt={name ?? String(code)}
        width={48}
        height={48}
        className="object-cover rounded w-full h-full"
        draggable={false}
      />
      {onClear && (
        <button
          type="button"
          onClick={onClear}
          className="absolute -top-1 -right-1 rounded-full bg-background border p-0.5 hover:bg-destructive hover:text-destructive-foreground transition-colors"
          aria-label="제거"
        >
          <X className="h-3 w-3" />
        </button>
      )}
    </div>
  );
}

export default function ComboSelector() {
  const { studentsMap, studentSearchMap, isLoaded } = useStudentMaps();
  const comboCodes = useSearchModeStore((s) => s.comboCodes);
  const toggleComboCode = useSearchModeStore((s) => s.toggleComboCode);
  const clearCombo = useSearchModeStore((s) => s.clearCombo);

  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const strikers = comboCodes.filter(isStrikerCode);
  const specials = comboCodes.filter(isSpecialCode);

  const strikerSlots: (number | null)[] = [
    ...strikers,
    ...Array(STRIKER_MAX - strikers.length).fill(null),
  ].slice(0, STRIKER_MAX);
  const specialSlots: (number | null)[] = [
    ...specials,
    ...Array(SPECIAL_MAX - specials.length).fill(null),
  ].slice(0, SPECIAL_MAX);

  const allStudents = React.useMemo(() => {
    const list: { id: number; name: string }[] = [];
    for (const [idStr, name] of Object.entries(studentsMap)) {
      const id = Number(idStr);
      if (!Number.isFinite(id)) continue;
      list.push({ id, name });
    }
    return list.sort((a, b) => a.name.localeCompare(b.name, "ko"));
  }, [studentsMap]);

  const filtered = React.useMemo(() => {
    if (!searchQuery.trim()) return allStudents;
    return allStudents.filter((s) =>
      matchesStudentSearch(String(s.id), searchQuery, studentSearchMap)
    );
  }, [allStudents, searchQuery, studentSearchMap]);

  const filteredStrikers = filtered.filter((s) => isStrikerCode(s.id));
  const filteredSpecials = filtered.filter((s) => isSpecialCode(s.id));

  const selectedSet = new Set(comboCodes);

  const renderRoleSection = (
    title: string,
    list: { id: number; name: string }[],
    role: "striker" | "special"
  ) => {
    const reachedLimit =
      role === "striker"
        ? strikers.length >= STRIKER_MAX
        : specials.length >= SPECIAL_MAX;
    return (
      <section>
        <h3 className="text-sm font-semibold mb-2 text-muted-foreground">
          {title}
        </h3>
        {list.length > 0 ? (
          <div className="grid gap-2 grid-cols-[repeat(auto-fill,minmax(80px,1fr))]">
            {list.map(({ id, name }) => {
              const selected = selectedSet.has(id);
              const disabled = !selected && reachedLimit;
              return (
                <button
                  key={id}
                  type="button"
                  disabled={disabled}
                  onClick={() => toggleComboCode(id)}
                  className={`flex flex-col items-center rounded border p-1 transition-colors ${
                    selected
                      ? "border-sky-500 bg-sky-500/10"
                      : disabled
                        ? "border-transparent opacity-30 cursor-not-allowed"
                        : "border-transparent hover:border-muted-foreground/30"
                  }`}
                  title={name}
                >
                  <div className="relative w-full aspect-square mb-1">
                    <Image
                      src={`${
                        process.env.NEXT_PUBLIC_CDN_URL || ""
                      }/batorment/character/${id}.webp`}
                      alt={name}
                      fill
                      sizes="80px"
                      className={`object-cover rounded ${
                        selected ? "" : "grayscale opacity-70"
                      }`}
                      draggable={false}
                    />
                  </div>
                  <span className="text-xs text-center w-full truncate">
                    {name}
                  </span>
                </button>
              );
            })}
          </div>
        ) : (
          <div className="text-xs text-muted-foreground">
            검색 결과가 없습니다.
          </div>
        )}
      </section>
    );
  };

  return (
    <div className="space-y-3">
      {/* 6 슬롯 (striker 4 | special 2), 중앙 정렬, 학생 이미지 사이즈에 맞춤 */}
      <div className="flex flex-wrap justify-center gap-1">
        {strikerSlots.map((code, i) => (
          <StudentSlot
            key={`s-${i}`}
            code={code}
            name={code ? studentsMap[String(code)] : undefined}
            onClick={() => setOpen(true)}
            onClear={code ? () => toggleComboCode(code) : undefined}
          />
        ))}
        {specialSlots.map((code, i) => (
          <StudentSlot
            key={`sp-${i}`}
            code={code}
            name={code ? studentsMap[String(code)] : undefined}
            onClick={() => setOpen(true)}
            onClear={code ? () => toggleComboCode(code) : undefined}
          />
        ))}
      </div>

      <div className="flex gap-2 items-center">
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={() => setOpen(true)}
        >
          학생 선택
        </Button>
        {comboCodes.length > 0 && (
          <Button
            type="button"
            size="sm"
            variant="ghost"
            onClick={clearCombo}
          >
            전체 해제
          </Button>
        )}
      </div>

      {comboCodes.length === 0 && (
        <p className="text-xs text-muted-foreground">
          학생을 선택하면 그 학생들이 같은 파티에 함께 들어간 결과만 표시됩니다.
        </p>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-3xl max-h-[90vh] flex flex-col p-0 gap-0">
          <DialogHeader className="px-6 pt-6 pb-3">
            <DialogTitle>학생 선택</DialogTitle>
            <DialogDescription>
              스트라이커 최대 {STRIKER_MAX}명, 스페셜 최대 {SPECIAL_MAX}명까지
              선택할 수 있습니다.
            </DialogDescription>
          </DialogHeader>
          <div className="px-6 pb-3">
            <Input
              type="text"
              placeholder="학생 이름 검색 (한/일/별명)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="overflow-y-auto px-6 pb-6 flex-1">
            {!isLoaded ? (
              <div className="text-center text-muted-foreground py-8">
                학생 데이터를 불러오는 중...
              </div>
            ) : (
              <div className="flex flex-col gap-6">
                {renderRoleSection(
                  `스트라이커 (${strikers.length}/${STRIKER_MAX})`,
                  filteredStrikers,
                  "striker"
                )}
                {renderRoleSection(
                  `스페셜 (${specials.length}/${SPECIAL_MAX})`,
                  filteredSpecials,
                  "special"
                )}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
