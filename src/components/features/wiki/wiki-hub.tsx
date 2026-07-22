"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ChevronRight, Search, Sprout, Swords, LineChart, Wrench } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import {
  getWikiIndexEntries,
  getWikiDoc,
  isRaidGuide,
  isSeasonReport,
  isBuildNote,
  type WikiIndexEntry,
} from "@/lib/wiki";
import { useTranslations } from "@/lib/i18n";

type Cat = "basics" | "raids" | "reports" | "builds";

interface HubEntry extends WikiIndexEntry {
  cat: Cat;
}

const isBasicGuide = (slug: string) => slug.startsWith("guides/") && !isBuildNote(slug);

function categorize(slug: string): Cat | null {
  if (isRaidGuide(slug)) return "raids";
  if (isSeasonReport(slug)) return "reports";
  if (isBuildNote(slug)) return "builds";
  if (isBasicGuide(slug)) return "basics";
  return null;
}

const looksLikeFilename = (title: string, slug: string) =>
  title.endsWith(".md") || title === slug.split("/").pop();

const TAB_META: { key: Cat; icon: typeof Sprout }[] = [
  { key: "basics", icon: Sprout },
  { key: "raids", icon: Swords },
  { key: "reports", icon: LineChart },
  { key: "builds", icon: Wrench },
];

export function WikiHub() {
  const { t } = useTranslations();
  const [entries, setEntries] = useState<HubEntry[]>([]);
  const [tab, setTab] = useState<Cat | "all">("all");
  const [query, setQuery] = useState("");

  useEffect(() => {
    let alive = true;
    getWikiIndexEntries((slug) => categorize(slug) !== null).then(async (list) => {
      const resolved = await Promise.all(
        list.map(async (e) => {
          const cat = categorize(e.slug)!;
          if (!looksLikeFilename(e.title, e.slug)) return { ...e, cat };
          const doc = await getWikiDoc(e.slug);
          return { ...e, cat, title: doc?.frontmatter.title ?? e.title.replace(/\.md$/, "") };
        })
      );
      if (alive) setEntries(resolved);
    });
    return () => {
      alive = false;
    };
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return entries.filter(
      (e) =>
        (tab === "all" || e.cat === tab) &&
        (!q || e.title.toLowerCase().includes(q) || e.summary.toLowerCase().includes(q))
    );
  }, [entries, tab, query]);

  const counts = useMemo(() => {
    const c: Record<string, number> = { all: entries.length };
    for (const e of entries) c[e.cat] = (c[e.cat] ?? 0) + 1;
    return c;
  }, [entries]);

  return (
    <div>
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-1.5">
          <TabButton active={tab === "all"} onClick={() => setTab("all")} count={counts.all}>
            {t("guide.tab.all")}
          </TabButton>
          {TAB_META.map(({ key, icon: Icon }) => (
            <TabButton key={key} active={tab === key} onClick={() => setTab(key)} count={counts[key]}>
              <Icon className="h-3.5 w-3.5" />
              {t(`guide.section.${key}`)}
            </TabButton>
          ))}
        </div>
        <div className="relative sm:w-56">
          <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t("guide.search")}
            className="pl-8"
          />
        </div>
      </div>

      {filtered.length === 0 ? (
        <p className="py-16 text-center text-sm text-muted-foreground">{t("guide.empty")}</p>
      ) : (
        <ul className="grid gap-2 sm:grid-cols-2">
          {filtered.map((e) => (
            <li key={e.slug}>
              <Link
                href={`/guide/${e.slug}`}
                className="group flex items-center gap-3 rounded-xl border bg-card p-3 shadow-sm transition-all hover:border-primary/40 hover:shadow-md"
              >
                <div className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-semibold group-hover:text-primary">
                    {e.title}
                  </span>
                  {e.summary && (
                    <span className="mt-0.5 line-clamp-1 block text-xs text-muted-foreground">
                      {e.summary}
                    </span>
                  )}
                </div>
                <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground/50 transition-transform group-hover:translate-x-0.5 group-hover:text-primary" />
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function TabButton({
  active,
  onClick,
  count,
  children,
}: {
  active: boolean;
  onClick: () => void;
  count?: number;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium transition-colors",
        active ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:text-foreground"
      )}
    >
      {children}
      {count != null && <span className="text-xs opacity-70">{count}</span>}
    </button>
  );
}
