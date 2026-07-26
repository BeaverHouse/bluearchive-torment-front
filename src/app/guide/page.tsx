"use client";

import { useState } from "react";
import Image from "next/image";
import { BookOpen, MessageCircle } from "lucide-react";
import { WikiHub } from "@/components/features/wiki/wiki-hub";
import { AISearchChat } from "@/components/features/ai-search/AISearchChat";
import { useTranslations } from "@/lib/i18n";
import { cn } from "@/lib/utils";

// The archive has two modes that each want the full page: talking to Arona and
// browsing the records. Stacking them squeezed both (the chat was too short to
// converse in, the records fell below the fold — invisible on mobile), so they
// are segmented tabs instead: the tab labels themselves make both discoverable.
export default function GuidePage() {
  const { t } = useTranslations();
  const [view, setView] = useState<"ask" | "records">("ask");

  return (
    <div className="mx-auto max-w-7xl py-2 sm:px-2 sm:py-4 lg:px-4">
      <div className="flex items-center gap-3 rounded-t-2xl border border-primary/25 bg-gradient-to-r from-primary/15 to-primary/5 p-3 sm:gap-4 sm:p-4">
        <span className="relative flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-white shadow ring-2 ring-sky-200 dark:bg-sky-950 dark:ring-sky-800 sm:h-14 sm:w-14">
          <Image src="/arona.webp" alt="ARONA" width={44} height={44} className="rounded-full" />
        </span>
        <div className="min-w-0 flex-1">
          <h1 className="text-xl font-bold text-sky-900 dark:text-sky-100 sm:text-2xl">
            {t("guide.hero.title")}
          </h1>
          <p className="mt-1 text-sm text-sky-700/80 dark:text-sky-300/70">
            {t("guide.hero.subtitle")}
          </p>
        </div>
      </div>

      <div className="overflow-hidden rounded-b-2xl border-x border-b border-border bg-card shadow-sm">
        <div
          role="tablist"
          aria-label={t("guide.hero.title")}
          className="m-2 grid grid-cols-2 rounded-lg bg-muted p-1 lg:hidden"
        >
          <button
            type="button"
            role="tab"
            aria-selected={view === "ask"}
            onClick={() => setView("ask")}
            className={cn(
              "inline-flex items-center justify-center gap-1.5 whitespace-nowrap rounded-md px-2 py-1.5 text-xs font-medium transition-colors sm:text-sm",
              view === "ask" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground"
            )}
          >
              <MessageCircle className="h-4 w-4" />
              {t("guide.tab.ask")}
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={view === "records"}
            onClick={() => setView("records")}
            className={cn(
              "inline-flex items-center justify-center gap-1.5 whitespace-nowrap rounded-md px-2 py-1.5 text-xs font-medium transition-colors sm:text-sm",
              view === "records"
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground"
            )}
          >
              <BookOpen className="h-4 w-4" />
              {t("guide.tab.records")}
          </button>
        </div>

        <div className="lg:grid lg:grid-cols-[17rem_minmax(0,1fr)]">
          <aside
            role="tabpanel"
            className={cn(
              "overflow-y-auto bg-muted/30 p-3 lg:block lg:h-[calc(100dvh-330px)] lg:min-h-[420px] lg:border-r lg:p-4",
              view === "records" ? "block" : "hidden"
            )}
          >
            <div className="mb-4 hidden items-center gap-2 lg:flex">
              <BookOpen className="h-4 w-4 text-primary" />
              <h2 className="text-sm font-semibold">{t("guide.tab.records")}</h2>
            </div>
            <p className="mb-4 text-sm text-muted-foreground lg:hidden">
              {t("guide.records.subtitle")}
            </p>
            <WikiHub compact />
          </aside>

          <section
            role="tabpanel"
            className={cn("p-2 lg:block lg:p-4", view === "ask" ? "block" : "hidden")}
          >
            <AISearchChat embedded />
          </section>
        </div>
      </div>
    </div>
  );
}
