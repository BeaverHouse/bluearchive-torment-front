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
// voice, optionally scoped per difficulty — so the site never invents analysis:
// no matching bullet for this card+difficulty, no strip.
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
      setText(aronaCardComment(doc.body, section, lunatic ? "L" : "T"));
    });
    return () => {
      alive = false;
    };
  }, [raidId, section, lunatic]);

  if (!text) return null;

  return (
    <div className="mt-2 flex items-start gap-2 rounded-lg border border-sky-200/60 bg-sky-50/60 px-3 py-2 dark:border-sky-900/50 dark:bg-sky-950/30">
      <Image
        src="/arona.webp"
        alt="ARONA"
        width={18}
        height={18}
        className="mt-0.5 shrink-0 rounded-full"
      />
      <p className="text-xs leading-relaxed text-sky-800/90 dark:text-sky-200/80">
        {text}
      </p>
    </div>
  );
}
