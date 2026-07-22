// Wiki content is served by data-aggregator's public read API from an in-memory
// snapshot of the curated knowledge repo — the same documents ARONA reads. The
// source repo stays server-side; the browser only ever talks to this API.

const BASE_URL = `${process.env.NEXT_PUBLIC_DATA_AGGREGATOR_URL || "http://localhost:8082"}/data-aggregator/v1`;

export const WIKI_DOMAIN = "bluearchive";

export interface WikiFrontmatter {
  title?: string;
  type?: string;
  status?: string;
  aliases: string[];
  raidIds: string[];
  sources: string[];
}

export interface WikiDoc {
  /** Slug relative to the domain, without .md (e.g. "raids/binah"). */
  slug: string;
  frontmatter: WikiFrontmatter;
  /** Markdown body with frontmatter and HTML comments removed. */
  body: string;
}

/** One entry parsed from a domain index.md link line. */
export interface WikiIndexEntry {
  slug: string; // relative, no .md
  title: string;
  summary: string;
}

interface APIResponse<T> {
  status_code: number;
  message: string;
  data: T;
}

const docCache = new Map<string, WikiDoc | null>();
let indexCache: string | null = null;

async function fetchText(path: string): Promise<string | null> {
  try {
    const res = await fetch(`${BASE_URL}${path}`, {
      headers: { Accept: "application/json" },
    });
    if (!res.ok) return null;
    const json: APIResponse<{ content?: string }> = await res.json();
    return json.data?.content ?? null;
  } catch {
    return null;
  }
}

/** Remove a leading YAML frontmatter block and return [frontmatter, body]. */
function splitFrontmatter(raw: string): [WikiFrontmatter, string] {
  const fm: WikiFrontmatter = { aliases: [], raidIds: [], sources: [] };
  const match = raw.match(/^---\n([\s\S]*?)\n---\n?/);
  if (!match) return [fm, raw];

  const block = match[1];
  const body = raw.slice(match[0].length);
  const lines = block.split("\n");
  let listKey: "sources" | null = null;

  for (const line of lines) {
    const listItem = line.match(/^\s*-\s+(.*)$/);
    if (listItem && listKey === "sources") {
      fm.sources.push(stripQuotes(listItem[1]));
      continue;
    }
    listKey = null;

    const kv = line.match(/^([a-zA-Z_]+):\s*(.*)$/);
    if (!kv) continue;
    const [, key, valueRaw] = kv;
    const value = valueRaw.trim();

    switch (key) {
      case "title":
        fm.title = stripQuotes(value);
        break;
      case "type":
        fm.type = stripQuotes(value);
        break;
      case "status":
        fm.status = stripQuotes(value);
        break;
      case "aliases":
        fm.aliases = parseInlineList(value);
        break;
      case "raid_ids":
        fm.raidIds = parseInlineList(value);
        break;
      case "sources":
        if (value === "" || value === "|") {
          listKey = "sources";
        } else {
          fm.sources = parseInlineList(value);
        }
        break;
    }
  }
  return [fm, body];
}

