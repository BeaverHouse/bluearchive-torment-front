import React from "react";
import { Star } from "lucide-react";

interface StarRatingProps {
  value: number; // 1-9 (10, 20, 30, 40, 50, 51, 52, 53, 54에 매핑)
  onChange: (value: number) => void;
  className?: string;
}

// gradeKey 매핑: 1성~5성(10,20,30,40,50), 전무1~4(51,52,53,54)
const gradeKeyMap = [10, 20, 30, 40, 50, 51, 52, 53, 54];
const gradeLabels = ["1성", "2성", "3성", "4성", "5성", "전무1", "전무2", "전무3", "전무4"];

export function StarRating({ value, onChange, className = "" }: StarRatingProps) {
  // gradeKey를 1-9 인덱스로 변환
  const starIndex = gradeKeyMap.indexOf(value);
  const activeStars = starIndex >= 0 ? starIndex + 1 : 1; // 최소 1개

  const handleStarClick = (index: number) => {
    // 최소 1개의 별은 활성화되어야 함
    const newIndex = Math.max(0, index);
    onChange(gradeKeyMap[newIndex]);
  };

  return (
    <div className={`flex items-center gap-0.5 ${className}`}>
      {Array.from({ length: 9 }).map((_, index) => {
        const isActive = index < activeStars;
        const isWeaponStar = index >= 5; // 6번째 별(인덱스 5)부터 전무

        return (
          <button
            key={index}
            type="button"
            onClick={() => handleStarClick(index)}
            className="p-0 hover:scale-110 transition-transform focus:outline-none"
            title={gradeLabels[index]}
          >
            <Star
              className={`w-4 h-4 ${
                isActive
                  ? isWeaponStar
                    ? "fill-blue-500 text-blue-500" // 전무: 파란색 채워진 별
                    : "fill-yellow-500 text-yellow-500" // 성급: 노란색 채워진 별
                  : isWeaponStar
                  ? "fill-none text-blue-300" // 전무: 파란색 테두리만
                  : "fill-none text-yellow-300" // 성급: 노란색 테두리만
              }`}
            />
          </button>
        );
      })}
    </div>
  );
}
