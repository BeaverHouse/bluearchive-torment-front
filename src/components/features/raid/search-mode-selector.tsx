"use client";

import React from "react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import useSearchModeStore, { type SearchMode } from "@/store/useSearchModeStore";
import { trackEvent } from "@/utils/analytics";

const MODES: { value: SearchMode; label: string }[] = [
  { value: "filter", label: "필터" },
  { value: "pool", label: "캐릭터 풀" },
  { value: "single", label: "단일 파티" },
];

export default function SearchModeSelector() {
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
            {m.label}
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  );
}
