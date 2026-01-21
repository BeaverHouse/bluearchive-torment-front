import CardWrapper from "@/components/common/card-wrapper";
import { CharacterImage } from "@/components/common/character-image";
import { Users } from "lucide-react";
import { Assistant } from "@/types/raid";

interface TopAssistantsProps {
  data: Assistant[];
}

export function TopAssistants({ data }: TopAssistantsProps) {
  return (
    <CardWrapper
      icon={<Users className="h-5 w-5 text-sky-500" />}
      title="Top 3 조력자"
      description="가장 많이 빌린 학생 3명이에요."
    >
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {data.map((char) => (
          <div
            key={char.studentId}
            className="flex items-center gap-4 p-2 rounded-lg"
          >
            <div className="relative w-16 h-16 flex-shrink-0 rounded-full overflow-hidden">
              <CharacterImage
                studentId={char.studentId}
                alt={char.name}
                fill
              />
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-bold truncate">{char.name}</div>
              <div className="text-sm font-bold text-sky-600 dark:text-sky-400">
                {char.percent.toFixed(1)}%
              </div>
            </div>
          </div>
        ))}
      </div>
    </CardWrapper>
  );
}
