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

/**
 * 캐릭터 이미지 URL 생성
 * @param code 캐릭터 코드
 * @returns CDN 이미지 URL
 */
export function getCharacterImageUrl(code: number): string {
  return `${process.env.NEXT_PUBLIC_CDN_URL || ""}/batorment/character/${code}.webp`;
}

/**
 * 이미지 로드 실패 시 fallback 이미지로 교체하는 핸들러
 * @param event 이미지 에러 이벤트
 */
export function handleImageError(event: React.SyntheticEvent<HTMLImageElement>): void {
  const target = event.target as HTMLImageElement;
  target.src = "/empty.webp";
}