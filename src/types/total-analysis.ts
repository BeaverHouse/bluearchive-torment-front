export interface TopStudent {
  studentId: number;
  usageCount: number;
}

export interface RaidAnalysis {
  raidId: string;
  topStrikers: TopStudent[];
  topSpecials: TopStudent[];
  topAssists: TopStudent[];
  lunaticClearCount: number;
}

export interface UsageHistory {
  raidId: string;
  userCount: number;
  lunaticUserCount: number;
}

export interface StarDistribution {
  raidId: string;
  distribution: Record<string, number>;
}

export interface AssistStats {
  asAssistCount: number;
  asOwnCount: number;
  totalCount: number;
  assistRatio: number;
}

export interface SynergyChar {
  studentId: number;
  coUsageRate: number;
  coUsageCount: number;
}

export interface CharacterAnalysis {
  studentId: number;
  usageHistory: UsageHistory[];
  starDistribution: StarDistribution | null;
  assistStats: AssistStats;
  topSynergyChars: SynergyChar[];
  totalUsage: number;
  overallRank: number;
  categoryRank: number;
}

export interface TotalAnalysisData {
  generatedAt: string;
  raidAnalyses: RaidAnalysis[];
  characterAnalyses: CharacterAnalysis[];
}
