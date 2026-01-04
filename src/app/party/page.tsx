"use client";

import useBAStore from "@/store/useBAStore";
import RaidSearch from "@/components/features/raid/raid-search";
import RaidSummary from "@/components/features/raid/raid-summary";
import NormalAnnounce from "@/components/common/normal-announce";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SingleSelect } from "@/components/ui/custom/single-select";
import { trackSummaryTabClick } from "@/utils/analytics";
import { useStudentMaps } from "@/hooks/use-student-maps";
import { useRaids } from "@/hooks/use-raids";

export default function PartyPage() {
  const { V3Season, setV3Season } = useBAStore();
  const { studentsMap, studentSearchMap } = useStudentMaps();
  const { raids, isLoading } = useRaids();
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
      <NormalAnnounce />

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
        <TabsList
          className={`grid w-full ${
            seasonTopLevel === "L" ? "grid-cols-3" : "grid-cols-2"
          }`}
        >
          <TabsTrigger value="search">파티 찾기</TabsTrigger>
          <TabsTrigger
            value="summary"
            onClick={() => trackSummaryTabClick("summary")}
          >
            요약
          </TabsTrigger>
          {seasonTopLevel === "L" && (
            <TabsTrigger
              value="summary-lunatic"
              onClick={() => trackSummaryTabClick("summary-lunatic")}
            >
              요약 (루나틱)
            </TabsTrigger>
          )}
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
          <RaidSummary
            season={season}
            seasonDescription={seasonDescription}
            studentsMap={studentsMap}
            studentSearchMap={studentSearchMap}
            level={seasonTopLevel === "L" ? "T" : seasonTopLevel}
          />
        </TabsContent>
        {seasonTopLevel === "L" && (
          <TabsContent value="summary-lunatic">
            <RaidSummary
              season={season}
              seasonDescription={seasonDescription}
              studentsMap={studentsMap}
              studentSearchMap={studentSearchMap}
              level="L"
            />
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
}
