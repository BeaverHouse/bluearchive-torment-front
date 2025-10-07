"use client";

import React from "react";
import { PartyData, YoutubeLinkInfo } from "@/types/raid";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import SingleParty from "../common/SingleParty";

interface PartyCardProps {
  rank: number;
  value: number;
  valueSuffix: string;
  parties: number[][];
}

const PartyCard: React.FC<PartyCardProps> = ({
  rank,
  value,
  valueSuffix,
  parties,
}) => {
  return (
    <Card className="relative w-full mx-auto mb-4 max-w-none">
      <CardContent className="px-2">
        <div className="flex items-center justify-between mb-3">
          {rank > 0 && (
            <Badge variant="outline" className="font-medium">
              #{rank}위
            </Badge>
          )}
          <div className="text-right flex items-center gap-1">
            <div className="text-lg font-bold text-blue-600">{value}</div>
            <div className="text-xs text-muted-foreground">{valueSuffix}</div>
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
