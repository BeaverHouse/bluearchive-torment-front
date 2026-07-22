"use client";

import Link from "next/link";
import { Sparkles, BadgeCheck, MessageCircle } from "lucide-react";
import { FeedbackForm } from "./feedback-form";
import type { WikiFrontmatter } from "@/lib/wiki";
import { useTranslations } from "@/lib/i18n";

// Fixed panel under every wiki render: states the content is AI-authored, cites
// sources, offers one-click correction, and links onward to ARONA. This trust
// panel is the defense line that lets ai-draft documents surface at all.
export function TrustFooter({
  slug,
  frontmatter,
  askAronaQuery,
}: {
  slug: string;
  frontmatter: WikiFrontmatter;
  askAronaQuery?: string;
}) {
  const { t } = useTranslations();
  const verified = frontmatter.status === "human-verified";

  return (
    <div className="mt-10 space-y-4 rounded-2xl border bg-muted/30 p-5 text-sm">
      <div className="flex flex-wrap items-center gap-2">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-sky-100 px-2.5 py-1 text-xs font-medium text-sky-700 dark:bg-sky-950 dark:text-sky-300">
          <Sparkles className="h-3.5 w-3.5" />
          {t("wiki.trust.aiBadge")}
        </span>
        {verified && (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-medium text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
            <BadgeCheck className="h-3.5 w-3.5" />
            {t("wiki.trust.verified")}
          </span>
        )}
      </div>

      {frontmatter.sources.length > 0 && (
        <div className="text-muted-foreground">
          <div className="mb-1 text-xs font-semibold uppercase tracking-wide">
            {t("wiki.trust.sources")}
          </div>
          <ul className="space-y-1 text-xs leading-relaxed">
            {frontmatter.sources.map((s, i) => (
              <li key={i} className="flex gap-1.5">
                <span className="text-muted-foreground/50">·</span>
                <span>{s}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="flex flex-wrap items-center gap-3 border-t pt-4">
        <FeedbackForm slug={slug} />
        {askAronaQuery && (
          <Link
            href={`/arona?q=${encodeURIComponent(askAronaQuery)}`}
            className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3.5 py-1.5 font-medium text-primary transition hover:bg-primary/15"
          >
            <MessageCircle className="h-4 w-4" />
            {t("wiki.trust.askArona")}
          </Link>
        )}
      </div>
    </div>
  );
}
