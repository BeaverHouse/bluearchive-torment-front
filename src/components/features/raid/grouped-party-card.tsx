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

interface GroupedPartyCardProps {
  group: CompositionGroup;
  season: string;
}

export default function GroupedPartyCard({
  group,
  season,
}: GroupedPartyCardProps) {
  const { representative, members, count } = group;
  const party = representative.party;

  if (count === 1) {
    return (
      <PartyCard
        rank={party.rank}
        value={party.score}
        valueSuffix="점"
        parties={party.partyData}
        video_id={party.video_id}
        raid_id={party.video_id ? (party.raid_id || season) : undefined}
        missingCodes={representative.missingCodes}
      />
    );
  }

  const rest = members.slice(1);

  return (
    <div className="mb-4">
      <div className="relative">
        <PartyCard
          rank={party.rank}
          value={party.score}
          valueSuffix="점"
          parties={party.partyData}
          video_id={party.video_id}
          raid_id={party.video_id ? (party.raid_id || season) : undefined}
          missingCodes={representative.missingCodes}
        />
        <Badge
          variant="secondary"
          className="absolute top-2 right-2 text-xs"
        >
          {count}회 사용
        </Badge>
      </div>

      <Collapsible>
        <CollapsibleTrigger className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors ml-2 mb-2">
          <ChevronDown className="h-4 w-4" />
          다른 편성 {rest.length}개 보기
        </CollapsibleTrigger>
        <CollapsibleContent>
          <div className="border-l-2 border-muted pl-3 ml-2 space-y-0">
            {rest.map((member, idx) => (
              <PartyCard
                key={idx}
                rank={member.party.rank}
                value={member.party.score}
                valueSuffix="점"
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
      </Collapsible>
    </div>
  );
}
