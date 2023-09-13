import { persist, createJSONStorage } from 'zustand/middleware'
import { tab_items } from './constant';
import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer'

const useBAStore = create(immer(persist((set) => ({
    Season: tab_items[0].value,
    IncludeList: [],
    ExcludeList: [],
    UnderThreeList: [],
    UnderFourList: [],
    Assist: undefined,
    HardExclude: false,
    AllowDuplicate: true,

    setSeason: (val) => set((state) => ({ ...state, Season: val })),
    setIncludeList: (val) => set((state) => ({ ...state, IncludeList: val })),
    setExcludeList: (val) => set((state) => ({ ...state, ExcludeList: val })),
    setUnderThreeList: (val) => set((state) => ({ ...state, UnderThreeList: val })),
    setUnderFourList: (val) => set((state) => ({ ...state, UnderFourList: val })),
    setAssist: (val) => set((state) => ({ ...state, Assist: val })),
    setHardExclude: (val) => set((state) => ({ ...state, HardExclude: val })),
    setAllowDuplicate: (val) => set((state) => ({ ...state, AllowDuplicate: val })),

    removeFilters: () => set((state) => ({
        ...state,
        Season: tab_items[0].value,
        IncludeList: [],
        ExcludeList: [],
        UnderThreeList: [],
        UnderFourList: [],
        Assist: undefined,
        HardExclude: false,
        AllowDuplicate: true,
    }), true),
}),
    {
        name: 'BA_FILTER', // name of the item in the storage (must be unique)
        storage: createJSONStorage(() => localStorage), // (optional) by default, 'localStorage' is used
    }
)))

export default useBAStore;