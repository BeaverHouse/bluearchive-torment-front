import { AnalysisResult, VideoAnalysisData, SkillOrder } from "@/types/video";

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

export interface SkillOrderItemProps {
  skill: SkillOrder;
  index: number;
  compactMode: boolean;
  partyData: number[][];
  getPartyCharacters: (partyIndex: number) => (PartyCharacter | null)[];
  updateSkillOrder: (index: number, updates: Partial<SkillOrder>) => void;
  removeSkillOrder: (index: number) => void;
  dragHandleProps?: Record<string, unknown>;
}

export interface SortableSkillOrderItemProps extends SkillOrderItemProps {
  id: string;
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
  studentsMap: Record<string, string>;
  studentSearchMap: Record<string, string[]>;
}

export interface SkillOrderListProps {
  skillOrders: SkillOrder[];
  partyData: number[][];
  compactMode: boolean;
  onToggleCompactMode: () => void;
  onAddSkillOrder: () => void;
  onRemoveSkillOrder: (index: number) => void;
  onUpdateSkillOrder: (index: number, updates: Partial<SkillOrder>) => void;
  onReorder: (oldIndex: number, newIndex: number) => void;
  getPartyCharacters: (partyIndex: number) => (PartyCharacter | null)[];
}

export interface BasicInfoEditorProps {
  score: number;
  description: string;
  onUpdateScore: (score: number) => void;
  onUpdateDescription: (description: string) => void;
}

export type { AnalysisResult, VideoAnalysisData, SkillOrder };
