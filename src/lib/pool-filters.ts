import type { PoolFilterContext } from "@/types/pool";
import { rankOf, type GradeKey } from "@/types/pool";
import { parseCharacterInfo } from "@/utils/character";
import { getCanonicalCode } from "@/constants/student-aliases";

/**
 * 파티 학생 중 풀에서 커버되지 않는 학생 코드(5자리)를 반환.
 * 빈 Set이면 풀이 파티를 완전히 커버.
 */
export function missingFromPool(
  partyStudents: number[],
  poolFilter: PoolFilterContext
): Set<number> {
  const { pool, policy } = poolFilter;
  const missing = new Set<number>();

  for (const num of partyStudents) {
    const info = parseCharacterInfo(num);
    if (!info) continue;

    if (info.assist === 1) continue;

    const canonicalCode = getCanonicalCode(info.code);
    const poolGrade = pool.students[String(canonicalCode)];

    if (poolGrade === undefined) {
      missing.add(info.code);
      continue;
    }

    if (policy === "any") continue;

    const partyGrade = (info.star * 10 + info.weapon) as GradeKey;

    if (policy === "exact") {
      if (poolGrade !== partyGrade) missing.add(info.code);
    } else {
      if (rankOf(poolGrade) < rankOf(partyGrade)) missing.add(info.code);
    }
  }

  return missing;
}
