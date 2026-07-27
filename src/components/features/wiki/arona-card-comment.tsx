"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import {
  aronaCardComment,
  findReportByRaidId,
  type AronaCardSection,
} from "@/lib/wiki";

// Arona's per-card aside on the summary tab. The text comes from the season
// report's "## 아로나 코멘트" section — one bullet per card, written in her
// voice, optionally scoped per difficulty or Grand Assault armor — so the site
// never invents analysis: no matching bullet for this card+scope, no strip.
export function AronaCardComment({
  raidId,
  section,
  lunatic,
}: {
  raidId: string;
  section: AronaCardSection;
  lunatic: boolean;
}) {
  const [text, setText] = useState<string>("");

  useEffect(() => {
    let alive = true;
    setText("");
    findReportByRaidId(raidId).then((doc) => {
      if (!alive || !doc) return;
      setText(aronaCardComment(doc.body, section, lunatic ? "L" : "T", raidId));
    });
    return () => {
      alive = false;
    };
  }, [raidId, section, lunatic]);

  if (!text) return null;

  return (
    <div className="mt-2 flex items-center justify-center gap-3 px-2 py-1">
      <span className="flex h-11 w-11 shrink-0 items-center justify-center">
        <Image src="/arona.webp" alt="ARONA" width={40} height={40} className="rounded-full" />
      </span>
      <div className="relative min-w-0 max-w-2xl rounded-2xl rounded-bl-md border border-sky-200/70 bg-sky-50/80 px-3 py-2 shadow-sm before:absolute before:-left-1 before:top-1/2 before:h-2 before:w-2 before:-translate-y-1/2 before:rotate-45 before:border-b before:border-l before:border-sky-200/70 before:bg-sky-50 dark:border-sky-900/60 dark:bg-sky-950/40 dark:before:border-sky-900/60 dark:before:bg-sky-950">
        <p className="text-left text-xs leading-relaxed text-sky-800/90 dark:text-sky-200/80">
          {text}
        </p>
      </div>
    </div>
  );
}
