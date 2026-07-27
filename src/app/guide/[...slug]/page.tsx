"use client";

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, ArrowLeft, MapPin } from "lucide-react";
import { MarkdownDoc } from "@/components/features/wiki/markdown-doc";
import { TrustFooter } from "@/components/features/wiki/trust-footer";
import { Badge } from "@/components/ui/badge";
import { getWikiDoc, type WikiDoc } from "@/lib/wiki";
import { trackEvent } from "@/utils/analytics";
import { Languages } from "lucide-react";
import { useTranslations } from "@/lib/i18n";
import { getRaidTerrain, useRaids } from "@/hooks/use-raids";

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
  const router = useRouter();
  const { t, locale } = useTranslations();
  const { raids } = useRaids();
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

  const raid = doc?.frontmatter.raidIds
    .map((raidId) => raids.find((item) => item.id === raidId))
    .find(Boolean);
  const terrain = raid ? getRaidTerrain(raid, locale) : null;

  return (
    <div className="mx-auto max-w-5xl p-2 sm:p-4">
      <div className="overflow-hidden rounded-2xl border bg-card shadow-sm">
        <div className="border-b bg-muted/30 px-3 py-2.5 sm:px-5">
          <button
            type="button"
            onClick={() => router.back()}
            className="inline-flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            {t("wiki.doc.back")}
          </button>
        </div>

        {state === "loading" && (
          <div className="flex min-h-[50vh] items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        )}

        {state === "missing" && (
          <p className="py-24 text-center text-muted-foreground">{t("wiki.doc.missing")}</p>
        )}

        {state === "ready" && doc && (
          <article className="mx-auto max-w-3xl px-4 py-5 sm:px-8 sm:py-8">
            <header className="mb-6 border-b pb-5">
              <div className="mb-2 flex flex-wrap gap-2">
                {doc.frontmatter.type && TYPE_LABELS[doc.frontmatter.type] && (
                  <Badge variant="secondary" className="rounded-full">
                    {TYPE_LABELS[doc.frontmatter.type]}
                  </Badge>
                )}
                {terrain && (
                  <Badge variant="outline" className="gap-1 rounded-full">
                    <MapPin className="h-3 w-3" />
                    {terrain}
                  </Badge>
                )}
              </div>
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
    </div>
  );
}
