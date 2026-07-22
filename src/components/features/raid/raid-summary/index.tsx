"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Users, Target, TrendingUp, Search, Copy, Check, Youtube,
  ChevronRight, ChevronDown, Star,
} from "lucide-react";
import { VideoIcon } from "@radix-ui/react-icons";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card, CardHeader, CardTitle, CardContent,
} from "@/components/ui/card";
import { RaidComponentProps, RaidSummaryData } from "@/types/raid";
import PartyCard from "../party-card";
import Loading from "@/components/common/loading";
import CardWrapper from "@/components/common/card-wrapper";
import { CharacterUsageTable } from "../character-usage-table";
import { PlatinumStats } from "../platinum-cuts";
import { CharacterAvatar } from "@/components/common/character-image";
import { getCharacterName } from "@/utils/character";
import { PartyCompositionChart } from "./PartyCompositionChart";
import { CharacterGrowthStats } from "./CharacterGrowthStats";
import { AronaCardComment } from "@/components/features/wiki/arona-card-comment";
import {
  createCharTableData,
  createPartyCountData,
} from "./utils/raidDataTransform";
import { generateSearchKeyword } from "@/utils/raid";
import { useSectionView } from "@/hooks/use-section-view";
import { trackEvent } from "@/utils/analytics";
import { useTranslations } from "@/lib/i18n";

/* ------------------------------------------------------------------ */
/*  Types & helpers                                                    */
/* ------------------------------------------------------------------ */

type SectionId =
  | "platinum_stats"
  | "key_characters"
  | "top_5_party"
  | "party_composition"
  | "special_clears"
  | "character_details";

const SECTION_LABELS: Record<SectionId, string> = {
  platinum_stats: "party.summary.platinum",
  key_characters: "party.summary.keyChars",
  top_5_party: "party.summary.top5",
  party_composition: "party.summary.partyRatio.title",
  special_clears: "party.summary.specialClears",
  character_details: "party.summary.charDetails",
};

