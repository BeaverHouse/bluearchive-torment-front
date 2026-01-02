import { useEffect, useState } from "react";
import { getStudentSearchMap } from "@/lib/cdn";
import { extractStudentsMap } from "@/utils/search";

type StudentSearchMap = Record<string, { nameJa: string; nameKo: string; searchKeywords: string[] | null }>;

// 모듈 레벨 캐시
let studentsMapCache: Record<string, string> | null = null;
let studentSearchMapCache: StudentSearchMap | null = null;
let fetchPromise: Promise<void> | null = null;

/**
 * 학생 맵 데이터를 로드하는 커스텀 훅
 * CDN에서 학생 검색 맵을 가져와서 studentsMap과 studentSearchMap을 반환합니다.
 */
export function useStudentMaps() {
  const [studentsMap, setStudentsMap] = useState<Record<string, string>>(studentsMapCache || {});
  const [studentSearchMap, setStudentSearchMap] = useState<StudentSearchMap>(studentSearchMapCache || {});
  const [isLoaded, setIsLoaded] = useState(!!studentsMapCache);

  useEffect(() => {
    // 이미 캐시되어 있으면 바로 사용
    if (studentsMapCache && studentSearchMapCache) {
      setStudentsMap(studentsMapCache);
      setStudentSearchMap(studentSearchMapCache);
      setIsLoaded(true);
      return;
    }

    // 이미 fetch 중이면 그 Promise 재사용
    if (!fetchPromise) {
      fetchPromise = (async () => {
        const searchMap = await getStudentSearchMap();
        studentSearchMapCache = searchMap;
        studentsMapCache = extractStudentsMap(searchMap);
      })();
    }

    fetchPromise.then(() => {
      setStudentSearchMap(studentSearchMapCache!);
      setStudentsMap(studentsMapCache!);
      setIsLoaded(true);
    });
  }, []);

  return { studentsMap, studentSearchMap, isLoaded };
}
