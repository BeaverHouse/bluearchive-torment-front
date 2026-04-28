/**
 * 학생 검색 유틸리티 함수
 */

import { CANONICAL_TO_ALIASES } from "@/constants/student-aliases";

export type StudentSearchData = Record<
  string,
  { nameJa: string; nameKo: string; searchKeywords: string[] | null }
>;

/**
 * 단일 학생 ID에 대해 이름/동의어 매칭 여부 확인.
 * alias를 별도 항목으로 노출하는 surface(combo-selector, cascader, multi-select 등)에서 사용.
 */
export function matchesStudentSearch(
  studentId: string,
  searchQuery: string,
  studentSearchMap: StudentSearchData
): boolean {
  const data = studentSearchMap[studentId];
  if (!data) return false;

  const query = searchQuery.toLowerCase();
  if (data.nameKo.toLowerCase().includes(query)) return true;
  if (data.nameJa.toLowerCase().includes(query)) return true;
  if (data.searchKeywords) {
    return data.searchKeywords.some((kw) =>
      kw.toLowerCase().includes(query)
    );
  }
  return false;
}

/**
 * canonical 코드 자신 + 그 alias 코드들의 검색 데이터를 모두 검사.
 * alias를 숨기고 canonical만 노출하는 surface(pool-student-grid)에서 사용.
 */
export function matchesStudentSearchWithAliases(
  studentId: string,
  searchQuery: string,
  studentSearchMap: StudentSearchData
): boolean {
  const aliasIds = CANONICAL_TO_ALIASES[Number(studentId)]?.map(String) ?? [];
  if (matchesStudentSearch(studentId, searchQuery, studentSearchMap)) return true;
  return aliasIds.some((id) =>
    matchesStudentSearch(id, searchQuery, studentSearchMap)
  );
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
