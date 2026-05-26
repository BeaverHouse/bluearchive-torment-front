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

/**
 * 각 variant 코드의 모드 라벨 i18n 키.
 * UI에서는 `t(getModeLabelKey(code))`로 표시.
 */
export const STUDENT_MODE_LABEL_KEYS: Readonly<Record<number, string>> = {
  10098: "mode.shield",
  10099: "mode.sword",
};

/** 각 variant 코드의 모드 아이콘 타입 */
export type ModeIcon = "shield" | "sword";

export const STUDENT_MODE_ICONS: Readonly<Record<number, ModeIcon>> = {
  10098: "shield",
  10099: "sword",
};

/** UI 노출에서 제외할 alias(secondary) 코드 집합 */
export const ALIAS_HIDDEN_CODES: ReadonlySet<number> = new Set(
  Object.keys(STUDENT_ALIASES).map(Number)
);

/** canonical code → alias(secondary) codes */
export const CANONICAL_TO_ALIASES: Readonly<Record<number, number[]>> =
  Object.entries(STUDENT_ALIASES).reduce<Record<number, number[]>>(
    (acc, [alias, canonical]) => {
      const key = Number(canonical);
      (acc[key] ??= []).push(Number(alias));
      return acc;
    },
    {}
  );

/**
 * 학생 코드를 canonical 코드로 정규화.
 * alias가 아니면 입력 그대로 반환.
 */
export function getCanonicalCode(code: number): number {
  return STUDENT_ALIASES[code] ?? code;
}

/** 모드 라벨의 i18n 키가 있으면 반환 */
export function getModeLabelKey(code: number): string | undefined {
  return STUDENT_MODE_LABEL_KEYS[code];
}

/**
 * 모드 라벨을 반환.
 * t가 주어지면 번역해서 반환, 없으면 i18n 키를 그대로 반환 (legacy).
 */
export function getModeLabel(
  code: number,
  t?: (key: string) => string
): string | undefined {
  const key = STUDENT_MODE_LABEL_KEYS[code];
  if (!key) return undefined;
  return t ? t(key) : key;
}

/** 모드 아이콘 타입 반환 */
export function getModeIcon(code: number): ModeIcon | undefined {
  return STUDENT_MODE_ICONS[code];
}
