"use client";

import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Key } from "lucide-react";
import { useTranslations } from "@/lib/i18n";
import { AronaNameTag } from "./ba-style";

interface EmptyStateProps {
  hasApiKey: boolean;
  onSetupApiKey: () => void;
  showSetupAction?: boolean;
}

// Arona greets first, in the game's dialogue window: portrait, slanted name
// tag, and what she can look up.
export function EmptyState({
  hasApiKey,
  onSetupApiKey,
  showSetupAction = true,
}: EmptyStateProps) {
  const { t } = useTranslations();
  const topics = ["student", "guide", "party", "calculate"] as const;
  const icons = { student: "🔎", guide: "📚", party: "📊", calculate: "🧮" };

  return (
    <div className="flex min-h-full flex-col items-center justify-center gap-4 px-2">
      <div className="flex w-full max-w-lg items-end gap-3">
      <Image
        src="/arona.webp"
        alt="ARONA"
        width={72}
        height={72}
        className="hidden h-18 w-18 shrink-0 rounded-full border-4 border-white object-cover shadow-md ring-2 ring-sky-200 sm:block dark:border-sky-950 dark:ring-sky-800"
      />
      <div className="relative min-w-0 flex-1 rounded-2xl border border-sky-200 bg-white/95 px-4 pb-4 pt-6 shadow-[0_6px_0_-2px] shadow-sky-200/70 dark:border-sky-800 dark:bg-sky-950/60 dark:shadow-sky-900/70">
        <AronaNameTag className="absolute -top-3.5 left-4" />
        <p className="mb-3 font-semibold text-sky-900 dark:text-sky-100">{t("arona.empty.greeting")}</p>
        <ul className="grid gap-1.5 text-sm text-muted-foreground sm:grid-cols-2">
          {topics.map((topic) => (
            <li key={topic} className="rounded-lg bg-sky-50 px-3 py-1.5 dark:bg-sky-950/50">
              <span aria-hidden>{icons[topic]} </span>
              <strong className="text-foreground">{t(`arona.empty.${topic}.label`)}</strong>
              <span className="block text-xs">{t(`arona.empty.${topic}.desc`)}</span>
            </li>
          ))}
        </ul>
      </div>
      </div>
      {showSetupAction && !hasApiKey && (
        <Button variant="outline" onClick={onSetupApiKey}>
          <Key className="mr-2 h-4 w-4" />
          {t("arona.empty.setupKey")}
        </Button>
      )}
    </div>
  );
}
