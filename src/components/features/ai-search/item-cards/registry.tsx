"use client";

import type { ReactNode } from "react";
import PartyCard from "@/components/features/raid/party-card";

/**
 * Registry maps an MCP tool name to a render function for a single item payload.
 * The llm-client flattens list/search results into individual items before streaming,
 * so each renderer here receives one object (never an array).
 *
 * - Tools without an entry render nothing — the LLM's prose is the answer.
 * - Mutation tools never reach here; they are stripped server-side.
 */
export type ItemCardRenderer = (item: unknown) => ReactNode;

const isRecord = (v: unknown): v is Record<string, unknown> =>
  typeof v === "object" && v !== null;

const asArray = <T,>(value: unknown): T[] => (Array.isArray(value) ? (value as T[]) : []);

interface PartyMember {
  StudentID: number;
  Star: number;
  Weapon: number;
  IsAssist: boolean;
}

interface PartyComposition {
  Strikers?: PartyMember[];
  Specials?: PartyMember[];
  Assist?: PartyMember | null;
}

// Encoding mirrors ba-analyzer's parsePartyMember (raid/party_filter.go):
//   code = StudentID*1000 + Star*100 + Weapon*10 + (IsAssist ? 1 : 0)
function encodeMember(m: PartyMember): number {
  return (
    m.StudentID * 1000 +
    m.Star * 100 +
    m.Weapon * 10 +
    (m.IsAssist ? 1 : 0)
  );
}

function flattenParty(p: PartyComposition): number[] {
  const flat: number[] = [];
  (p.Strikers ?? []).forEach((m) => flat.push(encodeMember(m)));
  (p.Specials ?? []).forEach((m) => flat.push(encodeMember(m)));
  if (p.Assist) flat.push(encodeMember(p.Assist));
  return flat;
}

function extractYoutubeId(url?: string): string | undefined {
  if (!url) return undefined;
  try {
    const u = new URL(url);
    if (u.hostname.includes("youtu.be")) {
      return u.pathname.replace(/^\//, "") || undefined;
    }
    const v = u.searchParams.get("v");
    if (v) return v;
  } catch {
    // Not a URL — fall through.
  }
  return undefined;
}

export const itemCardRegistry: Record<string, ItemCardRenderer> = {
  /**
   * search_parties item schema (one PartyResult from the outer Results array,
   * with RaidID injected by the server from the outer response):
   *   { Rank, Score, Parties: [{Strikers, Specials, Assist?}], YoutubeURL?, RaidID }
   */
  search_parties: (item) => {
    if (!isRecord(item)) return null;
    const raidId = typeof item.RaidID === "string" ? item.RaidID : undefined;
    const parties = asArray<PartyComposition>(item.Parties).map(flattenParty);
    if (parties.length === 0) return null;
    const videoId = extractYoutubeId(typeof item.YoutubeURL === "string" ? item.YoutubeURL : undefined);
    const rank = typeof item.Rank === "number" ? item.Rank : 0;
    const score = typeof item.Score === "number" ? item.Score : 0;
    return (
      <PartyCard
        rank={rank}
        value={score}
        valueSuffix="점"
        parties={parties}
        video_id={videoId}
        raid_id={raidId}
      />
    );
  },
};

export function resolveItemCard(tool: string): ItemCardRenderer | null {
  return itemCardRegistry[tool] ?? null;
}
