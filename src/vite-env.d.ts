/// <reference types="vite/client" />

interface RaidInfo {
  id: string;
  description: string;
  top_level: string;
}

interface YoutubeLinkInfo {
  userId: number;
  youtubeUrl: string;
  description: string;
  score: number;
}

interface PartyData {
  USER_ID: number;
  SCORE: number;
  LEVEL: string;
  TORMENT_RANK: number;
  FINAL_RANK: number;
  PARTY_DATA: Record<string, number[]>;
}

interface RaidData {
  filters: Record<string, number[]>;
  assist_filters: Record<string, number[]>;
  min_partys: number;
  max_partys: number;
  parties: PartyData[];
}

interface RaidSummaryData {
  clear_count: number;
  party_counts: Record<string, number[]>;
  filters: Record<string, number[]>;
  assist_filters: Record<string, number[]>;
  top5_partys: [string, number][];
}

interface RaidConmponentProps {
  studentsMap: Record<string, string>;
  season: string;
  seasonDescription: string;
  level: string;
}

interface AnnouncementData {
  state: string;
  title: string;
  link: string;
  createdTime: string;
  effect: Array<string>;
  category: string;
}

// Ant Design

interface Option {
  value: number;
  label: string;
  children?: Option[];
}

interface CharTableType {
  key: string;
  name: string;
  percent: number;
}

interface PartyTableType {
  key: string;
  one: number;
  two: number;
  three: number;
  fourOrMore: number;
}
