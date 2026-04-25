"use client";

import React from "react";
import { Filter, Users, Shuffle } from "lucide-react";
import { Button } from "@/components/ui/button";
import useSearchModeStore, { type SearchMode } from "@/store/useSearchModeStore";

const MODES: { value: SearchMode; label: string; icon: React.ReactNode }[] = [
  { value: "filter", label: "필터", icon: <Filter className="h-4 w-4" /> },
  { value: "pool", label: "내 풀", icon: <Users className="h-4 w-4" /> },
  { value: "combo", label: "조합", icon: <Shuffle className="h-4 w-4" /> },
];

export default function SearchModeSelector() {
  const mode = useSearchModeStore((s) => s.mode);
  const setMode = useSearchModeStore((s) => s.setMode);

  return (
    <div className="grid grid-cols-3 gap-1 mb-3">
      {MODES.map((m) => (
        <Button
          key={m.value}
          type="button"
          size="sm"
          variant={mode === m.value ? "default" : "outline"}
          onClick={() => setMode(m.value)}
          className="gap-1"
        >
          {m.icon}
          <span>{m.label}</span>
        </Button>
      ))}
    </div>
  );
}
