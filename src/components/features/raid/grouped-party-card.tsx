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

/** 펼치기에 노출할 비대표 멤버 최대 개수 */
const MAX_VISIBLE = 10;

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

  // 비대표 멤버 중 영상 보유분을 우선, 부족하면 고득점순으로 채워서 최대 MAX_VISIBLE개
  const rest = members.slice(1);
  const withVideo = rest.filter((m) => m.party.video_id);
  const withoutVideo = rest.filter((m) => !m.party.video_id);
  const visible = [...withVideo, ...withoutVideo].slice(0, MAX_VISIBLE);

  return (
    <div className="mb-4">
      <PartyCard
        rank={party.rank}
        value={party.score}
        valueSuffix="점"
        parties={party.partyData}
        video_id={party.video_id}
        raid_id={party.video_id ? (party.raid_id || season) : undefined}
        missingCodes={representative.missingCodes}
      />

      <Collapsible>
        <div className="flex items-center justify-between mx-2 mb-2">
          {visible.length > 0 ? (
            <CollapsibleTrigger className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors">
              <ChevronDown className="h-4 w-4" />
              다른 편성 {visible.length}개 보기
            </CollapsibleTrigger>
          ) : (
            <span />
          )}
          <Badge variant="secondary" className="text-xs">
            {count}회 사용
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
        )}
      </Collapsible>
    </div>
  );
}
