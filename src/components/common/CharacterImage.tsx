"use client";

import React from "react";
import { TooltipProvider } from "@/components/ui/tooltip";
import {
  HybridTooltip,
  HybridTooltipTrigger,
  HybridTooltipContent,
} from "@/components/custom/hybridtooltip";
import { categoryMap } from "../constants";

interface CharacterImageProps {
  code: number; // Student code (5-digit or 8-digit)
  name: string; // Student name (to use in tooltip)
}

export function CharacterImage({
  code,
  name,
}: CharacterImageProps) {
  const studentID = code < 100000 ? code : Math.floor(code / 1000)
  const gradeKey = Math.floor((code % 1000) / 10)
  const isAssist = code % 10 === 1

  const borderClass = isAssist
    ? "border-2 border-green-500"
    : "border-2 border-transparent";

  return (
    <TooltipProvider>
      <HybridTooltip delayDuration={0}>
        <HybridTooltipTrigger asChild>
          <div className="flex flex-col items-center cursor-pointer select-none">
            <div className="w-9 h-9 mb-1 relative">
              <img
                src={`${
                  process.env.NEXT_PUBLIC_CDN_URL || ""
                }/batorment/character/${studentID}.webp`}
                alt={name}
                className={`w-full h-full object-cover rounded ${borderClass}`}
                draggable={false}
              />
            </div>
            <div
              className={`text-xs text-center truncate w-full ${
                isAssist
                  ? "text-green-600 font-bold"
                  : "text-muted-foreground"
              }`}
            >
              {categoryMap[gradeKey]}
            </div>
          </div>
        </HybridTooltipTrigger>
        <HybridTooltipContent side="top" sideOffset={5}>
          <p>{isAssist ? `${name} (조력자)` : name}</p>
        </HybridTooltipContent>
      </HybridTooltip>
    </TooltipProvider>
  );
}

export default CharacterImage;