"use client";

import Image, { ImageProps } from "next/image";
import { useState } from "react";
import { getCharacterImageUrl } from "@/lib/cdn";

// SafeImage - 에러 시 fallback 처리
interface SafeImageProps extends Omit<ImageProps, "onError"> {
  fallback?: string;
}

export function SafeImage({
  src,
  alt,
  fallback = "/empty.webp",
  ...props
}: SafeImageProps) {
  const [error, setError] = useState(false);

  return (
    <Image
      src={error ? fallback : src}
      alt={alt}
      onError={() => setError(true)}
      {...props}
    />
  );
}

// CharacterImage - CDN URL + SafeImage
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
    return <SafeImage src={src} alt={alt} fill className={className} />;
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

// CharacterAvatar - 원형 wrapper + CharacterImage
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
