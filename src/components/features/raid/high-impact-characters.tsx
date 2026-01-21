import CardWrapper from "@/components/common/card-wrapper";
import { CharacterImage } from "@/components/common/character-image";
import { TrendingUp } from "lucide-react";
import { HighImpactCharacter } from "@/types/raid";

interface HighImpactCharactersProps {
  data: HighImpactCharacter[];
  studentsMap: Record<string, string>;
}

export function HighImpactCharacters({
  data,
  studentsMap,
}: HighImpactCharactersProps) {
  const getStudentName = (id: number) =>
    studentsMap[id.toString()] || `Student ${id}`;

  return (
    <CardWrapper
      icon={<TrendingUp className="h-5 w-5 text-red-500" />}
      title="High Impact"
      description="사용하지 않으면 점수 차가 큰 학생 3명이에요."
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
                alt={getStudentName(char.studentId)}
                fill
              />
            </div>
            <div className="flex-1 min-w-0">
              <span className="font-bold truncate">
                {getStudentName(char.studentId)}
              </span>
              <div className="text-xs text-muted-foreground mt-1">
                최고: {char.topRank}
                <br />
                미사용: {char.withoutBestRank === 0 ? "20000+" : char.withoutBestRank}
              </div>
            </div>
          </div>
        ))}
      </div>
    </CardWrapper>
  );
}
