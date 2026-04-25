import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export type SearchMode = "filter" | "pool" | "single";

interface SearchModeState {
  mode: SearchMode;
  // 조합 모드: 선택된 학생 코드 (5자리, 성급 무관)
  comboCodes: number[];

  setMode: (mode: SearchMode) => void;
  setComboCodes: (codes: number[]) => void;
  toggleComboCode: (code: number) => void;
  clearCombo: () => void;
}

const useSearchModeStore = create(
  persist<SearchModeState>(
    (set) => ({
      mode: "filter",
      comboCodes: [],

      setMode: (mode) => set({ mode }),
      setComboCodes: (codes) => set({ comboCodes: codes }),
      toggleComboCode: (code) =>
        set((state) => {
          const exists = state.comboCodes.includes(code);
          if (exists) {
            return { comboCodes: state.comboCodes.filter((c) => c !== code) };
          }
          // Striker(10000-19999) 4명, Special(20000-29999) 2명 제한
          const isStriker = code >= 10000 && code < 20000;
          const isSpecial = code >= 20000 && code < 30000;
          const strikerCount = state.comboCodes.filter(
            (c) => c >= 10000 && c < 20000
          ).length;
          const specialCount = state.comboCodes.filter(
            (c) => c >= 20000 && c < 30000
          ).length;
          if (isStriker && strikerCount >= 4) return state;
          if (isSpecial && specialCount >= 2) return state;
          return { comboCodes: [...state.comboCodes, code] };
        }),
      clearCombo: () => set({ comboCodes: [] }),
    }),
    {
      name: "BA_SEARCH_MODE_V1",
      storage: createJSONStorage(() => localStorage),
    }
  )
);

export default useSearchModeStore;
