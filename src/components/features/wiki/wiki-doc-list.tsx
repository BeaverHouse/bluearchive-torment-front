"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { getWikiIndexEntries, getWikiDoc, type WikiIndexEntry } from "@/lib/wiki";

interface Resolved extends WikiIndexEntry {
  verified?: boolean;
}

// True when the index used the file name as the link text (raids table does).
const looksLikeFilename = (title: string, slug: string) =>
  title.endsWith(".md") || title === slug.split("/").pop();

// Lists wiki documents whose slug satisfies `match`, as cards. Titles that are
// bare file names get resolved to the document's frontmatter title. Renders
// nothing while empty / on fetch failure (no error box).
export function WikiDocList({ match }: { match: (slug: string) => boolean }) {
  const [entries, setEntries] = useState<Resolved[]>([]);

  useEffect(() => {
    let alive = true;
    getWikiIndexEntries(match).then(async (list) => {
      const resolved = await Promise.all(
        list.map(async (e) => {
          if (!looksLikeFilename(e.title, e.slug)) return e;
          const doc = await getWikiDoc(e.slug);
          return {
            ...e,
            title: doc?.frontmatter.title ?? e.title.replace(/\.md$/, ""),
            verified: doc?.frontmatter.status === "human-verified",
          };
        })
      );
      if (alive) setEntries(resolved);
    });
    return () => {
      alive = false;
    };
    // match is a stable function reference per call site
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (entries.length === 0) return null;

  return (
    <ul className="grid gap-2 sm:grid-cols-2">
      {entries.map((e) => (
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
  );
}
