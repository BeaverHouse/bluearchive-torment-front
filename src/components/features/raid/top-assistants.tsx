import CardWrapper from "@/components/common/card-wrapper";
import { Users } from "lucide-react";
import Image from "next/image";

interface Assistant {
  studentId: string;
  name: string;
  percent: number;
}

interface TopAssistantsProps {
  data: Assistant[];
  studentsMap: Record<string, string>;
}

export function TopAssistants({ data, studentsMap }: TopAssistantsProps) {
  return (
    <CardWrapper
      icon={<Users className="h-5 w-5 text-sky-500" />}
      title="Top 3 조력자"
      description="가장 많이 빌린 학생 3명이에요."
    >
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {data.map((char, index) => (
          <div
            key={char.studentId}
            className="flex items-center gap-4 p-2 rounded-lg"
          >
            <div className="relative w-16 h-16 flex-shrink-0 rounded-full overflow-hidden">
              <Image
                src={`${
                  process.env.NEXT_PUBLIC_CDN_URL || ""
                }/batorment/character/${char.studentId}.webp`}
                alt={char.name}
                fill
                className="object-cover"
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
