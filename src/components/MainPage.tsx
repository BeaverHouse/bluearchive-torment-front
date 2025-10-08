"use client";

import useBAStore from "../store/useBAStore";
import RaidSearch from "./molecules/RaidSearch";
import RaidSummary from "./molecules/RaidSummary";
import InfoFAB from "./atoms/InfoFAB";
import NormalAnnounce from "./atoms/NormalAnnounce";
import raidsData from "../../data/raids.json";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RaidInfo } from "@/types/raid";
import { getStudentsMap } from "@/utils/character";
import { SingleSelect } from "./custom/single-select";

function MainPage() {
  const { V3Season, setV3Season } = useBAStore();

  const studentsMap = getStudentsMap();
  const raidInfos = (raidsData as RaidInfo[])
    .filter((raid) => raid.party_updated)
    .map((raid) => ({
      value: raid.id,
      label: raid.name,
      topLevel: raid.top_level,
    }));

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
        padding: "5px",
      }}
    >
      <NormalAnnounce />
      <InfoFAB />

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
          value={V3Season}
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
          <TabsTrigger value="summary">요약</TabsTrigger>
          {seasonTopLevel === "L" && (
            <TabsTrigger value="summary-lunatic">요약 (루나틱)</TabsTrigger>
          )}
        </TabsList>
        <TabsContent value="search">
          <RaidSearch season={season} studentsMap={studentsMap} level="NOUSE" />
        </TabsContent>
        <TabsContent value="summary">
          <RaidSummary
            season={season}
            seasonDescription={seasonDescription}
            studentsMap={studentsMap}
            level={seasonTopLevel === "L" ? "T" : seasonTopLevel}
          />
        </TabsContent>
        {seasonTopLevel === "L" && (
          <TabsContent value="summary-lunatic">
            <RaidSummary
              season={season}
              seasonDescription={seasonDescription}
              studentsMap={studentsMap}
              level="L"
            />
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
}

export default MainPage;
