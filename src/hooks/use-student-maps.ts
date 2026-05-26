import { useEffect, useMemo, useState } from "react";
import { getStudentSearchMap } from "@/lib/cdn";
import { extractStudentsMap, type StudentSearchData } from "@/utils/search";
import { useTranslations } from "@/lib/i18n";

// cdn.ts's getStudentSearchMap() already caches the raw map; here we just
// keep a module-level reference so the first hook user populates it for
// everyone else.
let searchMapCache: StudentSearchData | null = null;
let fetchPromise: Promise<StudentSearchData> | null = null;

export function useStudentMaps() {
  const { locale } = useTranslations();
  const [searchMap, setSearchMap] = useState<StudentSearchData>(searchMapCache || {});
  const [isLoaded, setIsLoaded] = useState(!!searchMapCache);

  useEffect(() => {
    if (searchMapCache) {
      setSearchMap(searchMapCache);
      setIsLoaded(true);
      return;
    }
    if (!fetchPromise) {
      fetchPromise = getStudentSearchMap().then((m) => {
        searchMapCache = m;
        return m;
      });
    }
    fetchPromise.then((m) => {
      setSearchMap(m);
      setIsLoaded(true);
    });
  }, []);

  const studentsMap = useMemo(() => extractStudentsMap(searchMap, locale), [searchMap, locale]);
  return { studentsMap, studentSearchMap: searchMap, isLoaded };
}
