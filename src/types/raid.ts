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

// Summary 관련 타입
export interface PlatinumCut {
  rank: number;
  score: number;
}

export interface EssentialCharacter {
  studentId: number;
  ratio: number;
}

export interface HighImpactCharacter {
  studentId: number;
  rankGap: number;
  topRank: number;
  withoutBestRank: number;
}

export interface CharTableType {
  key: string;
  studentId: string;
  name: string;
  percent: number;
}

export interface Assistant {
  studentId: string;
  name: string;
  percent: number;
}

export interface PartyTableType {
  key: string;
  one: number;
  two: number;
  three: number;
  fourOrMore: number;
}

export interface RaidSummaryData {
  clearCount: number;
  filters: Record<string, Record<string, number>>;
  assistFilters: Record<string, Record<string, number>>;
  partyCounts: Record<string, number[]>;
  top5Partys: Array<[string, number]>;
  platinumCuts?: PlatinumCut[];
  partPlatinumCuts?: PlatinumCut[];
  essentialCharacters?: EssentialCharacter[];
  highImpactCharacters?: HighImpactCharacter[];
  minUEUser?: {
    rank: number;
    score: number;
    ueCount: number;
    partyData: number[][];
  };
  maxPartyUser?: {
    rank: number;
    score: number;
    partyData: number[][];
  };
}