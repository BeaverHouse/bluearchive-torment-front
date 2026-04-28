import type { FilteredPartyResult } from "@/lib/party-filters";

export interface CompositionGroup {
  /** 최고점 파티 (대표) */
  representative: FilteredPartyResult;
  /** 그룹 내 모든 파티 (점수 내림차순, representative 포함) */
  members: FilteredPartyResult[];
  /** 사용 횟수 */
  count: number;
}

/**
 * 파티 조합 키 생성.
 * sub-party별 5자리 캐릭터 코드(assist 제외)를 정렬 → 문자열.
 * 성급/무기를 무시하고 캐릭터 구성만으로 동일성 판단.
 */
function computeCompositionKey(partyData: number[][]): string {
  return partyData
    .map((subParty) =>
      subParty
        .filter((num) => num % 10 !== 1)
        .map((num) => Math.floor(num / 1000))
        .sort((a, b) => a - b)
        .join("-")
    )
    .join("|");
}

/**
 * FilteredPartyResult 배열을 조합 키로 그룹핑.
 * 그룹 내 점수 내림차순, 그룹 간 대표 점수 내림차순.
 */
export function groupByComposition(
  results: FilteredPartyResult[]
): CompositionGroup[] {
  const map = new Map<string, FilteredPartyResult[]>();

  for (const result of results) {
    const key = computeCompositionKey(result.party.partyData);
    const list = map.get(key);
    if (list) {
      list.push(result);
    } else {
      map.set(key, [result]);
    }
  }

  const groups: CompositionGroup[] = [];

  for (const members of map.values()) {
    members.sort((a, b) => b.party.score - a.party.score);
    groups.push({
      representative: members[0],
      members,
      count: members.length,
    });
  }

  groups.sort(
    (a, b) => b.representative.party.score - a.representative.party.score
  );

  return groups;
}
