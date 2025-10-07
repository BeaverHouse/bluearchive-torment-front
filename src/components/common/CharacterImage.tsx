"use client";

import React from "react";
import { TooltipProvider } from "@/components/ui/tooltip";
import {
  HybridTooltip,
  HybridTooltipTrigger,
  HybridTooltipContent,
} from "@/components/custom/hybridtooltip";
import { categoryMap } from "../constants";
import { useTouchDevice } from "@/hooks/useTouchDevice";

interface CharacterImageProps {
  code: number; // Student code (5-digit or 8-digit)
  name: string; // Student name (to use in tooltip)
}

export function CharacterImage({
  code,
  name,
}: CharacterImageProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const { isTouchDevice } = useTouchDevice();

  const studentID = code < 100000 ? code : Math.floor(code / 1000)
  const gradeKey = Math.floor((code % 1000) / 10)
  const isAssist = code % 10 === 1

  const imageUrl = `${process.env.NEXT_PUBLIC_CDN_URL || ""}/batorment/character/${code}.webp`

  const borderClass = isAssist
    ? "border-2 border-green-500"
    : "border-2 border-transparent";

  return (
    <TooltipProvider>
      <HybridTooltip
        delayDuration={0}
        open={isTouchDevice ? isOpen : undefined}
      >
        <HybridTooltipTrigger asChild>
          <button
            type="button"
            className="flex flex-col items-center cursor-pointer bg-transparent border-none p-0 m-0 select-none"
            style={{
              userSelect: "none",
              WebkitUserSelect: "none",
              WebkitTouchCallout: "none",
            }}
            onTouchStart={(e) => {
              const touch = e.touches[0];
              const target = e.target as HTMLElement & {
                touchStartX?: number;
                touchStartY?: number;
                touchStartTime?: number;
              };
              target.touchStartX = touch.clientX;
              target.touchStartY = touch.clientY;
              target.touchStartTime = Date.now();
            }}
            onTouchEnd={(e) => {
              const touch = e.changedTouches[0];
              const target = e.target as HTMLElement & {
                touchStartX?: number;
                touchStartY?: number;
                touchStartTime?: number;
              };
              const deltaX = Math.abs(
                touch.clientX -
                  (target.touchStartX || 0)
              );
              const deltaY = Math.abs(
                touch.clientY -
                  (target.touchStartY || 0)
              );
              const deltaTime =
                Date.now() -
                (target.touchStartTime || 0);

              // 터치 이동이 10px 미만이고 300ms 이내일 때만 탭으로 인식
              if (
                deltaX < 10 &&
                deltaY < 10 &&
                deltaTime < 300
              ) {
                e.preventDefault();
                setIsOpen(!isOpen);
              }
            }}
            onContextMenu={(e) => e.preventDefault()}
          >
            <div className="w-10 h-10 sm:w-12 sm:h-12 mb-1 relative">
              <img
                src={`${
                  process.env.NEXT_PUBLIC_CDN_URL || ""
                }/batorment/character/${code}.webp`}
                alt={name}
                className={`w-full h-full object-cover rounded ${
                  isAssist
                    ? "border-2 border-green-500"
                    : "border-2 border-transparent"
                }`}
                draggable={false}
              />
            </div>
            <div
              className={`text-xs sm:text-xs text-center truncate w-full ${
                isAssist
                  ? "text-green-600 font-bold"
                  : "text-muted-foreground"
              }`}
            >
              {categoryMap[gradeKey]}
            </div>
          </button>
        </HybridTooltipTrigger>
        <HybridTooltipContent side="top" sideOffset={5}>
          <p>{isAssist ? `${name} (조력자)` : name}</p>
        </HybridTooltipContent>
      </HybridTooltip>
    </TooltipProvider>
  );
}

export default CharacterImage;