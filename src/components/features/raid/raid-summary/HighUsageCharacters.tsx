"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import CardWrapper from "@/components/common/card-wrapper";
import { ThumbsUp } from "lucide-react";

interface HighUsageCharacter {
  id: string;
  name: string;
  totalUsage: number;
  usageRate: number;
}

interface HighUsageCharactersProps {
  characters: HighUsageCharacter[];
}

export function HighUsageCharacters({ characters }: HighUsageCharactersProps) {
  const [showAll, setShowAll] = useState(false);

  if (characters.length === 0) return null;

  const displayedCharacters = showAll ? characters : characters.slice(0, 8);

  return (
    <CardWrapper
      icon={<ThumbsUp className="h-5 w-5 text-sky-500" />}
      title="많이 쓰인 학생들"
      description="10% 이상 사용된 학생들이에요."
    >
      <div className="flex flex-wrap gap-2">
        {displayedCharacters.map((char) => (
          <Badge
            key={char.id}
            variant="secondary"
            className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 font-medium"
          >
            {char.name} ({char.usageRate.toFixed(1)}%)
          </Badge>
        ))}
        {!showAll && characters.length > 8 && (
          <Badge
            variant="outline"
            className="cursor-pointer hover:bg-blue-50 hover:border-blue-300 dark:hover:bg-blue-950/20"
            onClick={() => setShowAll(true)}
          >
            +{characters.length - 8} more
          </Badge>
        )}
      </div>
    </CardWrapper>
  );
}
