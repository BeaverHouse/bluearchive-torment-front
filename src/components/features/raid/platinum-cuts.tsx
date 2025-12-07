import CardWrapper from "@/components/common/card-wrapper";
import { Trophy } from "lucide-react";

interface PlatinumCut {
  rank: number;
  score: number;
}

interface PlatinumCutsProps {
  data: PlatinumCut[];
}

export function PlatinumCuts({ data }: PlatinumCutsProps) {
  return (
    <CardWrapper
      icon={<Trophy className="h-5 w-5 text-sky-500" />}
      title="Platinum 컷"
    >
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {data.map((cut) => {
          const isLastCut = cut.rank === 20000;
          return (
            <div
              key={cut.rank}
              className={`flex flex-col items-center p-2 rounded-lg ${
                isLastCut
                  ? "bg-red-50 border-2 border-red-500 dark:bg-red-950/30"
                  : "bg-secondary/20"
              }`}
            >
              <span
                className={`text-sm font-medium ${
                  isLastCut
                    ? "text-red-700 dark:text-red-300"
                    : "text-muted-foreground"
                }`}
              >
                {cut.rank.toLocaleString()}등
              </span>
              <span
                className={`text-lg font-bold ${
                  isLastCut
                    ? "text-red-600 dark:text-red-400"
                    : "text-sky-600 dark:text-sky-400"
                }`}
              >
                {cut.score.toLocaleString()}
              </span>
            </div>
          );
        })}
      </div>
    </CardWrapper>
  );
}
