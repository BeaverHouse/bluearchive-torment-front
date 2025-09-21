interface RaidInfo {
  id: string;
  name: string;
  top_level: string;
  party_updated: boolean;
}

interface Party {
  parties: Array<Array<number>>;
  boss_hp: number | null;
  youtube_clip: string | null;
  notes: string;
  parent: number | null;
  children: Array<number>;
  youtube_full: string | null;
}