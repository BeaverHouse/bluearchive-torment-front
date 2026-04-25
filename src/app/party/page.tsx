"use client";

import { useState } from "react";
import useBAStore from "@/store/useBAStore";
import RaidSearch from "@/components/features/raid/raid-search";
import RaidSummary from "@/components/features/raid/raid-summary";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { SingleSelect } from "@/components/ui/custom/single-select";
import { trackSummaryTabClick } from "@/utils/analytics";
import { useStudentMaps } from "@/hooks/use-student-maps";
import { useRaids } from "@/hooks/use-raids";

export default function PartyPage() {
  const { V3Season, setV3Season } = useBAStore();
  const { studentsMap, studentSearchMap } = useStudentMaps();
  const { raids, isLoading } = useRaids();
  const [summaryLevel, setSummaryLevel] = useState<"T" | "L">("T");

  const raidInfos = raids
    .filter((raid) => raid.party_updated)
    .map((raid) => ({
      value: raid.id,
      label: raid.name,
      topLevel: raid.top_level,
    }));

  // 로딩 중이거나 데이터가 없으면 로딩 화면 표시
  if (isLoading || raidInfos.length === 0) {
    return (
      <div
        className="App"
        style={{
          width: "100%",
          maxWidth: 800,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          textAlign: "center",
          margin: "0 auto",
          padding: "4px",
          minHeight: "50vh",
        }}
      >
        <p className="text-muted-foreground">데이터를 불러오는 중...</p>
      </div>
    );
  }

  const season = raidInfos.map((raid) => raid.value).includes(V3Season)
    ? V3Season
    : raidInfos[0].value;

  const seasonDescription = raidInfos.find(
    (raid) => raid.value === season
  )!.label;

  const seasonTopLevel = raidInfos.find(
    (raid) => raid.value === season
  )!.topLevel;

  const hasLunatic = seasonTopLevel === "L";
  // Lunatic 미지원 시즌이면 강제로 T로 폴백
  const effectiveSummaryLevel: "T" | "I" | "L" = hasLunatic
    ? summaryLevel
    : seasonTopLevel === "L"
      ? "T"
      : (seasonTopLevel as "T" | "I");

  return (
    <div
      className="App"
      style={{
        width: "100%",
        maxWidth: 800,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        textAlign: "center",
        margin: "0 auto",
        padding: "4px",
      }}
    >
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          justifyContent: "center",
          textAlign: "center",
          width: "90%",
        }}
      >
        <SingleSelect
          options={raidInfos.map((raid) => ({
            value: raid.value,
            label: raid.label,
          }))}
          value={season}
          onChange={setV3Season}
          placeholder="총력전/대결전 선택"
        />
      </div>
      <br />
      <Tabs defaultValue="search" className="w-full max-w-4xl">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="search">파티 찾기</TabsTrigger>
          <TabsTrigger
            value="summary"
            onClick={() => trackSummaryTabClick("summary")}
          >
            요약
          </TabsTrigger>
        </TabsList>
        <TabsContent value="search">
          <RaidSearch
            season={season}
            studentsMap={studentsMap}
            studentSearchMap={studentSearchMap}
            level="NOUSE"
          />
        </TabsContent>
        <TabsContent value="summary">
          {hasLunatic && (
            <div className="flex justify-center gap-1 mb-4">
              <Button
                size="sm"
                variant={summaryLevel === "T" ? "default" : "outline"}
                onClick={() => {
                  setSummaryLevel("T");
                  trackSummaryTabClick("summary");
                }}
              >
                Torment
              </Button>
              <Button
                size="sm"
                variant={summaryLevel === "L" ? "default" : "outline"}
                onClick={() => {
                  setSummaryLevel("L");
                  trackSummaryTabClick("summary-lunatic");
                }}
              >
                Lunatic
              </Button>
            </div>
          )}
          <RaidSummary
            season={season}
            seasonDescription={seasonDescription}
            studentsMap={studentsMap}
            studentSearchMap={studentSearchMap}
            level={effectiveSummaryLevel}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