function stripQuotes(s: string): string {
  return s.trim().replace(/^["']|["']$/g, "").trim();
}

/** Parse `[a, b, "c d"]` inline YAML lists. */
function parseInlineList(value: string): string[] {
  const inner = value.replace(/^\[|\]$/g, "").trim();
  if (!inner) return [];
  return inner
    .split(",")
    .map((s) => stripQuotes(s))
    .filter(Boolean);
}

/** Strip HTML comments (AI-only instructions live there). */
function stripHtmlComments(s: string): string {
  return s.replace(/<!--[\s\S]*?-->\s*/g, "");
}

/** Read one document. Returns null when missing or the API is unreachable. */
export async function getWikiDoc(slug: string): Promise<WikiDoc | null> {
  const clean = slug.replace(/^\/+|\/+$/g, "").replace(/\.md$/, "");
  if (docCache.has(clean)) return docCache.get(clean) ?? null;

  const raw = await fetchText(`/wiki/${WIKI_DOMAIN}/${clean}`);
  if (raw === null) {
    docCache.set(clean, null);
    return null;
  }
  const [frontmatter, body] = splitFrontmatter(raw);
  // Drop a leading H1 — the page renders frontmatter.title as the heading, so a
  // body that opens with "# Title" would duplicate it.
  const cleanBody = stripHtmlComments(body).trim().replace(/^#\s+.*(\r?\n)+/, "");
  const doc: WikiDoc = {
    slug: clean,
    frontmatter,
    body: cleanBody,
  };
  docCache.set(clean, doc);
  return doc;
}

/** Read the raw index.md for a domain. */
export async function getWikiIndexRaw(): Promise<string | null> {
  if (indexCache !== null) return indexCache;
  const raw = await fetchText(`/wiki/${WIKI_DOMAIN}`);
  indexCache = raw;
  return raw;
}

// Slug classifiers. Season-report slugs are notes/s{N}… or notes/3s{N}… — the
// trailing digit is what separates them from notes/skill_build_trends, which
// also starts with "notes/s".
export const isRaidGuide = (slug: string) => slug.startsWith("raids/");
export const isSeasonReport = (slug: string) => /^notes\/(3?s)\d/.test(slug);
export const isBuildNote = (slug: string) =>
  slug.startsWith("notes/skill_build") || slug.startsWith("notes/builds/");

/**
 * Parse index.md markdown-link lines into entries. Handles both list items
 * (`- [title](slug.md) — summary`) and table rows (`| [title](slug.md) | ... |`).
 * Only entries whose slug satisfies `match` are returned.
 */
export async function getWikiIndexEntries(
  match: (slug: string) => boolean
): Promise<WikiIndexEntry[]> {
  const raw = await getWikiIndexRaw();
  if (!raw) return [];

  const entries: WikiIndexEntry[] = [];
  const seen = new Set<string>();
  const linkRe = /\[([^\]]+)\]\(([^)]+\.md)\)/g;

  for (const line of raw.split("\n")) {
    linkRe.lastIndex = 0;
    const m = linkRe.exec(line);
    if (!m) continue;
    const title = m[1].trim();
    const slug = m[2].trim().replace(/\.md$/, "");
    if (!match(slug)) continue;
    if (seen.has(slug)) continue;
    seen.add(slug);

    // Summary. Table rows (raids): use the last cell (the "특징" column), which
    // is more descriptive than the boss-name cell right after the link. List
    // items (notes): use the text after the link.
    let summary: string;
    if (line.trim().startsWith("|")) {
      const cells = line.split("|").map((c) => c.trim()).filter(Boolean);
      summary = cells[cells.length - 1] ?? "";
      // Strip the markdown link if the last cell happened to be the link itself.
      summary = summary.replace(/\[[^\]]+\]\([^)]+\)/g, "").trim();
    } else {
      summary = line
        .slice(m.index + m[0].length)
        .replace(/^[\s—\-|:]+/, "")
        .trim();
    }
    entries.push({ slug, title, summary });
  }
  return entries;
}

/** Find the season report whose raid_ids include the given raid id. */
export async function findReportByRaidId(raidId: string): Promise<WikiDoc | null> {
  const reports = await getWikiIndexEntries(isSeasonReport);
  for (const entry of reports) {
    const doc = await getWikiDoc(entry.slug);
    if (doc?.frontmatter.raidIds.includes(raidId)) return doc;
  }
  return null;
}

/**
 * The report's headline insight: the "**한 줄 정의: …**" line if present,
 * otherwise the first real paragraph. Used for the season note so it shows the
 * takeaway (who to bring and why), not restated headcount numbers.
 */
export function firstParagraph(body: string): string {
  const oneLiner = body.match(/한 줄 정의[:：]\s*([^\n*]+)/);
  if (oneLiner) return oneLiner[1].replace(/\*+/g, "").replace(/\s+/g, " ").trim();
  for (const block of body.split(/\n\s*\n/)) {
    const line = block.trim();
    if (line && !line.startsWith("#") && !line.startsWith("|") && !line.startsWith(">") && !line.startsWith("<!--")) {
      return line.replace(/\s+/g, " ").trim();
    }
  }
  return "";
}

/* ── Arona card comments ────────────────────────────────────────────── */

/**
 * Summary-tab card ids a season report can annotate. Mirrors the summary
 * page's SectionId values; kept as plain strings so wiki stays UI-agnostic.
 */
export type AronaCardSection =
  | "platinum_stats"
  | "key_characters"
  | "top_5_party"
  | "party_composition"
  | "special_clears"
  | "character_details";

