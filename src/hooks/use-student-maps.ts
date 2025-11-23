import { useEffect, useState } from "react";
import { getStudentSearchMap } from "@/lib/cdn";
import { extractStudentsMap } from "@/utils/search";

/**
 * 학생 맵 데이터를 로드하는 커스텀 훅
 * CDN에서 학생 검색 맵을 가져와서 studentsMap과 studentSearchMap을 반환합니다.
 */
export function useStudentMaps() {
  const [studentsMap, setStudentsMap] = useState<Record<string, string>>({});
  const [studentSearchMap, setStudentSearchMap] = useState<
    Record<string, { nameJa: string; nameKo: string; searchKeywords: string[] | null }>
  >({});

  useEffect(() => {
    const fetchStudentMaps = async () => {
      const searchMap = await getStudentSearchMap();
      setStudentSearchMap(searchMap);
      setStudentsMap(extractStudentsMap(searchMap));
    };

    fetchStudentMaps();
  }, []);

  return { studentsMap, studentSearchMap };
}
