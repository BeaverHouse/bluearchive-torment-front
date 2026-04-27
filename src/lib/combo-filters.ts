import type { PartyData } from "@/types/raid";
import { parseCharacterInfo } from "@/utils/character";
import { getCanonicalCode } from "@/constants/student-aliases";

/**
 * 한 sub-party가 모든 선택된 코드를 포함하는지 확인.
 * 코드는 학생 5자리 코드. 성급/조력자 무관.
 * alias(secondary) 코드는 canonical로 정규화 후 비교.
 */
export function subPartyContainsAll(
  subParty: number[],
  requiredCodes: ReadonlySet<number>
): boolean {
  if (requiredCodes.size === 0) return true;
  const present = new Set<number>();
  for (const num of subParty) {
    const info = parseCharacterInfo(num);
    if (info) present.add(getCanonicalCode(info.code));
  }
  for (const code of requiredCodes) {
    if (!present.has(getCanonicalCode(code))) return false;
  }
  return true;
}

/**
 * 파티 안에서 선택된 학생 조합을 모두 포함하는 sub-party 인덱스 찾기.
 * 매칭되는 sub-party 인덱스 배열 반환 (없으면 빈 배열).
 */
export function findMatchingSubPartyIndexes(
  party: PartyData,
  requiredCodes: ReadonlySet<number>
): number[] {
  if (requiredCodes.size === 0) return [];
  const matches: number[] = [];
  party.partyData.forEach((subParty, index) => {
    if (subPartyContainsAll(subParty, requiredCodes)) {
      matches.push(index);
    }
  });
  return matches;
}
