/**
 * 모드 전환이 가능한 캐릭터의 코드 매핑.
 * 같은 캐릭터지만 데이터상 두 개의 코드를 가진다.
 *
 * - 캐릭터 풀, 단일 파티 검색의 학생 selector: canonical 코드만 노출 (alias 숨김)
 * - 매칭 로직 (pool/combo): 두 코드를 동일 캐릭터로 취급 (canonical로 정규화)
 * - 사용률 계산: canonical 기준으로 합산
 * - PartyCard / 영상 편집 picker / 필터 cascader: 둘 다 노출 (모드 구분)
 */

/** secondary code → canonical code */
export const STUDENT_ALIASES: Readonly<Record<number, number>> = {
  // 호시노(무장): 10098 = 방어모드(1), 10099 = 공격모드(2)
  10099: 10098,
};

/** 각 variant 코드의 모드 라벨 */
export const STUDENT_MODE_LABELS: Readonly<Record<number, string>> = {
  10098: "방어모드",
  10099: "공격모드",
};

/** 각 variant 코드의 모드 숫자 (PartyCard 우하단 뱃지용) */
export const STUDENT_MODE_NUMBERS: Readonly<Record<number, number>> = {
  10098: 1,
  10099: 2,
};

/** UI 노출에서 제외할 alias(secondary) 코드 집합 */
export const ALIAS_HIDDEN_CODES: ReadonlySet<number> = new Set(
  Object.keys(STUDENT_ALIASES).map(Number)
);

/**
 * 학생 코드를 canonical 코드로 정규화.
 * alias가 아니면 입력 그대로 반환.
 */
export function getCanonicalCode(code: number): number {
  return STUDENT_ALIASES[code] ?? code;
}

/** 모드 라벨이 있으면 반환 */
export function getModeLabel(code: number): string | undefined {
  return STUDENT_MODE_LABELS[code];
}

/** 모드 숫자(1/2) 반환 */
export function getModeNumber(code: number): number | undefined {
  return STUDENT_MODE_NUMBERS[code];
}
