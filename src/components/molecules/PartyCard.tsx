"use client";

import React from "react";
import { PartyData, YoutubeLinkInfo } from "@/types/raid";
import { useTouchDevice } from "@/hooks/useTouchDevice";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Youtube, Trophy } from "lucide-react";
import CharacterImage from "../common/StudentImage";
import { getCharacterName } from "@/utils/character";


interface PartyCardProps {
  data: PartyData;
  studentsMap: Record<string, string>;
  linkInfos: YoutubeLinkInfo[];
  hideRank?: boolean;
}

const PartyCard: React.FC<PartyCardProps> = ({
  data,
  studentsMap,
  linkInfos,
  hideRank = false,
}) => {
  const [openTooltips, setOpenTooltips] = React.useState<Set<string>>(
    new Set()
  );

  const { isTouchDevice } = useTouchDevice();

  const partys = data.partyData;

  return (
    <Card className="relative w-full mx-auto mb-4 max-w-none">
      <CardContent className="p-4">
        {/* Header with rank, score, and YouTube link */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            {!hideRank && (
              <Badge variant="outline" className="font-medium">
                #{data.rank}위
              </Badge>
            )}
            <div className="flex items-center gap-1">
              <Trophy className="h-4 w-4 text-blue-600" />
              <span className="text-lg font-bold text-blue-600">
                {(data.score || 0).toLocaleString()}
              </span>
              <span className="text-sm text-muted-foreground">점</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {linkInfos.length > 0 && (
              <Button
                variant="destructive"
                size="sm"
                asChild
                className="flex items-center gap-1"
              >
                <a
                  href={linkInfos[0].youtubeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Youtube className="h-3 w-3" />
                  {linkInfos[0].score > 0 ? "영상" : "채널"}
                </a>
              </Button>
            )}
          </div>
        </div>

        {/* Party Display */}
        <div className="space-y-3">
          {partys.slice(0, 4).map((party, partyIdx) => (
            <div
              key={partyIdx}
              className="grid grid-cols-6 gap-2 sm:gap-4 p-2 rounded border bg-muted/30 justify-items-center"
            >
              {party.map((char, charIdx) => {
                if (char === 0)
                  return (
                    <div
                      key={charIdx}
                      className="w-10 h-10 sm:w-12 sm:h-12"
                    ></div>
                  );

                const code = Math.floor(char / 1000);
                const tooltipId = `party-${partyIdx}-${charIdx}`;

                return (
                  <CharacterImage code={char} name={getCharacterName(code)} key={tooltipId}/>
                );
              })}
            </div>
          ))}
        </div>

        {/* Show more parties if available */}
        {partys.length > 4 && (
          <div className="mt-4">
            <Accordion type="single" collapsible>
              <AccordionItem value="more-parties">
                <AccordionTrigger className="text-sm">
                  5파티 이후 보기 ({partys.length - 4}개 파티 더)
                </AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-3">
                    {partys.slice(4).map((party, partyIdx) => (
                      <div
                        key={partyIdx + 4}
                        className="grid grid-cols-6 gap-2 sm:gap-4 p-2 rounded border bg-muted/30 justify-items-center"
                      >
                        {party.map((char, charIdx) => {
                          if (char === 0)
                            return (
                              <div
                                key={charIdx}
                                className="w-10 h-10 sm:w-12 sm:h-12"
                              ></div>
                            );

                          const code = Math.floor(char / 1000);
                          const tooltipId = `party-accordion-${
                            partyIdx + 4
                          }-${charIdx}`;

                          return (
                            <CharacterImage code={char} name={getCharacterName(code)} key={tooltipId}/>
                          );
                        })}
                      </div>
                    ))}
                  </div>
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
