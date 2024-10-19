import { persist, createJSONStorage } from "zustand/middleware";
import { create } from "zustand";
import { immer } from "zustand/middleware/immer";

interface V3BAState {
  V3Season: string;
  IncludeList: Array<number[]>;
  ExcludeList: Array<number>;
  Assist: Array<number> | undefined;
  HardExclude: boolean;
  AllowDuplicate: boolean;

  setV3Season: (val: string) => void;
  setIncludeList: (val: Array<number[]>) => void;
  setExcludeList: (val: Array<number>) => void;
  setAssist: (val: Array<number> | undefined) => void;
  setHardExclude: (val: boolean) => void;
  setAllowDuplicate: (val: boolean) => void;

  removeFilters: () => void;
}

const initialState = {
  IncludeList: [],
  ExcludeList: [],
  Assist: undefined,
  HardExclude: false,
  AllowDuplicate: true,
};

const useBAStore = create(
  immer(
    persist<V3BAState>(
      (set) => ({
        ...initialState,
        V3Season: "S00",

        setV3Season: (val) => set((state) => ({ ...state, V3Season: val })),
        setIncludeList: (val) =>
          set((state) => ({ ...state, IncludeList: val })),
        setExcludeList: (val) =>
          set((state) => ({ ...state, ExcludeList: val })),
        setAssist: (val) => set((state) => ({ ...state, Assist: val })),
        setHardExclude: (val) =>
          set((state) => ({ ...state, HardExclude: val })),
        setAllowDuplicate: (val) =>
          set((state) => ({ ...state, AllowDuplicate: val })),

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
