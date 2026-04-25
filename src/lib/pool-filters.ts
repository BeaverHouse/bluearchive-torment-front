import type { PoolFilterContext } from "@/types/pool";
import { rankOf, type GradeKey } from "@/types/pool";
import { parseCharacterInfo } from "@/utils/character";

/**
 * Check whether a party's students can all be satisfied by the student pool.
 *
 * @param partyStudents Flattened 8-digit student numbers across the whole party
 * @param poolFilter Pool state + policy + external-assist setting
 * @returns true if the pool covers every non-(optional external) assist slot
 */
export function partyAgainstPool(
  partyStudents: number[],
  poolFilter: PoolFilterContext
): boolean {
  const { pool, policy } = poolFilter;

  for (const num of partyStudents) {
    const info = parseCharacterInfo(num);
    if (!info) continue;

    // 조력자는 항상 풀 외부 허용 (게임에서 친구의 캐릭터 사용)
    if (info.assist === 1) continue;

    const poolGrade = pool.students[String(info.code)];
    if (poolGrade === undefined) return false;

    if (policy === "any") continue;

    const partyGrade = (info.star * 10 + info.weapon) as GradeKey;

    if (policy === "exact") {
      if (poolGrade !== partyGrade) return false;
    } else {
      // atLeast: 풀 성급이 파티 요구 성급 이상이어야 함
      if (rankOf(poolGrade) < rankOf(partyGrade)) return false;
    }
  }

  return true;
}
