export interface PartyFilterState {
  scoreRange: [number, number] | undefined;
  includeList: number[][];
  excludeList: number[];
  assist: number[] | undefined;
  partyCountRange: [number, number];
  hardExclude: boolean;
  allowDuplicate: boolean;
  youtubeOnly: boolean;
}

export type PartyFilterAction =
  | { type: "SET_SCORE_RANGE"; payload: [number, number] | undefined }
  | { type: "SET_INCLUDE_LIST"; payload: number[][] }
  | { type: "SET_EXCLUDE_LIST"; payload: number[] }
  | { type: "SET_ASSIST"; payload: number[] | undefined }
  | { type: "SET_PARTY_COUNT_RANGE"; payload: [number, number] }
  | { type: "SET_HARD_EXCLUDE"; payload: boolean }
  | { type: "SET_ALLOW_DUPLICATE"; payload: boolean }
  | { type: "SET_YOUTUBE_ONLY"; payload: boolean }
  | { type: "UPDATE_FILTERS"; payload: Partial<PartyFilterState> }
  | { type: "RESET_FILTERS"; payload?: Partial<PartyFilterState> };
