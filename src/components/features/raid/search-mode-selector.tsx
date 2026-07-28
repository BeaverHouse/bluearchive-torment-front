"use client";

import React from "react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import useSearchModeStore, { type SearchMode } from "@/store/useSearchModeStore";
import { trackEvent } from "@/utils/analytics";
import { useTranslations } from "@/lib/i18n";
import { ContextHelp } from "@/components/common/context-help";

const MODES: { value: SearchMode; tkey: string }[] = [
  { value: "filter", tkey: "party.search.tab.filter" },
  { value: "pool", tkey: "party.search.tab.pool" },
  { value: "single", tkey: "party.search.tab.single" },
];

export default function SearchModeSelector() {
  const { t } = useTranslations();
  const mode = useSearchModeStore((s) => s.mode);
  const setMode = useSearchModeStore((s) => s.setMode);

  // 전환 클릭만 잡으면 localStorage로 복원된 초기 모드가 누락되므로 진입 시 1회 발화
  React.useEffect(() => {
    trackEvent("party_search_mode", { mode: useSearchModeStore.getState().mode });
  }, []);

  return (
    <Tabs
      value={mode}
      onValueChange={(v) => {
        const next = v as SearchMode;
        setMode(next);
        trackEvent("party_search_mode", { mode: next });
      }}
      className="mb-4 w-full"
    >
      <div className="rounded-xl bg-muted/50 p-2">
        <div className="mb-1.5 flex items-center justify-between px-1">
          <span className="text-xs font-medium text-muted-foreground">
            {t("party.help.mode.title")}
          </span>
          <ContextHelp
            label={t("common.contextHelp")}
            title={t("party.help.mode.title")}
            items={[
              t("party.help.mode.filter"),
              t("party.help.mode.pool"),
              t("party.help.mode.single"),
            ]}
          />
        </div>
        <TabsList className="grid w-full grid-cols-3 bg-background/70">
          {MODES.map((m) => (
            <TabsTrigger key={m.value} value={m.value}>
              {t(m.tkey)}
            </TabsTrigger>
          ))}
        </TabsList>
      </div>
    </Tabs>
  );
}
