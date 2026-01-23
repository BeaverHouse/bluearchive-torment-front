import { useCallback } from "react";
import { AnalysisResult } from "@/types/video";
import { parseCharacterInfo } from "@/utils/character";
import { CharacterOption, PartyCharacter } from "../types";

interface UsePartyEditorProps {
  analysisResult: AnalysisResult;
  setAnalysisResult: React.Dispatch<React.SetStateAction<AnalysisResult>>;
  studentsMap: Record<string, string>;
}

export function usePartyEditor({
  analysisResult,
  setAnalysisResult,
  studentsMap,
}: UsePartyEditorProps) {
  const parseCharacterInfoSafe = (charValue: number) => {
    if (charValue === 0) return null;
    return parseCharacterInfo(charValue);
  };

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
    [studentsMap]
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
          newCharValue = newCharacterCode * 1000 + star * 100 + weapon * 10 + assist;
        }

        newParty[characterIndex] = newCharValue;
        newPartyData[partyIndex] = newParty;
        return { ...prev, partyData: newPartyData };
      });
    },
    [setAnalysisResult]
  );

  const updateCharacterDetails = useCallback(
    (
      partyIndex: number,
      characterIndex: number,
      field: "star" | "weapon" | "assist",
      value: number
    ) => {
      setAnalysisResult((prev) => {
        const newPartyData = [...prev.partyData];
        const newParty = [...newPartyData[partyIndex]];
        const currentChar = newParty[characterIndex];

        if (currentChar === 0) return prev;

        const info = parseCharacterInfoSafe(currentChar);
        if (!info) return prev;

        if (field === "assist" && value === 1) {
          for (let i = 0; i < newParty.length; i++) {
            if (i !== characterIndex && newParty[i] !== 0) {
              const otherCharInfo = parseCharacterInfoSafe(newParty[i]);
              if (otherCharInfo && otherCharInfo.assist === 1) {
                const updatedOtherChar =
                  otherCharInfo.code * 1000 +
                  otherCharInfo.star * 100 +
                  otherCharInfo.weapon * 10 +
                  0;
                newParty[i] = updatedOtherChar;
              }
            }
          }
        }

        const updates = { ...info, [field]: value };
        const newCharValue =
          updates.code * 1000 +
          updates.star * 100 +
          updates.weapon * 10 +
          updates.assist;

        newParty[characterIndex] = newCharValue;
        newPartyData[partyIndex] = newParty;
        return { ...prev, partyData: newPartyData };
      });
    },
    [setAnalysisResult]
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
        alert("최소 1개의 파티는 있어야 합니다.");
        return;
      }

      setAnalysisResult((prev) => ({
        ...prev,
        partyData: prev.partyData.filter((_, index) => index !== partyIndex),
      }));
    },
    [analysisResult.partyData.length, setAnalysisResult]
  );

  const getPartyCharacters = useCallback(
    (partyIndex: number): (PartyCharacter | null)[] => {
      if (!analysisResult.partyData[partyIndex]) return [];

      return analysisResult.partyData[partyIndex].map((charValue, slotIndex) => {
        if (charValue === 0) return null;

        const info = parseCharacterInfo(charValue);
        if (!info) return null;

        const name = studentsMap[info.code.toString()] || `Character ${info.code}`;

        return {
          code: info.code,
          name,
          slotIndex,
          type: slotIndex < 4 ? "striker" : "special",
          order: (slotIndex < 4 ? slotIndex : slotIndex - 4) + 1,
        };
      });
    },
    [analysisResult.partyData, studentsMap]
  );

  return {
    getCharacterOptions,
    updatePartyData,
    updateCharacterDetails,
    addParty,
    removeParty,
    getPartyCharacters,
    parseCharacterInfoSafe,
  };
}
