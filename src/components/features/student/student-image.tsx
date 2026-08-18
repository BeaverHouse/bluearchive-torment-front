"use client";

import Image from "next/image";
import React from "react";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useStudentMaps } from "@/hooks/use-student-maps";
import {
  HybridTooltip,
  HybridTooltipTrigger,
  HybridTooltipContent,
} from "@/components/ui/custom/hybrid-tooltip";
import { categoryMap } from "@/constants/assault";
import { getCharacterName } from "@/utils/character";
import { getModeIcon, getModeLabelKey } from "@/constants/student-aliases";
import { Shield, Sword } from "lucide-react";
import { useTranslations } from "@/lib/i18n";

interface StudentImageProps {
  code: number;
  size?: number;
  showModeBadge?: boolean;
  missing?: boolean;
  skillOrder?: number;
}

/**
 * Single student image with tooltip
 * @param code Student code (5-digit or 8-digit)
 * @param name Student name (to use in tooltip)
 */
export function StudentImage({
  code,
  size = 40,
  showModeBadge = true,
  missing = false,
  skillOrder,
}: StudentImageProps) {
  const { t } = useTranslations();
  const { studentsMap } = useStudentMaps();

  const studentID = React.useMemo(
    () => (code < 100000 ? code : Math.floor(code / 1000)),
    [code]
  );

  const studentName = React.useMemo(
    () => getCharacterName(studentID, studentsMap, t),
    [studentID, studentsMap, t]
  );

  const gradeKey = React.useMemo(
    () => (code < 100000 ? -1 : Math.floor((code % 1000) / 10)),
    [code]
  );

  const isAssist = React.useMemo(
    () => (code < 100000 ? 0 : code % 10 === 1),
    [code]
  );

  const borderClass = missing
    ? "border-2 border-red-500"
    : isAssist
      ? "border-2 border-sky-500"
      : "border-2 border-transparent";

  const modeIcon = getModeIcon(studentID);
  const modeLabelKey = getModeLabelKey(studentID);
  const modeLabel = modeLabelKey ? t(modeLabelKey) : undefined;
  const hasSkillOrder = skillOrder !== undefined && skillOrder >= 1 && skillOrder <= 5;
  const skillOrderLabel = hasSkillOrder
    ? t("party.party.skillOrder").replace("{n}", String(skillOrder))
    : undefined;

  return (
    <TooltipProvider>
      <HybridTooltip delayDuration={0}>
        <HybridTooltipTrigger asChild>
          <div className="flex flex-col items-center cursor-pointer select-none">
            <div className="relative">
              <Image
                src={`${
                  process.env.NEXT_PUBLIC_CDN_URL || ""
                }/batorment/character/${studentID}.webp`}
                alt={studentName}
                width={size}
                height={size}
                className={`object-cover rounded mb-1 ${borderClass}`}
                draggable={false}
                loading="lazy"
                quality={75}
                placeholder="empty"
              />
              {showModeBadge && modeIcon && (
                <div className="absolute bottom-0 right-0 bg-gray-700/90 text-white rounded-sm p-0.5">
                  {modeIcon === "shield" ? (
                    <Shield className="h-3 w-3" />
                  ) : (
                    <Sword className="h-3 w-3" />
                  )}
                </div>
              )}
              {hasSkillOrder && (
                <div
                  aria-label={skillOrderLabel}
                  role="img"
                  className={`absolute -right-1 -top-1 z-10 flex h-5 min-w-5 items-center justify-center rounded-full border-2 border-background px-1 text-[11px] font-bold leading-none shadow-sm ${
                    skillOrder !== undefined && skillOrder >= 4
                      ? "bg-sky-500 text-white"
                      : "bg-amber-400 text-slate-950"
                  }`}
                >
                  {skillOrder}
                </div>
              )}
            </div>
            {gradeKey >= 10 && (
              <div
                className={`text-xs text-center w-full ${
                  isAssist
                    ? "text-sky-500 font-bold"
                    : "text-muted-foreground"
                }`}
              >
                {t(categoryMap[gradeKey])}
              </div>
            )}
          </div>
        </HybridTooltipTrigger>
        <HybridTooltipContent side="top" sideOffset={5}>
          <p>
            {studentName}
            {showModeBadge && modeLabel ? ` (${modeLabel})` : ""}
            {isAssist ? " (A)" : ""}
          </p>
          {skillOrderLabel && <p className="text-xs text-sky-500">{skillOrderLabel}</p>}
        </HybridTooltipContent>
      </HybridTooltip>
    </TooltipProvider>
  );
}

export default React.memo(StudentImage);
