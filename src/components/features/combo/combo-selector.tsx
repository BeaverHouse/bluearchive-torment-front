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
import { getModeIcon } from "@/constants/student-aliases";
import { Shield, Sword } from "lucide-react";
import { useTranslations } from "@/lib/i18n";

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
  const { t } = useTranslations();
  if (code === null) {
    return (
      <button
        type="button"
        onClick={onClick}
        className="w-10 h-10 sm:w-12 sm:h-12 rounded border border-dashed border-muted-foreground/40 hover:border-primary hover:bg-primary/5 transition-colors flex items-center justify-center text-muted-foreground"
        aria-label={t("combo.slot.addAria")}
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
          aria-label={t("combo.slot.removeAria")}
        >
          <X className="h-3 w-3" />
        </button>
      )}
    </div>
  );
}

export default function ComboSelector() {
  const { t } = useTranslations();
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
              const modeIcon = getModeIcon(id);
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
                    {modeIcon && (
                      <div className="absolute bottom-0 right-0 bg-gray-700/90 text-white rounded-sm p-0.5">
                        {modeIcon === "shield" ? (
                          <Shield className="h-3 w-3" />
                        ) : (
                          <Sword className="h-3 w-3" />
                        )}
                      </div>
                    )}
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
            {t("combo.dialog.noSearchResults")}
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
          {t("combo.selectButton")}
        </Button>
        {comboCodes.length > 0 && (
          <Button
            type="button"
            size="sm"
            variant="ghost"
            onClick={clearCombo}
          >
            {t("combo.clearAll")}
          </Button>
        )}
      </div>

      {comboCodes.length === 0 && (
        <p className="text-xs text-muted-foreground">
          {t("combo.helpText")}
        </p>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-3xl max-h-[90vh] flex flex-col p-0 gap-0">
          <DialogHeader className="px-6 pt-6 pb-3">
            <DialogTitle>{t("combo.dialog.title")}</DialogTitle>
            <DialogDescription>
              {t("combo.dialog.description")
                .replace("{striker}", String(STRIKER_MAX))
                .replace("{special}", String(SPECIAL_MAX))}
            </DialogDescription>
          </DialogHeader>
          <div className="px-6 pb-3">
            <Input
              type="text"
              placeholder={t("combo.dialog.searchPlaceholder")}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="overflow-y-auto px-6 pb-6 flex-1">
            {!isLoaded ? (
              <div className="text-center text-muted-foreground py-8">
                {t("combo.dialog.loadingStudents")}
              </div>
            ) : (
              <div className="flex flex-col gap-6">
                {renderRoleSection(
                  t("combo.dialog.section.striker")
                    .replace("{current}", String(strikers.length))
                    .replace("{max}", String(STRIKER_MAX)),
                  filteredStrikers,
                  "striker"
                )}
                {renderRoleSection(
                  t("combo.dialog.section.special")
                    .replace("{current}", String(specials.length))
                    .replace("{max}", String(SPECIAL_MAX)),
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
