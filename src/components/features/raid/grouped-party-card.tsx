"use client";

import React from "react";
import { Badge } from "@/components/ui/badge";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { ChevronDown } from "lucide-react";
import type { CompositionGroup } from "@/lib/composition-grouping";
import PartyCard from "./party-card";
import { useTranslations } from "@/lib/i18n";

interface GroupedPartyCardProps {
  group: CompositionGroup;
  season: string;
}

const MAX_VISIBLE = 10;

export default function GroupedPartyCard({
  group,
  season,
}: GroupedPartyCardProps) {
  const { t } = useTranslations();
  const { representative, members, count } = group;
  const party = representative.party;
  const valueSuffix = t("party.filter.score").replace("{n}", "").trim();

  if (count === 1) {
    return (
      <PartyCard
        rank={party.rank}
        value={party.score}
        valueSuffix={valueSuffix}
        parties={party.partyData}
        video_id={party.video_id}
        raid_id={party.video_id ? (party.raid_id || season) : undefined}
        missingCodes={representative.missingCodes}
      />
    );
  }

  const rest = members.slice(1);
  const withVideo = rest.filter((m) => m.party.video_id);
  const withoutVideo = rest.filter((m) => !m.party.video_id);
  const visible = [...withVideo, ...withoutVideo].slice(0, MAX_VISIBLE);

  return (
    <div className="mb-8">
      <PartyCard
        rank={party.rank}
        value={party.score}
        valueSuffix={valueSuffix}
        parties={party.partyData}
        video_id={party.video_id}
        raid_id={party.video_id ? (party.raid_id || season) : undefined}
        missingCodes={representative.missingCodes}
      />

      <Collapsible>
        <div className="flex items-center justify-between mx-2 -mt-3 mb-2 px-2 py-1 rounded-b-md bg-muted/40">
          {visible.length > 0 ? (
            <CollapsibleTrigger className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors">
              <ChevronDown className="h-4 w-4" />
              {t("party.party.otherCompositions").replace("{n}", String(visible.length))}
            </CollapsibleTrigger>
          ) : (
            <span />
          )}
          <Badge variant="secondary" className="text-xs">
            {t("party.party.uses").replace("{n}", String(count))}
          </Badge>
        </div>
        {visible.length > 0 && (
          <CollapsibleContent>
            <div className="border-l-2 border-muted pl-3 ml-2 space-y-0">
              {visible.map((member, idx) => (
                <PartyCard
                  key={idx}
                  rank={member.party.rank}
                  value={member.party.score}
                  valueSuffix={valueSuffix}
                  parties={member.party.partyData}
                  video_id={member.party.video_id}
                  raid_id={
                    member.party.video_id
                      ? (member.party.raid_id || season)
                      : undefined
                  }
                  missingCodes={member.missingCodes}
                />
              ))}
            </div>
          </CollapsibleContent>
        )}
      </Collapsible>
    </div>
  );
}
