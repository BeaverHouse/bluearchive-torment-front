/**
 * 캐릭터 정보 객체
 */
export interface CharacterInfo {
  code: number;
  star: number;
  weapon: number;
  assist: number;
}

/**
 * 8자리 캐릭터 값을 파싱하여 개별 정보로 분해
 * @param charValue 8자리 캐릭터 값 (예: 10003021)
 * @returns 캐릭터 정보 객체
 */
export function parseCharacterInfo(charValue: number): CharacterInfo {
  return {
    code: Math.floor(charValue / 1000),
    star: Math.floor((charValue % 1000) / 100),
    weapon: Math.floor((charValue % 100) / 10),
    assist: charValue % 10,
  };
}

/**
 * 캐릭터 코드로 캐릭터 이름을 반환
 * @param code 캐릭터 코드
 * @param studentsMap 학생 데이터 맵
 * @returns 캐릭터 이름
 */
export function getCharacterName(
  code: number,
  studentsMap?: Record<string, string>
): string {
  if (!studentsMap) {
    return `캐릭터 ${code}`;
  }
  return studentsMap[code.toString()] || `캐릭터 ${code}`;
}
