import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";
import type {
  GradeKey,
  MaxMissing,
  PoolFilterState,
  StarMatchPolicy,
  StudentPool,
} from "@/types/pool";

interface StudentPoolState {
  pool: StudentPool;
  filter: PoolFilterState;

  addStudent: (code: number, grade?: GradeKey) => void;
  removeStudent: (code: number) => void;
  setStudentGrade: (code: number, grade: GradeKey) => void;
  setAll: (pool: StudentPool) => void;
  clearPool: () => void;
  setAllGrade: (grade: GradeKey) => void;

  setPolicy: (value: StarMatchPolicy) => void;
  setMaxMissing: (value: MaxMissing) => void;
}

const initialFilter: PoolFilterState = {
  policy: "atLeast",
  maxMissing: 2,
};

const initialPool: StudentPool = {
  students: {},
};

const useStudentPoolStore = create(
  immer(
    persist<StudentPoolState>(
      (set) => ({
        pool: initialPool,
        filter: initialFilter,

        addStudent: (code, grade = 54) =>
          set((state) => ({
            ...state,
            pool: {
              students: {
                ...state.pool.students,
                [String(code)]: grade,
              },
            },
          })),

        removeStudent: (code) =>
          set((state) => {
            const next = { ...state.pool.students };
            delete next[String(code)];
            return {
              ...state,
              pool: { students: next },
            };
          }),

        setStudentGrade: (code, grade) =>
          set((state) => {
            const key = String(code);
            if (state.pool.students[key] === undefined) return state;
            return {
              ...state,
              pool: {
                students: {
                  ...state.pool.students,
                  [key]: grade,
                },
              },
            };
          }),

        setAll: (pool) => set((state) => ({ ...state, pool })),

        clearPool: () =>
          set((state) => ({ ...state, pool: { students: {} } })),

        setAllGrade: (grade) =>
          set((state) => {
            const next: Record<string, GradeKey> = {};
            for (const key of Object.keys(state.pool.students)) {
              next[key] = grade;
            }
            return { ...state, pool: { students: next } };
          }),

        setPolicy: (value) =>
          set((state) => ({
            ...state,
            filter: { ...state.filter, policy: value },
          })),

        setMaxMissing: (value) =>
          set((state) => ({
            ...state,
            filter: { ...state.filter, maxMissing: value },
          })),
      }),
      {
        name: "BA_POOL_V1",
        version: 2,
        storage: createJSONStorage(() => localStorage),
        migrate: (persisted, version) => {
          const state = persisted as Partial<StudentPoolState> | undefined;
          if (!state) return persisted as StudentPoolState;
          if (version < 2) {
            return {
              ...state,
              filter: {
                policy: state.filter?.policy ?? "atLeast",
                maxMissing: 2,
              },
            } as StudentPoolState;
          }
          return state as StudentPoolState;
        },
      }
    )
  )
);

export default useStudentPoolStore;
