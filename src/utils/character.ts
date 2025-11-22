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
