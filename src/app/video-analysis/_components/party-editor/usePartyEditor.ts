import { useCallback } from "react";
import { AnalysisResult } from "@/types/video";
import { parseCharacterInfo } from "@/utils/character";
import { CharacterOption, PartyCharacter } from "./types";

// One assist per run: giving it to a slot takes it from every other slot (the last digit).
function withoutAssists(
  partyData: number[][],
  keepParty: number,
  keepSlot: number,
): number[][] {
  return partyData.map((party, pi) =>
    party.map((value, ci) =>
      pi === keepParty && ci === keepSlot ? value : value - (value % 10),
    ),
  );
}

interface UsePartyEditorProps {
  analysisResult: AnalysisResult;
  setAnalysisResult: React.Dispatch<React.SetStateAction<AnalysisResult>>;
  studentsMap: Record<string, string>;
  t?: (key: string) => string;
}

export function usePartyEditor({
  analysisResult,
  setAnalysisResult,
  studentsMap,
  t,
}: UsePartyEditorProps) {
  const getCharacterOptions = useCallback(
    (slotIndex?: number): CharacterOption[] => {
      return Object.entries(studentsMap)
        .filter(([code]) => {
          if (slotIndex !== undefined) {
            const codeNum = parseInt(code);
            if (slotIndex < 4) {
              return codeNum >= 10000 && codeNum < 20000;
            } else {
              return codeNum >= 20000 && codeNum < 30000;
            }
          }
          return true;
        })
        .map(([code, name]) => ({
          value: parseInt(code),
          label: name,
        }))
        .sort((a, b) => a.label.localeCompare(b.label, "ko"));
    },
    [studentsMap],
  );

  const updatePartyData = useCallback(
    (partyIndex: number, characterIndex: number, newCharacterCode: number) => {
      setAnalysisResult((prev) => {
        const newPartyData = [...prev.partyData];
        const newParty = [...newPartyData[partyIndex]];

        if (newCharacterCode === 0) {
          newParty[characterIndex] = 0;
          newPartyData[partyIndex] = newParty;
          return { ...prev, partyData: newPartyData };
        }

        const existingChar = newParty[characterIndex];
        let newCharValue = newCharacterCode * 1000 + 500 + 10 + 0;

        if (existingChar && existingChar > 0) {
          const star = Math.floor((existingChar % 1000) / 100);
          const weapon = Math.floor((existingChar % 100) / 10);
          const assist = existingChar % 10;
          newCharValue =
            newCharacterCode * 1000 + star * 100 + weapon * 10 + assist;
        }

        newParty[characterIndex] = newCharValue;
        newPartyData[partyIndex] = newParty;
        return { ...prev, partyData: newPartyData };
      });
    },
    [setAnalysisResult],
  );

  const updateCharacterDetails = useCallback(
    (
      partyIndex: number,
      characterIndex: number,
      field: "star" | "weapon" | "assist",
      value: number,
    ) => {
      setAnalysisResult((prev) => {
        const info = parseCharacterInfo(
          prev.partyData[partyIndex][characterIndex],
        );
        if (!info) return prev;

        const newPartyData =
          field === "assist" && value === 1
            ? withoutAssists(prev.partyData, partyIndex, characterIndex)
            : prev.partyData.map((party) => [...party]);
        const updates = { ...info, [field]: value };
        newPartyData[partyIndex][characterIndex] =
          updates.code * 1000 +
          updates.star * 100 +
          updates.weapon * 10 +
          updates.assist;
        return { ...prev, partyData: newPartyData };
      });
    },
    [setAnalysisResult],
  );

  const addParty = useCallback(() => {
    setAnalysisResult((prev) => ({
      ...prev,
      partyData: [...prev.partyData, [0, 0, 0, 0, 0, 0]],
    }));
  }, [setAnalysisResult]);

  const removeParty = useCallback(
    (partyIndex: number) => {
      if (analysisResult.partyData.length <= 1) {
        alert(
          t
            ? t("videoAnalysis.edit.minPartyAlert")
            : "videoAnalysis.edit.minPartyAlert",
        );
        return;
      }

      setAnalysisResult((prev) => ({
        ...prev,
        partyData: prev.partyData.filter((_, index) => index !== partyIndex),
      }));
    },
    [analysisResult.partyData.length, setAnalysisResult, t],
  );

  const reorderParty = useCallback(
    (oldIndex: number, newIndex: number) => {
      setAnalysisResult((prev) => {
        const newPartyData = [...prev.partyData];
        const [moved] = newPartyData.splice(oldIndex, 1);
        newPartyData.splice(newIndex, 0, moved);
        return { ...prev, partyData: newPartyData };
      });
    },
    [setAnalysisResult],
  );

  const swapCharacter = useCallback(
    (partyIndex: number, oldSlot: number, newSlot: number) => {
      setAnalysisResult((prev) => {
        const newPartyData = [...prev.partyData];
        const newParty = [...newPartyData[partyIndex]];
        [newParty[oldSlot], newParty[newSlot]] = [
          newParty[newSlot],
          newParty[oldSlot],
        ];
        newPartyData[partyIndex] = newParty;
        return { ...prev, partyData: newPartyData };
      });
    },
    [setAnalysisResult],
  );

  const getPartyCharacters = useCallback(
    (partyIndex: number): (PartyCharacter | null)[] => {
      if (!analysisResult.partyData[partyIndex]) return [];

      return analysisResult.partyData[partyIndex].map(
        (charValue, slotIndex) => {
          if (charValue === 0) return null;

          const info = parseCharacterInfo(charValue);
          if (!info) return null;

          const name =
            studentsMap[info.code.toString()] || `Character ${info.code}`;

          return {
            code: info.code,
            name,
            slotIndex,
            type: slotIndex < 4 ? "striker" : "special",
            order: (slotIndex < 4 ? slotIndex : slotIndex - 4) + 1,
          };
        },
      );
    },
    [analysisResult.partyData, studentsMap],
  );

  return {
    getCharacterOptions,
    updatePartyData,
    updateCharacterDetails,
    addParty,
    removeParty,
    reorderParty,
    swapCharacter,
    getPartyCharacters,
    parseCharacterInfo,
  };
}
