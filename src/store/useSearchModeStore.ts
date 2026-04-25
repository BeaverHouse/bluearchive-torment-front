import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export type SearchMode = "filter" | "pool" | "combo";

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
          if (state.comboCodes.length >= 6) return state;
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
