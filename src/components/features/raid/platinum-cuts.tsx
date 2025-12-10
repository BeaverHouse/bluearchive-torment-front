import CardWrapper from "@/components/common/card-wrapper";
import { Trophy } from "lucide-react";

interface PlatinumCut {
  rank: number;
  score: number;
}

interface PlatinumCutItemProps {
  cut: PlatinumCut;
  color: "red" | "amber";
}

const colorClasses = {
  red: {
    highlight: {
      container: "bg-red-50 border-2 border-red-500 dark:bg-red-950/30",
      rank: "text-red-700 dark:text-red-300",
      score: "text-red-600 dark:text-red-400",
    },
    normal: {
      container: "bg-secondary/20",
      rank: "text-muted-foreground",
      score: "text-sky-600 dark:text-sky-400",
    },
  },
  amber: {
    highlight: {
      container: "bg-amber-50 border-2 border-amber-500 dark:bg-amber-950/30",
      rank: "text-amber-700 dark:text-amber-300",
      score: "text-amber-600 dark:text-amber-400",
    },
    normal: {
      container: "bg-secondary/20",
      rank: "text-muted-foreground",
      score: "text-amber-600 dark:text-amber-400",
    },
  },
};

function PlatinumCutItem({ cut, color }: PlatinumCutItemProps) {
  const isLastCut = cut.rank === 20000;
  const classes = colorClasses[color][isLastCut ? "highlight" : "normal"];

  return (
    <div
      className={`flex flex-col items-center p-2 rounded-lg ${classes.container}`}
    >
      <span className={`text-sm font-medium ${classes.rank}`}>
        {cut.rank.toLocaleString()}등
      </span>
      <span className={`text-lg font-bold ${classes.score}`}>
        {cut.score.toLocaleString()}
      </span>
    </div>
  );
}

interface PlatinumCutsProps {
  data: PlatinumCut[];
  partPlatinumCuts?: PlatinumCut[];
}

export function PlatinumCuts({ data, partPlatinumCuts }: PlatinumCutsProps) {
  return (
    <CardWrapper
      icon={<Trophy className="h-5 w-5 text-sky-500" />}
      title="Platinum 컷"
    >
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {data.map((cut) => (
          <PlatinumCutItem key={cut.rank} cut={cut} color="red" />
        ))}
      </div>
      {partPlatinumCuts && partPlatinumCuts.length > 0 && (
        <>
          <div className="mt-4 mb-2 text-sm font-medium text-muted-foreground">
            현재 속성
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {partPlatinumCuts.map((cut) => (
              <PlatinumCutItem key={`part-${cut.rank}`} cut={cut} color="amber" />
            ))}
          </div>
        </>
      )}
    </CardWrapper>
  );
}
