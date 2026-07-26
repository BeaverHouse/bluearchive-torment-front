"use client";

import { useEffect, useState } from "react";
import { BookOpen, MessageCircle } from "lucide-react";
import { AronaNoteCard } from "./arona-note-card";
import { aronaSeasonLine, findReportByRaidId, firstParagraph, type WikiDoc } from "@/lib/wiki";
import { getRaidTerrain, useRaids } from "@/hooks/use-raids";
import { useTranslations } from "@/lib/i18n";

// Places "Arona's season note" atop the summary tab. The season → report mapping
// comes from the wiki itself (report frontmatter raid_ids). No report → nothing
// renders (no empty box).
export function SeasonNoteCard({ raidId }: { raidId: string }) {
  const { t, locale } = useTranslations();
  const { raids } = useRaids();
  const [doc, setDoc] = useState<WikiDoc | null>(null);

  useEffect(() => {
    let alive = true;
    setDoc(null);
    findReportByRaidId(raidId).then((d) => alive && setDoc(d));
    return () => {
      alive = false;
    };
  }, [raidId]);

  if (!doc) return null;

  // Prefer the report's Arona-voice season line; fall back to the headline
  // definition so seasons without the comment section still show something.
  const excerpt = aronaSeasonLine(doc.body) || firstParagraph(doc.body);
  if (!excerpt) return null;
  const raid = raids.find((item) => item.id === raidId);
  const terrain = raid ? getRaidTerrain(raid, locale) : null;
  const subtitle = [doc.frontmatter.title, terrain].filter(Boolean).join(" · ");

  return (
    <div className="mb-4">
      <AronaNoteCard
        context="party"
        slug={doc.slug}
        subtitle={subtitle}
        links={[
          { label: t("party.note.full"), href: `/guide/${doc.slug}`, icon: BookOpen },
          {
            label: t("arona.entry.ask"),
            href: `/guide`,
            icon: MessageCircle,
          },
        ]}
      >
        <p className="leading-relaxed">{excerpt}</p>
      </AronaNoteCard>
    </div>
  );
}
