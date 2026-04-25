export type GradeKey = 10 | 20 | 30 | 40 | 50 | 51 | 52 | 53 | 54;

export const GRADE_KEYS: readonly GradeKey[] = [
  10, 20, 30, 40, 50, 51, 52, 53, 54,
] as const;

export type StarMatchPolicy = "exact" | "atLeast" | "any";

export interface StudentPool {
  students: Record<string, GradeKey>;
}

export interface PoolFilterState {
  enabled: boolean;
  policy: StarMatchPolicy;
}

export interface PoolFilterContext {
  pool: StudentPool;
  policy: StarMatchPolicy;
}

export function isGradeKey(value: unknown): value is GradeKey {
  return (
    typeof value === "number" &&
    (GRADE_KEYS as readonly number[]).includes(value)
  );
}

export function rankOf(grade: GradeKey): number {
  return GRADE_KEYS.indexOf(grade);
}
