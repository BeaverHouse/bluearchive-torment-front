import studentsData from "../../data/students.json";

/**
 * 학생 데이터를 Record<string, string> 타입으로 반환
 */
export function getStudentsMap(): Record<string, string> {
  return studentsData as Record<string, string>;
}

/**
 * 캐릭터 코드로 캐릭터 이름을 반환
 * @param code 캐릭터 코드
 * @param studentsMap 학생 데이터 맵 (선택사항, 없으면 자동으로 로드)
 * @returns 캐릭터 이름
 */
export function getCharacterName(
  code: number, 
  studentsMap?: Record<string, string>
): string {
  const map = studentsMap || getStudentsMap();
  return map[code.toString()] || `캐릭터 ${code}`;
}
