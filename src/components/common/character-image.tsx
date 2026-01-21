"use client";

import { SafeImage } from "./safe-image";
import { getCharacterImageUrl } from "@/lib/cdn";

interface CharacterImageProps {
  studentId: string | number;
  alt: string;
  size?: number;
  fill?: boolean;
  className?: string;
}

export function CharacterImage({
  studentId,
  alt,
  size,
  fill,
  className = "object-cover",
}: CharacterImageProps) {
  const src = getCharacterImageUrl(studentId);

  if (fill) {
    return (
      <SafeImage
        src={src}
        alt={alt}
        fill
        className={className}
      />
    );
  }

  return (
    <SafeImage
      src={src}
      alt={alt}
      width={size || 20}
      height={size || 20}
      className={className}
    />
  );
}