function SummarySection({
  section,
  children,
}: {
  section: SectionId;
  children: React.ReactNode;
}) {
  const ref = useSectionView("summary_section_view", section);
  return (
    <div id={section} className="scroll-mt-28" ref={ref}>
      {children}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Collapsible card (Tier 3)                                          */
/* ------------------------------------------------------------------ */

function CollapsibleCard({
  icon,
  title,
  children,
  defaultOpen = false,
}: {
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <Card className="my-2 mx-0 gap-3">
      <CardHeader>
        <button
          type="button"
          onClick={() => setOpen(!open)}
          className="flex items-center justify-between w-full"
        >
          <CardTitle className="flex items-center gap-2">
            {icon}
            {title}
          </CardTitle>
          <ChevronDown
            className={`h-4 w-4 text-muted-foreground transition-transform ${
              open ? "rotate-180" : ""
            }`}
          />
        </button>
      </CardHeader>
      {open && <CardContent className="px-2 py-1">{children}</CardContent>}
    </Card>
  );
}

/* ------------------------------------------------------------------ */
/*  Sticky section nav                                                 */
/* ------------------------------------------------------------------ */

function SummaryNav({
  sections,
  t,
}: {
  sections: SectionId[];
  t: (k: string) => string;
}) {
  const [active, setActive] = useState<SectionId>(sections[0]);
  const navRef = useRef<HTMLDivElement>(null);
  const btnRefs = useRef<Map<string, HTMLButtonElement>>(new Map());

  useEffect(() => {
    const els = sections
      .map((id) => document.getElementById(id))
      .filter(Boolean) as HTMLElement[];
    if (els.length === 0) return;

    const ratios = new Map<string, number>();
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries)
          ratios.set(entry.target.id, entry.intersectionRatio);
        let best = sections[0];
        let bestRatio = 0;
        for (const id of sections) {
          const r = ratios.get(id) ?? 0;
          if (r > bestRatio) {
            bestRatio = r;
            best = id;
          }
        }
        if (bestRatio > 0) setActive(best);
      },
      { threshold: [0, 0.1, 0.5, 1] },
    );
    els.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [sections]);

  useEffect(() => {
    const btn = btnRefs.current.get(active);
    const nav = navRef.current;
    if (!btn || !nav) return;
    const left = btn.offsetLeft - nav.offsetWidth / 2 + btn.offsetWidth / 2;
    nav.scrollTo({ left, behavior: "smooth" });
  }, [active]);

  return (
    <nav className="sticky top-14 z-30 -mx-4 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 border-b">
      <div className="max-w-[800px] mx-auto px-4">
        <div
          ref={navRef}
          className="flex gap-1.5 overflow-x-auto py-2"
          style={{ scrollbarWidth: "none", WebkitOverflowScrolling: "touch" }}
        >
          {sections.map((id) => (
            <button
              key={id}
              ref={(el) => {
                if (el) btnRefs.current.set(id, el);
              }}
              onClick={() =>
                document
                  .getElementById(id)
                  ?.scrollIntoView({ behavior: "smooth", block: "start" })
              }
              className={`shrink-0 px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                id === active
                  ? "bg-sky-500 text-white"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
            >
              {t(SECTION_LABELS[id])}
            </button>
          ))}
        </div>
      </div>
    </nav>
  );
}

/* ------------------------------------------------------------------ */
/*  Main component                                                     */
/* ------------------------------------------------------------------ */

const RaidSummary = ({
  season,
  seasonDescription,
  seasonNameKo,
  studentsMap,
  studentSearchMap,
  level,
}: RaidComponentProps) => {
  const router = useRouter();
  const { t } = useTranslations();
  const [copied, setCopied] = useState(false);
  const [showAllAssists, setShowAllAssists] = useState(false);

  // 탭 클릭이 아니라 요약 노출 기준으로 발화 — localStorage로 복원된 진입과
  // 요약을 보는 중의 시즌/난이도 변경까지 모두 집계된다.
  useEffect(() => {
    trackEvent("summary_view", {
      season,
      difficulty: level === "L" ? "lunatic" : "torment",
    });
  }, [season, level]);

  const searchKeyword = generateSearchKeyword(
    seasonNameKo ?? seasonDescription ?? "",
    level === "L" ? "L" : level === "T" ? "T" : "",
  );
  const youtubeSearchUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(searchKeyword)}`;

  const handleCopyKeyword = async () => {
    try {
      await navigator.clipboard.writeText(searchKeyword);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // ignore
    }
  };

  const getSummaryDataQuery = useQuery({
    queryKey: ["getSummaryData", season],
    queryFn: async () => {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_CDN_URL}/batorment/v3/summary/${season}.json`,
      );
      if (!response.ok)
        throw new Error(`HTTP error! status: ${response.status}`);
      return await response.json();
    },
    throwOnError: true,
  });

  const getFilterDataQuery = useQuery({
    queryKey: ["getFilterData", season, level],
    queryFn: async () => {
      const filterPath =
        level === "L" ? "lunatic-filter" : "nonlunatic-filter";
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_CDN_URL}/batorment/v3/${filterPath}/${season}.json`,
      );
      if (!response.ok)
        throw new Error(`HTTP error! status: ${response.status}`);
      return await response.json();
    },
    throwOnError: true,
  });

  if (getSummaryDataQuery.isLoading || getFilterDataQuery.isLoading)
    return <Loading />;

  if (!getSummaryDataQuery.data || !getFilterDataQuery.data) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900" />
      </div>
    );
  }

  const tormentSummaryData = getSummaryDataQuery.data
    .torment as RaidSummaryData;
  const lunaticSummaryData = getSummaryDataQuery.data
    .lunatic as RaidSummaryData;
  const summaryData =
    level === "L" ? lunaticSummaryData : tormentSummaryData;
  const filterData = getFilterDataQuery.data;

  const data: RaidSummaryData = {
    ...summaryData,
    filters: filterData?.filters || {},
    assistFilters: filterData?.assistFilters || {},
    platinumCuts: getSummaryDataQuery.data?.platinumCuts,
    partPlatinumCuts: getSummaryDataQuery.data?.partPlatinumCuts,
  };

  if (!data || data.clearCount === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24">
        <Image
          src="/empty.webp"
          alt="Empty"
          width={192}
          height={192}
          className="mb-4"
        />
        <p className="text-muted-foreground text-lg">
          {t("party.summary.empty")}
        </p>
      </div>
    );
  }

  /* ---- derived data ---- */
  const strikerData = createCharTableData(
    data.filters || {},
    data.clearCount || 0,
    studentsMap,
    "1",
  );
  const specialData = createCharTableData(
    data.filters || {},
    data.clearCount || 0,
    studentsMap,
    "2",
  );
  const assistData = createCharTableData(
    data.assistFilters || {},
    data.clearCount || 0,
    studentsMap,
  ).filter((item) => item.percent >= 1);
  const partyCountData = createPartyCountData(
    data.partyCounts,
    data.clearCount || 0,
  );

  const tormentClearPercent =
    Number(Math.min(tormentSummaryData.clearCount, 20000) / 20000) * 100;
  const lunaticClearPercent =
    Number(Math.min(lunaticSummaryData.clearCount, 20000) / 20000) * 100;

  /* ---- visibility flags ---- */
  const hasEssential = (data.essentialCharacters?.length ?? 0) > 0;
  const hasHighImpact = (data.highImpactCharacters?.length ?? 0) > 0;
  const hasAssists = assistData.length > 0;
  const hasAnyCharData = hasEssential || hasHighImpact || hasAssists;
  const hasSpecialClears = !!data.minUEUser || !!data.maxPartyUser;
  const hasPlatinum = (data.platinumCuts?.length ?? 0) > 0;

  /* ---- nav sections ---- */
  const visibleSections: SectionId[] = [];
  if (hasPlatinum) visibleSections.push("platinum_stats");
  if (hasAnyCharData) visibleSections.push("key_characters");
  visibleSections.push("top_5_party", "party_composition");
  if (hasSpecialClears) visibleSections.push("special_clears");
  visibleSections.push("character_details");

  /* ---- key characters tab config ---- */
  const charTabs: { value: string; label: string }[] = [];
  if (hasEssential) charTabs.push({ value: "essential", label: "Must-Have" });
  if (hasHighImpact) charTabs.push({ value: "high_impact", label: "High Impact" });
  if (hasAssists) charTabs.push({ value: "assistants", label: "Assist" });
  const gridColsClass =
    charTabs.length === 3
      ? "grid-cols-3"
      : charTabs.length === 2
        ? "grid-cols-2"
        : "";

  /* ---- render helpers (deduplicate multi/single tab paths) ---- */
  const renderEssentialGrid = () => (
    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
      {data.essentialCharacters!.map((char) => (
        <div key={char.studentId} className="flex flex-col items-center gap-1 p-1">
          <Link href={`/students/${char.studentId}`}>
            <CharacterAvatar studentId={char.studentId} name={getCharacterName(char.studentId, studentsMap)} />
          </Link>
          <span className="text-xs font-medium truncate w-full text-center">
            {getCharacterName(char.studentId, studentsMap)}
          </span>
          <span className="text-xs font-bold text-sky-600 dark:text-sky-400">
            {(char.ratio * 100).toFixed(1)}%
          </span>
        </div>
      ))}
    </div>
  );

  const renderCharRow = (char: { studentId: string; name: string; percent: number }) => (
    <div key={char.studentId} className="flex items-center gap-3 p-2 rounded-lg">
      <Link href={`/students/${char.studentId}`}>
        <CharacterAvatar studentId={char.studentId} name={char.name} />
      </Link>
      <div className="flex-1 min-w-0">
        <div className="font-bold text-sm truncate">{char.name}</div>
        <div className="text-sm font-bold text-sky-600 dark:text-sky-400">
          {char.percent.toFixed(1)}%
        </div>
      </div>
    </div>
  );

  const renderHighImpactList = () => (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
      {data.highImpactCharacters!.map((char) => (
        <div key={char.studentId} className="flex items-center gap-3 p-2 rounded-lg">
          <Link href={`/students/${char.studentId}`}>
            <CharacterAvatar studentId={char.studentId} name={getCharacterName(char.studentId, studentsMap)} />
          </Link>
          <div className="flex-1 min-w-0">
            <div className="font-bold text-sm truncate">
              {getCharacterName(char.studentId, studentsMap)}
            </div>
            <div className="text-xs text-muted-foreground mt-0.5">
              {t("party.summary.highImpact.best").replace("{n}", String(char.topRank))}
              {" / "}
              {t("party.summary.highImpact.without").replace("{n}", char.withoutBestRank === 0 ? "20000+" : String(char.withoutBestRank))}
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  const isLunatic = level === "L";
  const aronaStrip = (section: SectionId) => (
    <AronaCardComment raidId={season} section={section} lunatic={isLunatic} />
  );

  const renderAssistsList = () => (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {assistData.slice(0, 3).map(renderCharRow)}
      </div>
      {assistData.length > 3 && (
        <>
          <button
            type="button"
            onClick={() => setShowAllAssists(!showAllAssists)}
            className="flex items-center gap-1 text-xs text-sky-600 dark:text-sky-400 mt-3 hover:underline"
          >
            <ChevronDown className={`h-3 w-3 transition-transform ${showAllAssists ? "rotate-180" : ""}`} />
            {showAllAssists
              ? t("party.summary.showLess")
              : t("party.summary.showMore").replace("{n}", String(assistData.length - 3))}
          </button>
          {showAllAssists && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-2">
              {assistData.slice(3).map(renderCharRow)}
            </div>
          )}
        </>
      )}
    </div>
  );

  return (
    <div className="container mx-auto py-4 sm:py-8 max-w-7xl">
      <SummaryNav sections={visibleSections} t={t} />

      {/* ── Action bar ── */}
      <div className="mb-4">
        {searchKeyword && (
          <div className="mb-4 rounded-lg border border-gray-200 dark:border-gray-700 p-3">
            <div className="flex items-center gap-2 mb-2">
              <Search className="h-4 w-4 text-sky-500" />
              <span className="text-sm font-medium">
                {t("party.summary.search")}
              </span>
            </div>
            <code
              className="block w-full rounded bg-muted px-2 py-1.5 text-sm truncate mb-2"
              title={searchKeyword}
            >
              {searchKeyword}
            </code>
            <div className="flex gap-2">
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={handleCopyKeyword}
                className="flex-1 gap-1"
              >
                {copied ? (
                  <Check className="h-4 w-4" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
                <span>
                  {copied
                    ? t("party.summary.copied")
                    : t("party.summary.copy")}
                </span>
              </Button>
              <a
                href={youtubeSearchUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1"
              >
                <Button
                  type="button"
                  size="sm"
                  className="w-full gap-1 bg-red-500 hover:bg-red-600"
                >
                  <Youtube className="h-4 w-4" />
                  <span>YouTube</span>
                </Button>
              </a>
            </div>
          </div>
        )}
        <button
          type="button"
          onClick={() => router.push(`/video-analysis?raid=${season}`)}
          className="group w-full rounded-lg border-2 border-sky-500 bg-sky-500/5 hover:bg-sky-500/10 transition-colors p-4 text-left flex items-center gap-3"
        >
          <div className="rounded-full bg-sky-500 p-2 shrink-0">
            <VideoIcon className="h-5 w-5 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-base font-semibold text-sky-700 dark:text-sky-300">
              {t("party.summary.videoLink")}
            </div>
            <div className="text-xs text-muted-foreground mt-0.5">
              {t("party.summary.videoLinkDesc")}
            </div>
          </div>
          <ChevronRight className="h-5 w-5 text-sky-500 shrink-0 group-hover:translate-x-1 transition-transform" />
        </button>
      </div>

      <div className="space-y-4">
        {/* ═══ TIER 1: At a Glance ═══ */}

        {hasPlatinum && (
          <SummarySection section="platinum_stats">
            <PlatinumStats
              clearCount={data.clearCount || 0}
              clearPercent={
                level === "T" || level === "I"
                  ? tormentClearPercent
                  : lunaticClearPercent
              }
              platinumCuts={data.platinumCuts || []}
              partPlatinumCuts={data.partPlatinumCuts}
              lunaticClearPercent={
                (level === "T" || level === "I") &&
                lunaticSummaryData.clearCount > 0
                  ? lunaticClearPercent
                  : undefined
              }
            />
            {aronaStrip("platinum_stats")}
          </SummarySection>
        )}

        {hasAnyCharData && (
          <SummarySection section="key_characters">
            <CardWrapper
              icon={<Star className="h-5 w-5 text-sky-500" />}
              title={t("party.summary.keyChars")}
            >
              {charTabs.length > 1 ? (
                <Tabs defaultValue={charTabs[0].value} className="w-full">
                  <TabsList className={`grid w-full ${gridColsClass} mb-3`}>
                    {charTabs.map((tab) => (
                      <TabsTrigger key={tab.value} value={tab.value} className="text-xs sm:text-sm">
                        {tab.label}
                      </TabsTrigger>
                    ))}
                  </TabsList>
                  {hasEssential && (
                    <TabsContent value="essential">
                      <p className="text-xs text-muted-foreground mb-3">
                        {t("party.summary.essential.desc")}
                      </p>
                      {renderEssentialGrid()}
                    </TabsContent>
                  )}
                  {hasHighImpact && (
                    <TabsContent value="high_impact">
                      <p className="text-xs text-muted-foreground mb-3">
                        {t("party.summary.highImpact.desc")}
                      </p>
                      {renderHighImpactList()}
                    </TabsContent>
                  )}
                  {hasAssists && (
                    <TabsContent value="assistants">
                      <p className="text-xs text-muted-foreground mb-3">
                        {t("party.summary.topAssist.desc")}
                      </p>
                      {renderAssistsList()}
                    </TabsContent>
                  )}
                </Tabs>
              ) : (
                hasEssential
                  ? renderEssentialGrid()
                  : hasHighImpact
                    ? renderHighImpactList()
                    : renderAssistsList()
              )}
            </CardWrapper>
            {aronaStrip("key_characters")}
          </SummarySection>
        )}

        {/* ═══ TIER 2: Party Data ═══ */}

        <SummarySection section="top_5_party">
          <CardWrapper
            icon={<Users className="h-5 w-5 text-sky-500" />}
            title={t("party.summary.top5")}
            description={t("party.summary.charNoteWeapon")}
          >
            <div className="space-y-3">
              {(data.top5Partys || []).map(
                ([party_string, count], idx) => {
                  const students = party_string.split("_").map(Number);
                  const parties = [];
                  for (let i = 0; i < students.length; i += 6)
                    parties.push(students.slice(i, i + 6));
                  return (
                    <PartyCard
                      key={idx}
                      rank={idx + 1}
                      value={count}
                      valueSuffix={t("party.summary.users")}
                      parties={parties}
                    />
                  );
                },
              )}
            </div>
          </CardWrapper>
          {aronaStrip("top_5_party")}
        </SummarySection>

        <SummarySection section="party_composition">
          <PartyCompositionChart data={partyCountData} />
          {aronaStrip("party_composition")}
        </SummarySection>

        {/* ═══ TIER 3: Deep Dive (collapsed) ═══ */}

        {hasSpecialClears && (
          <SummarySection section="special_clears">
            <CollapsibleCard
              icon={<Target className="h-5 w-5 text-sky-500" />}
              title={t("party.summary.specialClears")}
            >
              <div className="space-y-4">
                {data.minUEUser && (
                  <div>
                    <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
                      <Target className="h-4 w-4 text-sky-500" />
                      {t("party.summary.minUe.title")}
                      <span className="text-xs text-muted-foreground font-normal">
                        {t("party.summary.minUe.desc").replace(
                          "{n}",
                          String(data.minUEUser.ueCount),
                        )}
                      </span>
                    </h4>
                    <PartyCard
                      rank={data.minUEUser.rank}
                      value={data.minUEUser.score}
                      valueSuffix={t("party.summary.points")}
                      parties={data.minUEUser.partyData}
                    />
                  </div>
                )}
                {data.maxPartyUser && (
                  <div>
                    <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
                      <Users className="h-4 w-4 text-sky-500" />
                      {t("party.summary.maxParty.title")}
                      <span className="text-xs text-muted-foreground font-normal">
                        {t("party.summary.maxParty.desc").replace(
                          "{n}",
                          String(data.maxPartyUser.partyData.length),
                        )}
                      </span>
                    </h4>
                    <PartyCard
                      rank={data.maxPartyUser.rank}
                      value={data.maxPartyUser.score}
                      valueSuffix={t("party.summary.points")}
                      parties={data.maxPartyUser.partyData}
                    />
                  </div>
                )}
              </div>
            </CollapsibleCard>
            {aronaStrip("special_clears")}
          </SummarySection>
        )}

        <SummarySection section="character_details">
          <CollapsibleCard
            icon={<TrendingUp className="h-5 w-5 text-sky-500" />}
            title={t("party.summary.charDetails")}
          >
            <div className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <CharacterUsageTable title="STRIKER" data={strikerData} />
                <CharacterUsageTable title="SPECIAL" data={specialData} />
              </div>
              <CharacterGrowthStats
                filters={data.filters || {}}
                studentsMap={studentsMap}
                studentSearchMap={studentSearchMap || {}}
              />
            </div>
          </CollapsibleCard>
          {aronaStrip("character_details")}
        </SummarySection>
      </div>
    </div>
  );
};

export default RaidSummary;
