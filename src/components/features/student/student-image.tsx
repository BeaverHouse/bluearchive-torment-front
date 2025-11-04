"use client";

import Image from "next/image";
import React from "react";
import { TooltipProvider } from "@/components/ui/tooltip";
import {
  HybridTooltip,
  HybridTooltipTrigger,
  HybridTooltipContent,
} from "@/components/ui/custom/hybrid-tooltip";
import { categoryMap } from "@/constants/assault";
import { getCharacterName } from "@/utils/character";

interface StudentImageProps {
  code: number;
}

/**
 * Single student image with tooltip
 * @param code Student code (5-digit or 8-digit)
 * @param name Student name (to use in tooltip)
 */
export function StudentImage({ code }: StudentImageProps) {
  const studentID = code < 100000 ? code : Math.floor(code / 1000);
  const studentName = getCharacterName(studentID);
  const gradeKey = code < 100000 ? -1 : Math.floor((code % 1000) / 10);
  const isAssist = code < 100000 ? 0 : code % 10 === 1;

  const borderClass = isAssist
    ? "border-2 border-sky-500"
    : "border-2 border-transparent";

  return (
    <TooltipProvider>
      <HybridTooltip delayDuration={0}>
        <HybridTooltipTrigger asChild>
          <div className="flex flex-col items-center cursor-pointer select-none">
            <div className="w-10 h-10 mb-1 relative">
              <Image
                src={`${
                  process.env.NEXT_PUBLIC_CDN_URL || ""
                }/batorment/character/${studentID}.webp`}
                alt={studentName}
                width={40}
                height={40}
                className={`object-cover rounded ${borderClass}`}
                draggable={false}
              />
            </div>
            {gradeKey >= 10 && (
              <div
                className={`text-xs text-center w-full ${
                  isAssist
                    ? "text-sky-500 font-bold"
                    : "text-muted-foreground"
                }`}
              >
                {categoryMap[gradeKey]}
              </div>
            )}
          </div>
        </HybridTooltipTrigger>
        <HybridTooltipContent side="top" sideOffset={5}>
          <p>{isAssist ? `${studentName} (A)` : studentName}</p>
        </HybridTooltipContent>
      </HybridTooltip>
    </TooltipProvider>
  );
}

export default StudentImage;
