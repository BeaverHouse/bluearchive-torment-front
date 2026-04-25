import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";
import type {
  GradeKey,
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

  setEnabled: (value: boolean) => void;
  setPolicy: (value: StarMatchPolicy) => void;
  setAllowExternalAssist: (value: boolean) => void;
}

const initialFilter: PoolFilterState = {
  enabled: false,
  policy: "atLeast",
  allowExternalAssist: true,
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

        setEnabled: (value) =>
          set((state) => ({
            ...state,
            filter: { ...state.filter, enabled: value },
          })),

        setPolicy: (value) =>
          set((state) => ({
            ...state,
            filter: { ...state.filter, policy: value },
          })),

        setAllowExternalAssist: (value) =>
          set((state) => ({
            ...state,
            filter: { ...state.filter, allowExternalAssist: value },
          })),
      }),
      {
        name: "BA_POOL_V1",
        version: 1,
        storage: createJSONStorage(() => localStorage),
      }
    )
  )
);

export default useStudentPoolStore;
