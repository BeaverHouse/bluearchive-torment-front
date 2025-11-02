"use client";

import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Youtube } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import SingleParty from "../common/single-party";
import { trackVideoClick } from "@/utils/analytics";

interface PartyCardProps {
  rank: number;
  value: number;
  valueSuffix: string;
  parties: number[][];
  video_id?: string;
  raid_id: string;
}

const PartyCard: React.FC<PartyCardProps> = ({
  rank,
  value,
  valueSuffix,
  parties,
  video_id,
  raid_id,
}) => {
  const handleVideoClick = () => {
    if (video_id) {
      trackVideoClick(video_id, raid_id, value);
      window.open(`/video-analysis/${video_id}?raid_id=${raid_id}`, "_blank");
    }
  };

  return (
    <Card className="relative w-full mx-auto mb-4 max-w-none">
      <CardContent className="px-2">
        <div className="flex items-center justify-between mb-3">
          {rank > 0 && (
            <Badge variant="outline" className="font-medium">
              #{rank}위
            </Badge>
          )}
          <div className="text-right flex items-center gap-2">
            <div className="flex items-center gap-1">
              <div className="text-lg font-bold text-blue-600">{value}</div>
              <div className="text-xs text-muted-foreground">{valueSuffix}</div>
            </div>
            {video_id && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleVideoClick}
                className="h-7 gap-1 px-2 border-red-500 text-red-500 hover:bg-red-50 dark:hover:bg-red-950"
              >
                <Youtube className="h-4 w-4" />
                <span className="text-xs">영상</span>
              </Button>
            )}
          </div>
        </div>

        {parties.slice(0, 4).map((party, partyIdx) => (
          <SingleParty party={party} key={"party" + partyIdx} />
        ))}

        {parties.length > 4 && (
          <div className="mt-4">
            <Accordion type="single" collapsible>
              <AccordionItem value="more-parties">
                <AccordionTrigger className="text-sm">
                  5파티 이후 보기
                </AccordionTrigger>
                <AccordionContent>
                  {parties.slice(4).map((party, partyIdx) => (
                    <SingleParty party={party} key={"party" + partyIdx} />
                  ))}
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PartyCard;
