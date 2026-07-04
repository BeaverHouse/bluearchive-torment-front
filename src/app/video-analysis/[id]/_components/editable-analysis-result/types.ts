import { AnalysisResult, VideoAnalysisData } from "@/types/video";
import { StudentSearchData } from "@/utils/search";

export interface EditableAnalysisResultProps {
  videoData: VideoAnalysisData;
  raidId?: string;
  onUpdate: (updatedData: VideoAnalysisData) => void;
  onCancel: () => void;
}

export interface CharacterOption {
  value: number;
  label: string;
}

export interface PartyCharacter {
  code: number;
  name: string;
  slotIndex: number;
  type: "striker" | "special";
  order: number;
}

export interface PartyEditorProps {
  partyData: number[][];
  onUpdateParty: (partyIndex: number, characterIndex: number, newCharacterCode: number) => void;
  onUpdateCharacterDetails: (
    partyIndex: number,
    characterIndex: number,
    field: "star" | "weapon" | "assist",
    value: number
  ) => void;
  onAddParty: () => void;
  onRemoveParty: (partyIndex: number) => void;
  onReorderParty: (oldIndex: number, newIndex: number) => void;
  onSwapCharacter: (partyIndex: number, oldSlot: number, newSlot: number) => void;
  studentSearchMap: StudentSearchData;
}

export interface BasicInfoEditorProps {
  score: number;
  description: string;
  onUpdateScore: (score: number) => void;
  onUpdateDescription: (description: string) => void;
}

export type { AnalysisResult, VideoAnalysisData };
