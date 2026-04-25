"use client";

import React from "react";
import Image from "next/image";
import { X } from "lucide-react";
import { StarRating } from "@/components/features/student/star-rating";
import type { GradeKey } from "@/types/pool";
import { isGradeKey } from "@/types/pool";

interface PoolStudentTileProps {
  code: number;
  name: string;
  grade: GradeKey | undefined;
  onToggle: () => void;
  onGradeChange: (grade: GradeKey) => void;
  onRemove: () => void;
}

function PoolStudentTileInner({
  code,
  name,
  grade,
  onToggle,
  onGradeChange,
  onRemove,
}: PoolStudentTileProps) {
  const owned = grade !== undefined;

  const handleGradeChange = (newValue: number) => {
    if (isGradeKey(newValue)) onGradeChange(newValue);
  };

  return (
    <div
      className={`relative flex flex-col items-center rounded p-2 border transition-colors ${
        owned
          ? "border-primary bg-primary/5"
          : "border-transparent hover:border-muted-foreground/30 cursor-pointer"
      }`}
      onClick={owned ? undefined : onToggle}
      role="button"
      tabIndex={0}
      onKeyDown={(event) => {
        if (!owned && (event.key === "Enter" || event.key === " ")) {
          event.preventDefault();
          onToggle();
        }
      }}
      aria-label={owned ? `${name} (보유)` : `${name} (미보유)`}
    >
      {owned && (
        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            onRemove();
          }}
          className="absolute top-1 right-1 rounded-full bg-background p-0.5 hover:bg-destructive hover:text-destructive-foreground transition-colors"
          aria-label={`${name} 풀에서 제거`}
        >
          <X className="w-3 h-3" />
        </button>
      )}
      <Image
        src={`${
          process.env.NEXT_PUBLIC_CDN_URL || ""
        }/batorment/character/${code}.webp`}
        alt={name}
        width={56}
        height={56}
        className={`object-cover rounded mb-1 ${owned ? "" : "grayscale opacity-60"}`}
        draggable={false}
        loading="lazy"
        quality={75}
      />
      <div className="text-xs text-center w-full truncate" title={name}>
        {name}
      </div>
      {owned ? (
        <div
          className="w-full flex justify-center"
          onClick={(event) => event.stopPropagation()}
        >
          <StarRating
            value={grade}
            onChange={handleGradeChange}
            className="flex-wrap justify-center max-w-full"
          />
        </div>
      ) : (
        <div className="h-4" />
      )}
    </div>
  );
}

export default React.memo(PoolStudentTileInner);
