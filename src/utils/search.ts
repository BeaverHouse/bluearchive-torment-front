/**
 * 학생 검색 유틸리티 함수
 */

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
  const studentData = studentSearchMap[studentId];
  if (!studentData) return false;

  const query = searchQuery.toLowerCase();

  // 한국어 이름 매칭
  if (studentData.nameKo.toLowerCase().includes(query)) {
    return true;
  }

  // 일본어 이름 매칭
  if (studentData.nameJa.toLowerCase().includes(query)) {
    return true;
  }

  // 동의어 매칭
  if (studentData.searchKeywords) {
    return studentData.searchKeywords.some((keyword) =>
      keyword.toLowerCase().includes(query)
    );
  }

  return false;
}
