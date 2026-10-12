"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Send } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { trackEvent } from "@/utils/analytics";
import { useTranslations } from "@/lib/i18n";
import { Button } from "@/components/ui/button";
import { AronaNameTag } from "./ba-style";
import { PyroxeneBadge } from "./PyroxeneBadge";

/**
 * The home page's question box, drawn as Arona's dialogue window in the game:
 * she speaks first, and the teacher answers in the box below. The
 * conversation itself continues in Arona's Archive.
 */
export function AskArona() {
  const { t } = useTranslations();
  const router = useRouter();
  const [question, setQuestion] = useState("");

  const ask = (e?: React.FormEvent) => {
    e?.preventDefault();
    const q = question.trim();
    if (!q) return;
    trackEvent("home_feature_click", { feature: "arona" });
    router.push(`/guide?q=${encodeURIComponent(q)}`);
  };

  // Enter sends, Shift+Enter breaks the line. Enter that ends a Korean or
  // Chinese IME composition only commits the character.
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
      e.preventDefault();
      ask();
    }
  };

  return (
    <section className="relative mb-8 flex items-end gap-3 sm:gap-5">
      <Image
        src="/arona.webp"
        alt="ARONA"
        width={112}
        height={112}
        priority
        className="hidden h-28 w-28 shrink-0 rounded-full border-4 border-white object-cover shadow-md ring-2 ring-sky-200 sm:block dark:border-sky-950 dark:ring-sky-800"
      />
      <form
        onSubmit={ask}
        className="relative flex-1 rounded-2xl border border-sky-200 bg-white/95 p-4 pt-6 shadow-[0_6px_0_-2px] shadow-sky-200/70 dark:border-sky-800 dark:bg-sky-950/60 dark:shadow-sky-900/70"
      >
        <AronaNameTag className="absolute -top-3.5 left-4" />
        <PyroxeneBadge className="absolute -top-3.5 right-4" />
        <p className="mb-3 text-base font-semibold text-sky-900 dark:text-sky-100 sm:text-lg">
          {t("arona.empty.greeting")}
        </p>
        <Textarea
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={t("home.ask.placeholder")}
          aria-label={t("arona.empty.greeting")}
          rows={2}
          className="min-h-[64px] max-h-[200px] resize-none border-sky-100 bg-sky-50/60 dark:border-sky-900 dark:bg-sky-950/40"
        />
        <div className="mt-3 flex justify-end">
          <Button type="submit" disabled={!question.trim()}>
            <Send className="h-4 w-4" />
            {t("home.ask.submit")}
          </Button>
        </div>
      </form>
    </section>
  );
}
