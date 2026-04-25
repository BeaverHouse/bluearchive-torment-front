"use client";

import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";
import Image from "next/image";
import { useStudentMaps } from "@/hooks/use-student-maps";
import { matchesStudentSearch } from "@/utils/search";
import useSearchModeStore from "@/store/useSearchModeStore";

const MAX_SELECTION = 6;

export default function ComboSelector() {
  const { studentsMap, studentSearchMap, isLoaded } = useStudentMaps();
  const comboCodes = useSearchModeStore((s) => s.comboCodes);
  const toggleComboCode = useSearchModeStore((s) => s.toggleComboCode);
  const clearCombo = useSearchModeStore((s) => s.clearCombo);

  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

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

  const selectedSet = new Set(comboCodes);

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-sm font-medium">조합 학생</span>
        <Badge variant="secondary">
          {comboCodes.length} / {MAX_SELECTION}
        </Badge>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button type="button" size="sm" variant="outline">
              학생 선택
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-3xl max-h-[90vh] flex flex-col p-0 gap-0">
            <DialogHeader className="px-6 pt-6 pb-3">
              <DialogTitle>조합 학생 선택</DialogTitle>
              <DialogDescription>
                같은 파티(편성)에 함께 들어간 학생 조합을 찾을 학생을 최대{" "}
                {MAX_SELECTION}명까지 선택하세요.
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
                <div className="grid gap-2 grid-cols-[repeat(auto-fill,minmax(80px,1fr))]">
                  {filtered.map(({ id, name }) => {
                    const selected = selectedSet.has(id);
                    const disabled =
                      !selected && comboCodes.length >= MAX_SELECTION;
                    return (
                      <button
                        key={id}
                        type="button"
                        disabled={disabled}
                        onClick={() => toggleComboCode(id)}
                        className={`relative flex flex-col items-center rounded p-2 border transition-colors ${
                          selected
                            ? "border-sky-500 bg-sky-500/10"
                            : disabled
                              ? "border-transparent opacity-30 cursor-not-allowed"
                              : "border-transparent hover:border-muted-foreground/30 cursor-pointer"
                        }`}
                      >
                        <Image
                          src={`${
                            process.env.NEXT_PUBLIC_CDN_URL || ""
                          }/batorment/character/${id}.webp`}
                          alt={name}
                          width={48}
                          height={48}
                          className={`object-cover rounded mb-1 ${
                            selected ? "" : "grayscale opacity-70"
                          }`}
                          draggable={false}
                          loading="lazy"
                          quality={75}
                        />
                        <div
                          className="text-xs text-center w-full truncate"
                          title={name}
                        >
                          {name}
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
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

      {comboCodes.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {comboCodes.map((code) => {
            const name = studentsMap[String(code)] || `${code}`;
            return (
              <button
                key={code}
                type="button"
                onClick={() => toggleComboCode(code)}
                className="flex items-center gap-1 rounded border bg-secondary px-2 py-1 text-xs hover:bg-destructive hover:text-destructive-foreground transition-colors"
                title="클릭하여 제거"
              >
                <Image
                  src={`${
                    process.env.NEXT_PUBLIC_CDN_URL || ""
                  }/batorment/character/${code}.webp`}
                  alt={name}
                  width={20}
                  height={20}
                  className="rounded"
                />
                <span>{name}</span>
                <X className="h-3 w-3" />
              </button>
            );
          })}
        </div>
      )}

      {comboCodes.length === 0 && (
        <p className="text-xs text-muted-foreground">
          학생을 선택하면 그 학생들이 같은 편성(파티)에 함께 들어간 결과만
          표시됩니다.
        </p>
      )}
    </div>
  );
}
