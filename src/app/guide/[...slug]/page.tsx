"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { Loader2, ArrowLeft } from "lucide-react";
import { MarkdownDoc } from "@/components/features/wiki/markdown-doc";
import { TrustFooter } from "@/components/features/wiki/trust-footer";
import { Badge } from "@/components/ui/badge";
import { getWikiDoc, type WikiDoc } from "@/lib/wiki";
import { trackEvent } from "@/utils/analytics";
import { Languages } from "lucide-react";
import { useTranslations } from "@/lib/i18n";

const TYPE_LABELS: Record<string, string> = {
  "raid-guide": "보스 공략",
  note: "리포트",
  guide: "가이드",
  hub: "가이드",
  history: "기록",
};

export default function WikiDocPage({
  params,
}: {
  params: Promise<{ slug: string[] }>;
}) {
  const { slug } = use(params);
  const slugPath = slug.join("/");
  const { t, locale } = useTranslations();
  const [doc, setDoc] = useState<WikiDoc | null>(null);
  const [state, setState] = useState<"loading" | "ready" | "missing">("loading");

  useEffect(() => {
    let alive = true;
    getWikiDoc(slugPath).then((d) => {
      if (!alive) return;
      if (d) {
        setDoc(d);
        setState("ready");
        trackEvent("wiki_doc_view", { slug: slugPath });
      } else {
        setState("missing");
      }
    });
    return () => {
      alive = false;
    };
  }, [slugPath]);

  return (
    <div className="mx-auto max-w-3xl px-4 py-6">
      <Link
        href="/guide"
        className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        {t("wiki.doc.back")}
      </Link>

      {state === "loading" && (
        <div className="flex min-h-[50vh] items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      )}

      {state === "missing" && (
        <p className="py-24 text-center text-muted-foreground">{t("wiki.doc.missing")}</p>
      )}

      {state === "ready" && doc && (
        <article>
          <header className="mb-6 border-b pb-5">
            {doc.frontmatter.type && TYPE_LABELS[doc.frontmatter.type] && (
              <Badge variant="secondary" className="mb-2 rounded-full">
                {TYPE_LABELS[doc.frontmatter.type]}
              </Badge>
            )}
            {doc.frontmatter.title && (
              <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
                {doc.frontmatter.title}
              </h1>
            )}
          </header>
          {locale !== "ko" && (
            <div className="mb-5 flex items-start gap-2 rounded-lg border bg-muted/40 px-3 py-2 text-xs text-muted-foreground">
              <Languages className="mt-0.5 h-4 w-4 shrink-0" />
              <span>
                {t("wiki.doc.koOnly")} {t("wiki.doc.koOnlyAsk")}
              </span>
            </div>
          )}
          <MarkdownDoc body={doc.body} />
          <TrustFooter
            slug={doc.slug}
            frontmatter={doc.frontmatter}
            askAronaQuery={doc.frontmatter.title}
          />
        </article>
      )}
    </div>
  );
}
