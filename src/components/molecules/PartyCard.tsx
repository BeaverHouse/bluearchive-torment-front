"use client";

import React from "react";
import { categoryLabels } from "../constants";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Youtube, Trophy } from "lucide-react";

interface PartyData {
  rank: number;
  score: number;
  partyData: number[][];
  // v2 호환성을 위한 선택적 속성들
  PARTY_DATA?: Record<string, number[]>;
  LEVEL?: string;
  USER_ID?: number;
  TORMENT_RANK?: number;
  SCORE?: number;
  FINAL_RANK?: number;
}

interface YoutubeLinkInfo {
  userId: number;
  youtubeUrl: string;
  score: number;
}

interface PartyCardProps {
  data: PartyData;
  season: string;
  studentsMap: Record<string, string>;
  seasonDescription: string;
  linkInfos: YoutubeLinkInfo[];
}

const PartyCard: React.FC<PartyCardProps> = ({
  data,
  studentsMap,
  seasonDescription,
  linkInfos,
  season,
}) => {
  const [openTooltips, setOpenTooltips] = React.useState<Set<string>>(
    new Set()
  );

  const [isTouchDevice, setIsTouchDevice] = React.useState(false);

  React.useEffect(() => {
    setIsTouchDevice("ontouchstart" in window || navigator.maxTouchPoints > 0);
  }, []);

  // v3 또는 v2 데이터 구조 처리
  const partys =
    data.partyData ||
    (data.PARTY_DATA
      ? Object.entries(data.PARTY_DATA)
          .sort(
            (a, b) =>
              Number(a[0].replace("party_", "")) -
              Number(b[0].replace("party_", ""))
          )
          .map(([, party]) => party)
      : []);

  return (
    <Card className="relative m-1">
      <CardContent className="px-4">
        {/* Header with rank, score, and YouTube link */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="font-medium">
              #{data.rank || data.TORMENT_RANK}위
            </Badge>
            <div className="flex items-center gap-1">
              <Trophy className="h-4 w-4 text-blue-600" />
              <span className="text-lg font-bold text-blue-600">
                {(data.score || data.SCORE || 0).toLocaleString()}
              </span>
              <span className="text-sm text-muted-foreground">점</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {data.FINAL_RANK &&
              data.FINAL_RANK !== (data.rank || data.TORMENT_RANK) &&
              data.FINAL_RANK > 0 && (
                <Badge variant="secondary" className="text-xs">
                  최종 {data.FINAL_RANK}위
                </Badge>
              )}

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
              className="grid grid-cols-6 gap-4 p-2 rounded border bg-muted/30 justify-items-center"
            >
              {party.map((char, charIdx) => {
                if (char === 0)
                  return <div key={charIdx} className="w-12 h-12"></div>;

                const code = Math.floor(char / 1000);
                const star = Math.floor((char % 1000) / 100);
                const weapon = Math.floor((char % 100) / 10);
                const assist = char % 10;
                const name = studentsMap[code];
                const tooltipId = `party-${data.USER_ID}-${partyIdx}-${charIdx}`;
                const isOpen = openTooltips.has(tooltipId);

                return (
                  <TooltipProvider key={charIdx}>
                    <Tooltip
                      delayDuration={0}
                      open={isTouchDevice ? isOpen : undefined}
                    >
                      <TooltipTrigger asChild>
                        <button
                          type="button"
                          className="flex flex-col items-center cursor-pointer bg-transparent border-none p-0 m-0 select-none"
                          style={{
                            userSelect: "none",
                            WebkitUserSelect: "none",
                            WebkitTouchCallout: "none",
                          }}
                          onTouchStart={(e) => {
                            const touch = e.touches[0];
                            const target = e.target as HTMLElement & {
                              touchStartX?: number;
                              touchStartY?: number;
                              touchStartTime?: number;
                            };
                            target.touchStartX = touch.clientX;
                            target.touchStartY = touch.clientY;
                            target.touchStartTime = Date.now();
                          }}
                          onTouchEnd={(e) => {
                            const touch = e.changedTouches[0];
                            const target = e.target as HTMLElement & {
                              touchStartX?: number;
                              touchStartY?: number;
                              touchStartTime?: number;
                            };
                            const deltaX = Math.abs(
                              touch.clientX - (target.touchStartX || 0)
                            );
                            const deltaY = Math.abs(
                              touch.clientY - (target.touchStartY || 0)
                            );
                            const deltaTime =
                              Date.now() - (target.touchStartTime || 0);

                            // 터치 이동이 10px 미만이고 300ms 이내일 때만 탭으로 인식
                            if (deltaX < 10 && deltaY < 10 && deltaTime < 300) {
                              e.preventDefault();
                              const newTooltips = new Set(openTooltips);
                              if (isOpen) {
                                newTooltips.delete(tooltipId);
                              } else {
                                newTooltips.add(tooltipId);
                              }
                              setOpenTooltips(newTooltips);
                            }
                          }}
                          onContextMenu={(e) => e.preventDefault()}
                        >
                          <div className="w-12 h-12 mb-1 relative">
                            <img
                              src={`${
                                process.env.NEXT_PUBLIC_CDN_URL || ""
                              }/batorment/character/${code}.webp`}
                              alt={name}
                              className={`w-full h-full object-cover rounded ${
                                assist
                                  ? "border-2 border-green-500"
                                  : "border-2 border-transparent"
                              }`}
                              draggable={false}
                            />
                          </div>
                          <div
                            className={`text-xs text-center truncate w-full ${
                              assist
                                ? "text-green-600 font-bold"
                                : "text-muted-foreground"
                            }`}
                          >
                            {categoryLabels[weapon + star]}
                          </div>
                        </button>
                      </TooltipTrigger>
                      <TooltipContent side="top" sideOffset={5}>
                        <p>{assist ? `${name} (조력자)` : name}</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
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
                        className="grid grid-cols-6 gap-4 p-2 rounded border bg-muted/30 justify-items-center"
                      >
                        {party.map((char, charIdx) => {
                          if (char === 0)
                            return (
                              <div key={charIdx} className="w-12 h-12"></div>
                            );

                          const code = Math.floor(char / 1000);
                          const star = Math.floor((char % 1000) / 100);
                          const weapon = Math.floor((char % 100) / 10);
                          const assist = char % 10;
                          const name = studentsMap[code];
                          const tooltipId = `party-accordion-${data.USER_ID}-${
                            partyIdx + 4
                          }-${charIdx}`;
                          const isOpen = openTooltips.has(tooltipId);

                          return (
                            <TooltipProvider key={charIdx}>
                              <Tooltip
                                delayDuration={0}
                                open={isTouchDevice ? isOpen : undefined}
                              >
                                <TooltipTrigger asChild>
                                  <button
                                    type="button"
                                    className="flex flex-col items-center cursor-pointer bg-transparent border-none p-0 m-0 select-none"
                                    style={{
                                      userSelect: "none",
                                      WebkitUserSelect: "none",
                                      WebkitTouchCallout: "none",
                                    }}
                                    onTouchStart={(e) => {
                                      const touch = e.touches[0];
                                      const target = e.target as HTMLElement & {
                                        touchStartX?: number;
                                        touchStartY?: number;
                                        touchStartTime?: number;
                                      };
                                      target.touchStartX = touch.clientX;
                                      target.touchStartY = touch.clientY;
                                      target.touchStartTime = Date.now();
                                    }}
                                    onTouchEnd={(e) => {
                                      const touch = e.changedTouches[0];
                                      const target = e.target as HTMLElement & {
                                        touchStartX?: number;
                                        touchStartY?: number;
                                        touchStartTime?: number;
                                      };
                                      const deltaX = Math.abs(
                                        touch.clientX -
                                          (target.touchStartX || 0)
                                      );
                                      const deltaY = Math.abs(
                                        touch.clientY -
                                          (target.touchStartY || 0)
                                      );
                                      const deltaTime =
                                        Date.now() -
                                        (target.touchStartTime || 0);

                                      // 터치 이동이 10px 미만이고 300ms 이내일 때만 탭으로 인식
                                      if (
                                        deltaX < 10 &&
                                        deltaY < 10 &&
                                        deltaTime < 300
                                      ) {
                                        e.preventDefault();
                                        const newTooltips = new Set(
                                          openTooltips
                                        );
                                        if (isOpen) {
                                          newTooltips.delete(tooltipId);
                                        } else {
                                          newTooltips.add(tooltipId);
                                        }
                                        setOpenTooltips(newTooltips);
                                      }
                                    }}
                                    onContextMenu={(e) => e.preventDefault()}
                                  >
                                    <div className="w-12 h-12 mb-1 relative">
                                      <img
                                        src={`${
                                          process.env.NEXT_PUBLIC_CDN_URL || ""
                                        }/batorment/character/${code}.webp`}
                                        alt={name}
                                        className={`w-full h-full object-cover rounded ${
                                          assist
                                            ? "border-2 border-green-500"
                                            : "border-2 border-transparent"
                                        }`}
                                        draggable={false}
                                      />
                                    </div>
                                    <div
                                      className={`text-xs text-center truncate w-full ${
                                        assist
                                          ? "text-green-600 font-bold"
                                          : "text-muted-foreground"
                                      }`}
                                    >
                                      {categoryLabels[weapon + star]}
                                    </div>
                                  </button>
                                </TooltipTrigger>
                                <TooltipContent side="top" sideOffset={5}>
                                  <p>{assist ? `${name} (조력자)` : name}</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
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
