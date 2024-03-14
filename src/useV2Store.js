import { persist, createJSONStorage } from "zustand/middleware";
import { create } from "zustand";
import { immer } from "zustand/middleware/immer";

const useV2BAStore = create(
  immer(
    persist(
      (set) => ({
        V2Season: "S63",
        IncludeList: [],
        ExcludeList: [],
        Assist: undefined,
        HardExclude: false,
        AllowDuplicate: true,

        setV2Season: (val) => set((state) => ({ ...state, V2Season: val })),
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
              IncludeList: [],
              ExcludeList: [],
              Assist: undefined,
              HardExclude: false,
              AllowDuplicate: true,
            }),
            true
          ),
      }),
      {
        name: "BA_FILTER_V2",
        storage: createJSONStorage(() => localStorage),
      }
    )
  )
);

export default useV2BAStore;
