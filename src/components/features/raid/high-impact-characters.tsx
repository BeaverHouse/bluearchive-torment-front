import CardWrapper from "@/components/common/card-wrapper";
import { TrendingUp } from "lucide-react";
import Image from "next/image";

interface HighImpactCharacter {
  studentId: number;
  rankGap: number;
  topRank: number;
  withoutBestRank: number;
}

interface HighImpactCharactersProps {
  data: HighImpactCharacter[];
  studentsMap: Record<string, string>;
}

export function HighImpactCharacters({
  data,
  studentsMap,
}: HighImpactCharactersProps) {
  return (
    <CardWrapper
      icon={<TrendingUp className="h-5 w-5 text-red-500" />}
      title="High Impact"
      description="없으면 점수 차가 큰 학생 3명이에요."
    >
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {data.map((char) => {
          return (
            <div
              key={char.studentId}
              className={`flex items-center gap-4 p-4 rounded-lg border bg-secondary/20 border-transparent`}
            >
              <div className="relative w-16 h-16 flex-shrink-0 rounded-full overflow-hidden border-2 border-gray-200">
                <Image
                  src={`${
                    process.env.NEXT_PUBLIC_CDN_URL || ""
                  }/batorment/character/${char.studentId}.webp`}
                  alt={
                    studentsMap[char.studentId.toString()] ||
                    `Student ${char.studentId}`
                  }
                  fill
                  className="object-cover"
                />
              </div>
              <div className="flex-1 min-w-0">
                <span className="font-bold truncate">
                  {studentsMap[char.studentId.toString()] ||
                    `Student ${char.studentId}`}
                </span>
                <div className="text-xs text-muted-foreground mt-1">
                  최고: {char.topRank}
                  <br />
                  미사용: {char.withoutBestRank}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </CardWrapper>
  );
}
