"use client";

import { useEffect, useState } from "react";
import useBAStore from "@/store/useBAStore";
import RaidSearch from "@/components/features/raid/raid-search";
import RaidSummary from "@/components/features/raid/raid-summary";
import { SeasonTrends } from "@/components/features/raid/season-trends";
import { SeasonNoteCard } from "@/components/features/wiki/season-note-card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SingleSelect } from "@/components/ui/custom/single-select";
import { useStudentMaps } from "@/hooks/use-student-maps";
import { useRaids, getRaidName } from "@/hooks/use-raids";
import { useTranslations } from "@/lib/i18n";

export default function PartyPage() {
  const { V3Season, setV3Season, PartyTab, setPartyTab } = useBAStore();
  const { studentsMap, studentSearchMap } = useStudentMaps();
  const { raids, isLoading } = useRaids();
  const [summaryLevel, setSummaryLevel] = useState<"T" | "L">("T");
  const { t, locale } = useTranslations();

  // Deep-link from a student's related records: /party?season=S89-0 opens the
  // summary tab for that season. Read from location (client-only) to avoid the
  // useSearchParams Suspense requirement at build time.
  useEffect(() => {
    const season = new URLSearchParams(window.location.search).get("season");
    if (season) {
      setV3Season(season);
      setPartyTab("summary");
    }
    // run once on mount for the incoming link
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const raidInfos = raids
    .filter((raid) => raid.party_updated)
    .map((raid) => ({
      value: raid.id,
      label: getRaidName(raid, locale),
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
        <p className="text-muted-foreground">{t("common.loading")}</p>
      </div>
    );
  }

  const season = raidInfos.map((raid) => raid.value).includes(V3Season)
    ? V3Season
    : raidInfos[0].value;

  const currentRaid = raidInfos.find((raid) => raid.value === season)!;
  const seasonDescription = currentRaid.label;
  const seasonNameKo = raids.find((r) => r.id === season)?.name_ko
    ?? raids.find((r) => r.id === season)?.name
    ?? "";

  const seasonTopLevel = currentRaid.topLevel;

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
          placeholder={t("party.placeholder.season")}
        />
      </div>
      <br />
      <Tabs
        value={PartyTab}
        onValueChange={(v) => setPartyTab(v as "search" | "summary" | "trends")}
        className="w-full max-w-4xl"
      >
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="search">{t("party.tab.search")}</TabsTrigger>
          <TabsTrigger value="summary">{t("party.tab.summary")}</TabsTrigger>
          <TabsTrigger value="trends">{t("party.tab.trends")}</TabsTrigger>
        </TabsList>
        <TabsContent value="search">
          <RaidSearch
            season={season}
            studentsMap={studentsMap}
            studentSearchMap={studentSearchMap}
            level="NOUSE"
          />
        </TabsContent>
        <TabsContent value="trends">
          <SeasonTrends />
        </TabsContent>
        <TabsContent value="summary">
          <SeasonNoteCard raidId={season} />
          {hasLunatic ? (
            <Tabs
              value={summaryLevel}
              onValueChange={(v) => setSummaryLevel(v as "T" | "L")}
              className="w-full"
            >
              <TabsList className="grid w-full grid-cols-2 mb-4">
                <TabsTrigger value="T">Torment</TabsTrigger>
                <TabsTrigger value="L">Lunatic</TabsTrigger>
              </TabsList>
              <RaidSummary
                season={season}
                seasonDescription={seasonDescription}
                seasonNameKo={seasonNameKo}
                studentsMap={studentsMap}
                studentSearchMap={studentSearchMap}
                level={effectiveSummaryLevel}
              />
            </Tabs>
          ) : (
            <RaidSummary
              season={season}
              seasonDescription={seasonDescription}
              seasonNameKo={seasonNameKo}
              studentsMap={studentsMap}
              studentSearchMap={studentSearchMap}
              level={effectiveSummaryLevel}
            />
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
