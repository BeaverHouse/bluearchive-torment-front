"use client";

import type { ReactNode } from "react";
import { Component } from "react";
import PartyCard from "@/components/features/raid/party-card";
import { useTranslations } from "@/lib/i18n";

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
  // Raw 6-slot encoded array preserved from CDN (slots 0-3 strikers, 4-5 specials).
  // Present on modern BE responses; falls back to reconstruction when missing.
  Slots?: number[];
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

// Rebuild a fixed 6-slot array: slots 0-3 are striker positions, 4-5 are special positions.
// Prefers the server-provided raw Slots array (accurate slot positions). When absent
// (legacy BE), falls back to a best-effort reconstruction — assist goes to the first
// empty striker slot, which matches common torment parties.
function flattenParty(p: PartyComposition): number[] {
  if (Array.isArray(p.Slots) && p.Slots.length === 6) {
    return p.Slots.slice(0, 6);
  }
  const slots: number[] = [0, 0, 0, 0, 0, 0];
  const strikers = p.Strikers ?? [];
  for (let i = 0; i < Math.min(strikers.length, 4); i++) {
    slots[i] = encodeMember(strikers[i]);
  }
  const specials = p.Specials ?? [];
  for (let i = 0; i < Math.min(specials.length, 2); i++) {
    slots[4 + i] = encodeMember(specials[i]);
  }
  if (p.Assist) {
    const encoded = encodeMember(p.Assist);
    const firstEmptyStriker = slots.findIndex((v, idx) => idx < 4 && v === 0);
    if (firstEmptyStriker !== -1) {
      slots[firstEmptyStriker] = encoded;
    } else {
      const firstEmptySpecial = slots.findIndex((v, idx) => idx >= 4 && v === 0);
      if (firstEmptySpecial !== -1) slots[firstEmptySpecial] = encoded;
    }
  }
  return slots;
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

function SearchPartiesCard({ item }: { item: unknown }) {
  const { t } = useTranslations();
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
      valueSuffix={t("party.summary.points")}
      parties={parties}
      video_id={videoId}
      raid_id={raidId}
    />
  );
}

export const itemCardRegistry: Record<string, ItemCardRenderer> = {
  /**
   * search_parties item schema (one PartyResult from the outer Results array,
   * with RaidID injected by the server from the outer response):
   *   { Rank, Score, Parties: [{Strikers, Specials, Assist?}], YoutubeURL?, RaidID }
   */
  search_parties: (item) => <SearchPartiesCard item={item} />,
};

// 근거 항목이 많을 때(임계값 이상) 카드 대신 쓰는 한 줄 요약.
export interface ItemSummary {
  title: string;
}

export function resolveItemSummary(tool: string, item: unknown): ItemSummary | null {
  if (!isRecord(item)) return null;
  if (tool === "search_parties") {
    const rank = typeof item.Rank === "number" ? `#${item.Rank}` : "";
    const score = typeof item.Score === "number" ? item.Score.toLocaleString() : "";
    const title = [rank, score].filter(Boolean).join(" · ");
    return { title };
  }
  const s = (v: unknown) => (typeof v === "string" && v ? v : undefined);
  // 학생 항목은 NameKo/Name 계열 필드를 쓴다 (search_students 등).
  return {
    title: s(item.NameKo) ?? s(item.Name) ?? s(item.name) ?? s(item.title) ?? "",
  };
}

// 계약 밖 payload(필수 필드 누락 등)가 카드 렌더 중 예외를 던져도 답변 UI
// 전체가 깨지지 않게 하는 공통 가드: 요소 생성 단계는 try/catch, React
// 렌더 단계는 ErrorBoundary가 잡아 해당 카드만 조용히 생략한다(답변
// 프로즈는 유지).
class ItemCardBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  // failed는 리셋되지 않는다 — item payload는 턴 내 불변이라 재시도 경로가 없다.
  // item_result에 "같은 id 재수신 = 갱신" 계약이 확장되면 componentDidUpdate에서
  // children 변경 시 리셋이 필요해진다.
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  componentDidCatch(error: unknown) {
    console.warn("item card render failed; skipping card", error);
  }

  render() {
    return this.state.failed ? null : this.props.children;
  }
}

export function resolveItemCard(tool: string): ItemCardRenderer | null {
  const render = itemCardRegistry[tool];
  if (!render) return null;
  return function guardedItemCard(item: unknown) {
    let child: ReactNode = null;
    try {
      child = render(item);
    } catch (error) {
      console.warn("item card build failed; skipping card", { tool, error });
      return null;
    }
    if (child === null || child === undefined) return null;
    return <ItemCardBoundary>{child}</ItemCardBoundary>;
  };
}
