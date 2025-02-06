import { persist, createJSONStorage } from "zustand/middleware";
import { create } from "zustand";
import { immer } from "zustand/middleware/immer";

interface V3BAState {
  V3Season: string;
  LevelList: Array<string>;
  IncludeList: Array<number[]>;
  ExcludeList: Array<number>;
  Assist: Array<number> | undefined;
  HardExclude: boolean;
  AllowDuplicate: boolean;
  YoutubeOnly: boolean;

  setV3Season: (val: string) => void;
  setLevelList: (val: Array<string>) => void;
  setIncludeList: (val: Array<number[]>) => void;
  setExcludeList: (val: Array<number>) => void;
  setAssist: (val: Array<number> | undefined) => void;
  setHardExclude: (val: boolean) => void;
  setAllowDuplicate: (val: boolean) => void;
  setYoutubeOnly: (val: boolean) => void;

  removeFilters: () => void;
}

const initialState = {
  LevelList: ["I", "T", "L"],
  IncludeList: [],
  ExcludeList: [],
  Assist: undefined,
  HardExclude: false,
  AllowDuplicate: true,
  YoutubeOnly: false,
};

const useBAStore = create(
  immer(
    persist<V3BAState>(
      (set) => ({
        ...initialState,
        V3Season: "S00",

        setV3Season: (val) => set((state) => ({ ...state, V3Season: val })),
        setLevelList: (val) => set((state) => ({ ...state, LevelList: val })),
        setIncludeList: (val) =>
          set((state) => ({ ...state, IncludeList: val })),
        setExcludeList: (val) =>
          set((state) => ({ ...state, ExcludeList: val })),
        setAssist: (val) => set((state) => ({ ...state, Assist: val })),
        setHardExclude: (val) =>
          set((state) => ({ ...state, HardExclude: val })),
        setAllowDuplicate: (val) =>
          set((state) => ({ ...state, AllowDuplicate: val })),
        setYoutubeOnly: (val) =>
          set((state) => ({ ...state, YoutubeOnly: val })),

        removeFilters: () =>
          set(
            (state) => ({
              ...state,
              ...initialState,
            }),
            true
          ),
      }),
      {
        name: "BA_FILTER_V3",
        storage: createJSONStorage(() => localStorage),
      }
    )
  )
);

export default useBAStore;
