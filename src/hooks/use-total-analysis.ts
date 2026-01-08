import { useEffect, useState } from "react";
import { TotalAnalysisData } from "@/types/total-analysis";

const DATA_URL =
  "https://twauaebyyujvvvusbrwe.supabase.co/storage/v1/object/public/pb7h4uvn2b6m0lyu7i6r3j8ac/batorment/v3/total-analysis.json";

let totalAnalysisCache: TotalAnalysisData | null = null;

export function useTotalAnalysis() {
  const [data, setData] = useState<TotalAnalysisData | null>(
    totalAnalysisCache
  );
  const [isLoading, setIsLoading] = useState(!totalAnalysisCache);

  useEffect(() => {
    if (totalAnalysisCache) {
      setData(totalAnalysisCache);
      setIsLoading(false);
      return;
    }

    const fetchData = async () => {
      try {
        const res = await fetch(DATA_URL);
        if (!res.ok) throw new Error("Failed to fetch total analysis data");
        const json = await res.json();
        totalAnalysisCache = json;
        setData(json);
      } catch (error) {
        console.error("Failed to fetch total analysis data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  return { data, isLoading };
}
