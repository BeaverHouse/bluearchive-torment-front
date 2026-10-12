"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ChevronDown, ChevronRight, Search, Sprout, Swords, LineChart, Wrench } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import {
  getWikiIndexEntries,
  getWikiDoc,
  aronaSeasonLine,
  firstParagraph,
  raidGuideSummary,
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

const TAB_META: { key: Cat; icon: typeof Sprout }[] = [
  { key: "basics", icon: Sprout },
  { key: "raids", icon: Swords },
  { key: "reports", icon: LineChart },
  { key: "builds", icon: Wrench },
];

// Records are grouped by kind under headers that fold, like a document
// sidebar: every kind stays visible at a glance, and a search opens every
// group so no match is hidden.
export function WikiHub({ compact = false }: { compact?: boolean }) {
  const { t } = useTranslations();
  const [entries, setEntries] = useState<HubEntry[]>([]);
  const [open, setOpen] = useState<Record<Cat, boolean>>({
    basics: true,
    raids: false,
    reports: false,
    builds: false,
  });
  const [query, setQuery] = useState("");

  useEffect(() => {
    let alive = true;
    getWikiIndexEntries((slug) => categorize(slug) !== null).then(async (list) => {
      const resolved = await Promise.all(
        list.map(async (e) => {
          const cat = categorize(e.slug)!;
          const doc = await getWikiDoc(e.slug);
          const title = doc?.frontmatter.title ?? e.title.replace(/\.md$/, "");
          const reportSummary =
            doc && isSeasonReport(e.slug)
              ? aronaSeasonLine(doc.body) || firstParagraph(doc.body)
              : "";
          const summary =
            reportSummary ||
            (doc && cat === "raids" ? raidGuideSummary(doc.body) : "") ||
            e.summary;
          return { ...e, cat, title, summary };
        })
      );
      if (alive) setEntries(resolved);
    });
    return () => {
      alive = false;
    };
  }, []);

  const q = query.trim().toLowerCase();
  const groups = useMemo(
    () =>
      TAB_META.map(({ key, icon }) => ({
        key,
        icon,
        items: entries.filter(
          (e) =>
            e.cat === key &&
            (!q || e.title.toLowerCase().includes(q) || e.summary.toLowerCase().includes(q))
        ),
      })).filter((g) => g.items.length > 0),
    [entries, q]
  );

  return (
    <div>
      <div className={cn("relative mb-3", !compact && "sm:w-56")}>
        <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={t("guide.search")}
          className="pl-8"
        />
      </div>

      {entries.length > 0 && groups.length === 0 ? (
        <p className="py-16 text-center text-sm text-muted-foreground">{t("guide.empty")}</p>
      ) : (
        <div className="space-y-2">
          {groups.map(({ key, icon: Icon, items }) => {
            const expanded = q !== "" || open[key];
            const listId = `wiki-group-${key}`;
            return (
              <section key={key}>
                <button
                  type="button"
                  aria-expanded={expanded}
                  aria-controls={listId}
                  onClick={() => setOpen((prev) => ({ ...prev, [key]: !prev[key] }))}
                  className="flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-sm font-semibold text-sky-900 transition-colors hover:bg-sky-100/70 dark:text-sky-100 dark:hover:bg-sky-900/40"
                >
                  <Icon className="h-4 w-4 text-sky-500" />
                  {t(`guide.section.${key}`)}
                  <span className="text-xs font-normal text-muted-foreground">{items.length}</span>
                  <ChevronDown
                    className={cn(
                      "ml-auto h-4 w-4 text-muted-foreground transition-transform",
                      expanded && "rotate-180"
                    )}
                  />
                </button>
                {expanded && (
                  <ul id={listId} className={cn("mt-1 grid gap-1.5", !compact && "sm:grid-cols-2")}>
                    {items.map((e) => (
                      <li key={e.slug}>
                        <Link
                          href={`/guide/${e.slug}`}
                          className="group flex items-center gap-3 rounded-lg border border-l-4 border-sky-100 border-l-sky-300 bg-card px-3 py-2 transition-all hover:border-sky-300 hover:border-l-sky-500 hover:shadow-sm dark:border-sky-900 dark:border-l-sky-700"
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
              </section>
            );
          })}
        </div>
      )}
    </div>
  );
}
