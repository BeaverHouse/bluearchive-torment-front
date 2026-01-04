import { useEffect, useState } from "react";
import { RaidInfo } from "@/types/raid";

const RAIDS_URL =
  "https://twauaebyyujvvvusbrwe.supabase.co/storage/v1/object/public/pb7h4uvn2b6m0lyu7i6r3j8ac/batorment/v3/raids.json";

let raidsCache: RaidInfo[] | null = null;

export function useRaids() {
  const [raids, setRaids] = useState<RaidInfo[]>(raidsCache || []);
  const [isLoading, setIsLoading] = useState(!raidsCache);

  useEffect(() => {
    if (raidsCache) {
      setRaids(raidsCache);
      setIsLoading(false);
      return;
    }

    const fetchRaids = async () => {
      try {
        const res = await fetch(RAIDS_URL);
        if (!res.ok) throw new Error("Failed to fetch raids");
        const data = await res.json();
        raidsCache = data;
        setRaids(data);
      } catch (error) {
        console.error("Failed to fetch raids:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRaids();
  }, []);

  return { raids, isLoading };
}

// For server components
export async function getRaidsData(): Promise<RaidInfo[]> {
  const res = await fetch(RAIDS_URL, { next: { revalidate: 3600 } });
  if (!res.ok) {
    throw new Error("Failed to fetch raids data");
  }
  return res.json();
}
