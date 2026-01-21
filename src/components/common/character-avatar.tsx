"use client";

import { CharacterImage } from "./character-image";

interface CharacterAvatarProps {
  studentId: number | string;
  name: string;
  size?: "sm" | "md" | "lg";
}

const sizeClasses = {
  sm: "w-10 h-10",
  md: "w-16 h-16",
  lg: "w-20 h-20",
};

export function CharacterAvatar({
  studentId,
  name,
  size = "md",
}: CharacterAvatarProps) {
  return (
    <div className={`relative ${sizeClasses[size]} flex-shrink-0 rounded-full overflow-hidden`}>
      <CharacterImage studentId={studentId} alt={name} fill />
    </div>
  );
}
