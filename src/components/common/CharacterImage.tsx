import React from "react";
import { cn } from "@/lib/utils";
import { getCharacterImageUrl, handleImageError, getCharacterName } from "@/utils/character";

interface CharacterImageProps {
  /** 캐릭터 코드 */
  code: number;
  /** 캐릭터 이름 (선택사항, 없으면 자동으로 조회) */
  name?: string;
  /** 이미지 크기 클래스 */
  className?: string;
  /** 추가 스타일 */
  style?: React.CSSProperties;
  /** 드래그 가능 여부 */
  draggable?: boolean;
  /** 조력자 여부 (테두리 색상 변경) */
  isAssist?: boolean;
  /** 클릭 이벤트 핸들러 */
  onClick?: () => void;
  /** 터치 이벤트 핸들러 */
  onTouchStart?: (e: React.TouchEvent) => void;
  onTouchEnd?: (e: React.TouchEvent) => void;
  /** 컨텍스트 메뉴 이벤트 핸들러 */
  onContextMenu?: (e: React.MouseEvent) => void;
}

export function CharacterImage({
  code,
  name,
  className = "w-10 h-10 sm:w-12 sm:h-12",
  style,
  draggable = false,
  isAssist = false,
  onClick,
  onTouchStart,
  onTouchEnd,
  onContextMenu,
}: CharacterImageProps) {
  const characterName = name || getCharacterName(code);
  const imageUrl = getCharacterImageUrl(code);
  
  const borderClass = isAssist 
    ? "border-2 border-green-500" 
    : "border-2 border-transparent";

  return (
    <img
      src={imageUrl}
      alt={characterName}
      className={cn(
        "object-cover rounded",
        borderClass,
        className
      )}
      style={style}
      draggable={draggable}
      onError={handleImageError}
      onClick={onClick}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
      onContextMenu={onContextMenu}
    />
  );
}

export default CharacterImage;