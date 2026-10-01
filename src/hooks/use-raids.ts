import { useEffect, useState } from "react";
import { RaidInfo } from "@/types/raid";
import { Locale } from "@/lib/i18n";

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
        const data: RaidInfo[] = await res.json();
        // raids.json lists seasons oldest first; every raid picker shows the newest first.
        const newestFirst = [...data].reverse();
        raidsCache = newestFirst;
        setRaids(newestFirst);
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

/** Pick a localized raid title. Falls back to ko, then to legacy `name`. */
export function getRaidName(raid: RaidInfo, locale: Locale): string {
  const localized =
    locale === "en" ? raid.name_en
    : locale === "zh" ? raid.name_zh
    : raid.name_ko;
  return localized || raid.name_ko || raid.name;
}

export type RaidStatus = "upcoming" | "ongoing" | "ended";

// Every Total Assault and Grand Assault season runs for exactly one week.
const RAID_DURATION_MS = 7 * 24 * 60 * 60 * 1000;

/** Where the season stands at `now`; null when the payload has no start date. */
export function getRaidStatus(raid: RaidInfo, now: number): RaidStatus | null {
  if (!raid.start_date) return null;
  const start = new Date(raid.start_date).getTime();
  if (now < start) return "upcoming";
  if (now < start + RAID_DURATION_MS) return "ongoing";
  return "ended";
}

/** Raid title for a picker, with the season status appended while it has not ended. */
export function getRaidOptionLabel(
  raid: RaidInfo,
  locale: Locale,
  t: (key: string) => string,
  now: number
): string {
  const name = getRaidName(raid, locale);
  const status = getRaidStatus(raid, now);
  if (status === "upcoming" || status === "ongoing") {
    return `${name} (${t(`raid.status.${status}`)})`;
  }
  return name;
}

/** Terrain label embedded in the localized raid title produced by data-process. */
export function getRaidTerrain(raid: RaidInfo, locale: Locale): string | null {
  const name = getRaidName(raid, locale);
  const patterns =
    locale === "en"
      ? ["Street", "Outdoor", "Indoor"]
      : locale === "zh"
        ? ["街区", "户外", "室内"]
        : ["시가지", "야외", "실내"];
  return patterns.find((terrain) => name.includes(terrain)) ?? null;
}