// Korean card labels as authored in reports → section ids.
const ARONA_CARD_LABELS: [RegExp, AronaCardSection][] = [
  [/^플래티넘\s*컷$/, "platinum_stats"],
  [/^핵심\s*캐릭터$/, "key_characters"],
  [/^top\s*5\s*파티$/i, "top_5_party"],
  [/^파티\s*비율$/, "party_composition"],
  [/^특수\s*클리어$/, "special_clears"],
  [/^상세\s*분석$/, "character_details"],
];

interface AronaCommentEntry {
  section: AronaCardSection | "season_line";
  difficulty?: "T" | "L";
  text: string;
}

/**
 * Parse the report's "## 아로나 코멘트" section: one bullet per summary card,
 * written in Arona's voice, optionally scoped "(토먼트)"/"(루나틱)". The site
 * renders only what the report authored — no bullet, no strip — so the wiki
 * stays the single source of analysis and the UI never invents commentary.
 */
function parseAronaComments(body: string): AronaCommentEntry[] {
  // Walk lines instead of a lazy /m regex — with /m, `$` matches every line
  // end, so `([\s\S]*?)(?=…|$)` silently truncated the section to one bullet.
  const start = body.search(/^##\s*아로나\s*코멘트\s*$/m);
  if (start < 0) return [];
  const lines = body.slice(start).split("\n").slice(1);
  const out: AronaCommentEntry[] = [];
  for (const line of lines) {
    if (/^##\s/.test(line)) break; // next section
    const b = line.match(
      /^\s*-\s*([^:：()]+?)\s*(?:\((토먼트|루나틱)\))?\s*[:：]\s*(.+)$/,
    );
    if (!b) continue;
    const label = b[1].trim();
    const difficulty =
      b[2] === "토먼트" ? "T" : b[2] === "루나틱" ? "L" : undefined;
    // Strip bold markers but keep escaped literals (시로코\*테러 → 시로코*테러).
    const text = b[3]
      .replace(/\*\*/g, "")
      .replace(/\\\*/g, "*")
      .replace(/\s+/g, " ")
      .trim();
    if (/^시즌\s*한\s*줄$/.test(label)) {
      out.push({ section: "season_line", difficulty, text });
      continue;
    }
    for (const [re, section] of ARONA_CARD_LABELS) {
      if (re.test(label)) {
        out.push({ section, difficulty, text });
        break;
      }
    }
  }
  return out;
}

/**
 * Arona's comment for one summary card at one difficulty. A bullet scoped to
 * the exact difficulty wins over an unscoped one; a bullet scoped to the
 * *other* difficulty never leaks across tabs.
 */
export function aronaCardComment(
  body: string,
  section: AronaCardSection,
  level: "T" | "L",
): string {
  const entries = parseAronaComments(body).filter((e) => e.section === section);
  const exact = entries.find((e) => e.difficulty === level);
  if (exact) return exact.text;
  return entries.find((e) => !e.difficulty)?.text ?? "";
}

/** The report's season headline in Arona's voice (`- 시즌 한 줄:` bullet). */
export function aronaSeasonLine(body: string): string {
  return (
    parseAronaComments(body).find((e) => e.section === "season_line")?.text ??
    ""
  );
}

// A recommended skill-investment slot. `low` marks a slot the community
// under-invests. Level is "M" (max) or a digit level.
export interface BuildSlot {
  key: "ex" | "basic" | "enhanced" | "sub";
  level: string;
  low: boolean;
}

export type StudentBuild =
  | { kind: "low-invest"; slots: BuildSlot[]; freq?: string; reason: string; weapon: boolean }
  | { kind: "compromise"; role: string; slot: string }
  | { kind: "full-invest"; group: "dealer" | "healer" }
  | null;

const SLOT_KEYS = ["ex", "basic", "enhanced", "sub"] as const;

// Strip markdown emphasis markers so table-cell prose renders as plain text.
function stripEmphasis(s: string): string {
  return s.replace(/\*\*/g, "").replace(/(^|[^*])\*([^*]+)\*/g, "$1$2").trim();
}

// Parse a 4-char M-notation spec ("MM7M") into slots. Digits mark low slots.
function parseSpec(spec: string): BuildSlot[] | null {
  const m = spec.match(/^[M0-9]{4}/);
  if (!m) return null;
  return m[0].split("").map((ch, i) => ({
    key: SLOT_KEYS[i],
    level: ch,
    low: ch !== "M",
  }));
}

/**
 * Structured build recommendation for a student, parsed from the 스작 동향 doc.
 * Distinguishes low-invest rows (spec + reason), compromise rows (role + slot),
 * and the full-invest lists.
 */
export async function getStudentBuild(name: string): Promise<StudentBuild> {
  if (!name) return null;
  const doc = await getWikiDoc("notes/skill_build_trends");
  if (!doc) return null;

  const lines = doc.body.split("\n");
  let section: "low" | "compromise" | "" = "";
  let fullDealer = "";
  let fullHealer = "";

  for (const line of lines) {
    const h = line.match(/^#{2,4}\s+(.*)$/);
    if (h) {
      const title = h[1];
      if (/타협 여지/.test(title)) section = "compromise";
      else if (/저투자/.test(title)) section = "low";
      else section = "";
      continue;
    }
    if (/^-\s+\*\*딜러\*\*/.test(line)) fullDealer = line;
    if (/^-\s+\*\*힐러\*\*/.test(line)) fullHealer = line;

    if (!line.trim().startsWith("|") || !line.includes(name)) continue;
    const cells = line.split("|").map((c) => c.trim()).filter(Boolean);
    if (cells.length < 3) continue;
    // First cell may carry a ★ (전무 caveat marker).
    const nameCell = cells[0];
    if (nameCell.replace(/★/g, "").trim() !== name) continue;

    if (section === "low") {
      // 학생 | 표본 | 대표 빌드 | 이유
      const buildCell = cells[2] ?? "";
      const specToken = buildCell.split(/[·\s]/)[0];
      const slots = parseSpec(specToken);
      if (!slots) continue;
      const freq = buildCell.match(/(\d+%)/)?.[1];
      return {
        kind: "low-invest",
        slots,
        freq,
        reason: stripEmphasis(cells[3] ?? ""),
        weapon: nameCell.includes("★"),
      };
    }
    if (section === "compromise") {
      // 학생 | 역할 | 타협 가능 슬롯
      return { kind: "compromise", role: cells[1] ?? "", slot: cells[2] ?? "" };
    }
  }

  // Full-invest lists (여지없이 풀스작).
  if (fullDealer.includes(name)) return { kind: "full-invest", group: "dealer" };
  if (fullHealer.includes(name)) return { kind: "full-invest", group: "healer" };
  return null;
}

export interface ReportRef {
  slug: string;
  title: string;
  summary: string;
  raidIds: string[];
}

/** Season number from a report slug (notes/s88… or notes/3s33… → 88 / 33). */
function seasonNum(slug: string): number {
  return Number(slug.match(/(?:^|\/)3?s(\d+)/)?.[1] ?? 0);
}

/** All season reports whose body mentions the student name, newest season first. */
export async function findReportsMentioning(name: string): Promise<ReportRef[]> {
  if (!name) return [];
  const reports = await getWikiIndexEntries(isSeasonReport);
  const out: ReportRef[] = [];
  for (const entry of reports) {
    const doc = await getWikiDoc(entry.slug);
    if (doc && doc.body.includes(name)) {
      out.push({
        slug: entry.slug,
        title: doc.frontmatter.title ?? entry.title,
        summary: entry.summary,
        raidIds: doc.frontmatter.raidIds,
      });
    }
  }
  // Newest season first; 총력전(s) before 대결전(3s) on a tie.
  return out.sort((a, b) => {
    const d = seasonNum(b.slug) - seasonNum(a.slug);
    if (d !== 0) return d;
    return (a.slug.includes("/3s") ? 1 : 0) - (b.slug.includes("/3s") ? 1 : 0);
  });
}

/** External SchaleDB page for a student code. */
export function schaleDbStudentUrl(code: number | string): string {
  return `https://schaledb.com/student/${code}`;
}

/**
 * Submit a correction suggestion for a wiki document. The `trap` field is a
 * hidden input that real users never fill; the server drops submissions that
 * carry a value there. Returns true on success.
 */
export async function submitWikiFeedback(input: {
  slug: string;
  comment: string;
  trap?: string;
}): Promise<boolean> {
  try {
    const res = await fetch(`${BASE_URL}/wiki/feedback`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        domain: WIKI_DOMAIN,
        slug: input.slug,
        comment: input.comment,
        trap: input.trap ?? "",
      }),
    });
    return res.ok;
  } catch {
    return false;
  }
}
