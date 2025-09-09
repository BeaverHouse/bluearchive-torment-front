interface RaidInfo {
  id: string;
  description: string;
  top_level: string;
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