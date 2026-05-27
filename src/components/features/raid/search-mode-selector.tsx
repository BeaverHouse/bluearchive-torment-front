"use client";

import React from "react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import useSearchModeStore, { type SearchMode } from "@/store/useSearchModeStore";
import { trackEvent } from "@/utils/analytics";
import { useTranslations } from "@/lib/i18n";

const MODES: { value: SearchMode; tkey: string }[] = [
  { value: "filter", tkey: "party.search.tab.filter" },
  { value: "pool", tkey: "party.search.tab.pool" },
  { value: "single", tkey: "party.search.tab.single" },
];

export default function SearchModeSelector() {
  const { t } = useTranslations();
  const mode = useSearchModeStore((s) => s.mode);
  const setMode = useSearchModeStore((s) => s.setMode);

  return (
    <Tabs
      value={mode}
      onValueChange={(v) => {
        const next = v as SearchMode;
        setMode(next);
        trackEvent("party_search_mode", { mode: next });
      }}
      className="w-full mb-4"
    >
      <TabsList className="grid w-full grid-cols-3">
        {MODES.map((m) => (
          <TabsTrigger key={m.value} value={m.value}>
            {t(m.tkey)}
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  );
}
