/**
 * 학생 검색 유틸리티 함수
 */

import { CANONICAL_TO_ALIASES } from "@/constants/student-aliases";

export type StudentSearchData = Record<
  string,
  { nameJa: string; nameKo: string; searchKeywords: string[] | null }
>;

/**
 * 학생 이름이나 동의어로 검색 매칭 여부 확인
 * @param studentId 학생 ID (문자열)
 * @param searchQuery 검색어
 * @param studentSearchMap 학생 검색 데이터 맵
 * @returns 검색어와 매칭되는지 여부
 */
export function matchesStudentSearch(
  studentId: string,
  searchQuery: string,
  studentSearchMap: StudentSearchData
): boolean {
  const query = searchQuery.toLowerCase();

  // canonical 코드 자신 + alias 코드들 모두 검색 대상
  const idsToCheck = [
    studentId,
    ...(CANONICAL_TO_ALIASES[Number(studentId)]?.map(String) ?? []),
  ];

  return idsToCheck.some((id) => {
    const data = studentSearchMap[id];
    if (!data) return false;

    if (data.nameKo.toLowerCase().includes(query)) return true;
    if (data.nameJa.toLowerCase().includes(query)) return true;
    if (data.searchKeywords) {
      return data.searchKeywords.some((kw) =>
        kw.toLowerCase().includes(query)
      );
    }
    return false;
  });
}

/**
 * studentSearchMap에서 간단한 이름 맵(studentsMap)을 추출
 * @param studentSearchMap 학생 검색 데이터 맵
 * @returns 학생 ID를 키로, 한국어 이름을 값으로 하는 맵
 */
export function extractStudentsMap(
  studentSearchMap: StudentSearchData
): Record<string, string> {
  const nameMap: Record<string, string> = {};
  for (const [id, data] of Object.entries(studentSearchMap)) {
    nameMap[id] = data.nameKo;
  }
  return nameMap;
}
