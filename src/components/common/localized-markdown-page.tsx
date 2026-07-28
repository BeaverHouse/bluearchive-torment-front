"use client";

import { useEffect, useState } from "react";
import { MarkdownDoc } from "@/components/features/wiki/markdown-doc";
import { useTranslations } from "@/lib/i18n";

type MarkdownPageName = "guide" | "privacy" | "terms";

export function LocalizedMarkdownPage({ name }: { name: MarkdownPageName }) {
  const { locale, t } = useTranslations();
  const [body, setBody] = useState<string | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    const language = locale === "ko" ? "ko" : "en";

    setBody(null);
    setFailed(false);

    fetch(`/data/pages/${name}_${language}.md`, { signal: controller.signal })
      .then((response) => {
        if (!response.ok) throw new Error(`Failed to load ${name}`);
        return response.text();
      })
      .then(setBody)
      .catch((error: unknown) => {
        if (error instanceof DOMException && error.name === "AbortError") return;
        setFailed(true);
      });

    return () => controller.abort();
  }, [locale, name]);

  return (
    <article className="mx-auto max-w-4xl rounded-2xl border bg-card p-4 shadow-sm sm:p-8">
      {failed ? (
        <p className="py-12 text-center text-sm text-muted-foreground">
          {t("common.contentLoadError")}
        </p>
      ) : body === null ? (
        <p className="py-12 text-center text-sm text-muted-foreground">
          {t("common.loading")}
        </p>
      ) : (
        <MarkdownDoc body={body} />
      )}
    </article>
  );
}
