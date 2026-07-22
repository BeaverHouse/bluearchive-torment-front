"use client";

import { useState } from "react";
import Image from "next/image";
import { BookOpen, MessageCircle } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { WikiHub } from "@/components/features/wiki/wiki-hub";
import { AISearchChat } from "@/components/features/ai-search/AISearchChat";
import { useTranslations } from "@/lib/i18n";

// The archive has two modes that each want the full page: talking to Arona and
// browsing the records. Stacking them squeezed both (the chat was too short to
// converse in, the records fell below the fold — invisible on mobile), so they
// are segmented tabs instead: the tab labels themselves make both discoverable.
export default function GuidePage() {
  const { t } = useTranslations();
  const [view, setView] = useState<"ask" | "records">("ask");

  return (
    <div className="mx-auto max-w-4xl px-4 py-6">
      {/* Hero — Arona's archive */}
      <div className="mb-4 flex items-center gap-4 rounded-2xl border border-sky-200/70 bg-gradient-to-br from-sky-50 to-indigo-50/60 p-4 dark:border-sky-900/50 dark:from-sky-950/40 dark:to-indigo-950/20 sm:p-5">
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

      <Tabs value={view} onValueChange={(v) => setView(v as "ask" | "records")}>
        <TabsList className="mb-4 grid w-full grid-cols-2">
          <TabsTrigger value="ask" className="gap-1.5">
            <MessageCircle className="h-4 w-4" />
            {t("guide.tab.ask")}
          </TabsTrigger>
          <TabsTrigger value="records" className="gap-1.5">
            <BookOpen className="h-4 w-4" />
            {t("guide.tab.records")}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="ask">
          <AISearchChat embedded />
        </TabsContent>

        <TabsContent value="records">
          <p className="mb-4 text-sm text-muted-foreground">{t("guide.records.subtitle")}</p>
          <WikiHub />
        </TabsContent>
      </Tabs>
    </div>
  );
}
