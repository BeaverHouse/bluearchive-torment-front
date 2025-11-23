export interface RaidInfo {
  id: string;
  name: string;
  top_level: string;
  party_updated: boolean;
}

export interface PartyData {
  rank: number;
  score: number;
  partyData: number[][];
  video_id?: string;
  raid_id?: string;
}

export interface RaidData {
  parties: PartyData[];
  minPartys: number;
  maxPartys: number;
}

export interface YoutubeLinkInfo {
  userId: number;
  youtubeUrl: string;
  score: number;
}

export interface FilterData {
  filters: Record<string, Record<string, number>>;
  assistFilters: Record<string, Record<string, number>>;
}

export interface FilterOption {
  value: number;
  label: string;
  children?: FilterOption[];
}

export interface RaidComponentProps {
  season: string;
  studentsMap: Record<string, string>;
  studentSearchMap?: Record<string, { nameJa: string; nameKo: string; searchKeywords: string[] | null }>;
  level: string;
  seasonDescription?: string;
}