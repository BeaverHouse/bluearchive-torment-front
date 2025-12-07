import CardWrapper from "@/components/common/card-wrapper";
import { CheckCircle } from "lucide-react";
import Image from "next/image";

interface EssentialCharacter {
  studentId: number;
  ratio: number;
}

interface EssentialCharactersProps {
  data: EssentialCharacter[];
  studentsMap: Record<string, string>;
}

export function EssentialCharacters({
  data,
  studentsMap,
}: EssentialCharactersProps) {
  return (
    <CardWrapper
      icon={<CheckCircle className="h-5 w-5 text-sky-500" />}
      title="필수 보유 학생"
      description="70% 이상의 플래티넘 유저가 사용했어요. 없으면 클리어나 순위 경쟁이 힘들 수도 있어요."
    >
      <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-4">
        {data.map((char) => (
          <div
            key={char.studentId}
            className="flex flex-col items-center gap-2 p-2 bg-secondary/20 rounded-lg"
          >
            <div className="relative w-16 h-16 rounded-full overflow-hidden border-2 border-sky-500">
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
            <div className="text-center">
              <div className="text-sm font-medium truncate w-full max-w-[100px]">
                {studentsMap[char.studentId.toString()] ||
                  `Student ${char.studentId}`}
              </div>
              <div className="text-xs font-bold text-sky-600 dark:text-sky-400">
                {(char.ratio * 100).toFixed(1)}%
              </div>
            </div>
          </div>
        ))}
      </div>
    </CardWrapper>
  );
}
