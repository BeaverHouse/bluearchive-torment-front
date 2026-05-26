import CardWrapper from "@/components/common/card-wrapper";
import { CharacterAvatar } from "@/components/common/character-image";
import { CheckCircle } from "lucide-react";
import { EssentialCharacter } from "@/types/raid";
import { getCharacterName } from "@/utils/character";
import { useTranslations } from "@/lib/i18n";

interface EssentialCharactersProps {
  data: EssentialCharacter[];
  studentsMap: Record<string, string>;
}

export function EssentialCharacters({
  data,
  studentsMap,
}: EssentialCharactersProps) {
  const { t } = useTranslations();
  return (
    <CardWrapper
      icon={<CheckCircle className="h-5 w-5 text-sky-500" />}
      title={t("party.summary.essential.title")}
      description={t("party.summary.essential.desc")}
    >
      <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-4">
        {data.map((char) => (
          <div
            key={char.studentId}
            className="flex flex-col items-center gap-2 p-2 rounded-lg"
          >
            <CharacterAvatar
              studentId={char.studentId}
              name={getCharacterName(char.studentId, studentsMap)}
            />
            <div className="text-center">
              <div className="text-sm font-medium truncate w-full max-w-[100px]">
                {getCharacterName(char.studentId, studentsMap)}
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
