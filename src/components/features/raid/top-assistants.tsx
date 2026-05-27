import CardWrapper from "@/components/common/card-wrapper";
import { CharacterAvatar } from "@/components/common/character-image";
import { Users } from "lucide-react";
import { Assistant } from "@/types/raid";
import { useTranslations } from "@/lib/i18n";

interface TopAssistantsProps {
  data: Assistant[];
}

export function TopAssistants({ data }: TopAssistantsProps) {
  const { t } = useTranslations();
  return (
    <CardWrapper
      icon={<Users className="h-5 w-5 text-sky-500" />}
      title={t("party.summary.topAssist.title")}
      description={t("party.summary.topAssist.desc")}
    >
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {data.map((char) => (
          <div
            key={char.studentId}
            className="flex items-center gap-4 p-2 rounded-lg"
          >
            <CharacterAvatar studentId={char.studentId} name={char.name} />
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
