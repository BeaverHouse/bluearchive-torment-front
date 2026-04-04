import { useEffect, useState } from "react";
import { getStudentSearchMap } from "@/lib/cdn";
import { extractStudentsMap } from "@/utils/search";

type StudentSearchMap = Record<string, { nameJa: string; nameKo: string; searchKeywords: string[] | null }>;

// 모듈 레벨 캐시 (cdn.ts의 getStudentSearchMap()이 자체 캐싱하므로 searchMap은 캐싱 불필요)
let studentsMapCache: Record<string, string> | null = null;
let fetchPromise: Promise<void> | null = null;

export function useStudentMaps() {
  const [studentsMap, setStudentsMap] = useState<Record<string, string>>(studentsMapCache || {});
  const [studentSearchMap, setStudentSearchMap] = useState<StudentSearchMap>({});
  const [isLoaded, setIsLoaded] = useState(!!studentsMapCache);

  useEffect(() => {
    if (studentsMapCache) {
      getStudentSearchMap().then(setStudentSearchMap);
      setIsLoaded(true);
      return;
    }

    if (!fetchPromise) {
      fetchPromise = (async () => {
        const searchMap = await getStudentSearchMap();
        studentsMapCache = extractStudentsMap(searchMap);
      })();
    }

    fetchPromise.then(async () => {
      const searchMap = await getStudentSearchMap();
      setStudentSearchMap(searchMap);
      setStudentsMap(studentsMapCache!);
      setIsLoaded(true);
    });
  }, []);

  return { studentsMap, studentSearchMap, isLoaded };
}
