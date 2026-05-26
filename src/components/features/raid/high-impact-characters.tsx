import CardWrapper from "@/components/common/card-wrapper";
import { CharacterAvatar } from "@/components/common/character-image";
import { TrendingUp } from "lucide-react";
import { HighImpactCharacter } from "@/types/raid";
import { getCharacterName } from "@/utils/character";
import { useTranslations } from "@/lib/i18n";

interface HighImpactCharactersProps {
  data: HighImpactCharacter[];
  studentsMap: Record<string, string>;
}

export function HighImpactCharacters({
  data,
  studentsMap,
}: HighImpactCharactersProps) {
  const { t } = useTranslations();
  return (
    <CardWrapper
      icon={<TrendingUp className="h-5 w-5 text-red-500" />}
      title={t("party.summary.highImpact.title")}
      description={t("party.summary.highImpact.desc")}
    >
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {data.map((char) => (
          <div
            key={char.studentId}
            className="flex items-center gap-4 p-2 rounded-lg"
          >
            <CharacterAvatar
              studentId={char.studentId}
              name={getCharacterName(char.studentId, studentsMap)}
            />
            <div className="flex-1 min-w-0">
              <span className="font-bold truncate">
                {getCharacterName(char.studentId, studentsMap)}
              </span>
              <div className="text-xs text-muted-foreground mt-1">
                {t("party.summary.highImpact.best").replace("{n}", String(char.topRank))}
                <br />
                {t("party.summary.highImpact.without").replace(
                  "{n}",
                  char.withoutBestRank === 0 ? "20000+" : String(char.withoutBestRank)
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </CardWrapper>
  );
}
