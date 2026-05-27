"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Users, Target, TrendingUp, Search, Copy, Check, Youtube, ChevronRight } from "lucide-react";
import { VideoIcon } from "@radix-ui/react-icons";
import { RaidComponentProps, RaidSummaryData } from "@/types/raid";
import PartyCard from "../party-card";
import Loading from "@/components/common/loading";
import CardWrapper from "@/components/common/card-wrapper";
import { CharacterUsageTable } from "../character-usage-table";
import { PlatinumStats } from "../platinum-cuts";
import { EssentialCharacters } from "../essential-characters";
import { HighImpactCharacters } from "../high-impact-characters";
import { TopAssistants } from "../top-assistants";
import { PartyCompositionChart } from "./PartyCompositionChart";
import { CharacterGrowthStats } from "./CharacterGrowthStats";
import {
  createCharTableData,
  createPartyCountData,
} from "./utils/raidDataTransform";
import { generateSearchKeyword } from "@/utils/raid";
import { useSectionView } from "@/hooks/use-section-view";
import { useTranslations } from "@/lib/i18n";

type SectionId =
  | "platinum_stats"
  | "essential_chars"
  | "high_impact_chars"
  | "top_assistants"
  | "top_5_party"
  | "min_ue_clear"
  | "max_party_clear"
  | "party_composition"
  | "character_usage_table"
  | "character_growth_stats";

function SummarySection({
  section,
  children,
}: {
  section: SectionId;
  children: React.ReactNode;
}) {
  const ref = useSectionView("summary_section_view", section);
  return <div id={section} className="scroll-mt-12" ref={ref}>{children}</div>;
}

const SECTION_LABELS: Record<SectionId, string> = {
  platinum_stats: "party.summary.platinum",
  essential_chars: "party.summary.essential",
  high_impact_chars: "party.summary.highImpact",
  top_assistants: "party.summary.topAssist.title",
  top_5_party: "party.summary.top5",
  min_ue_clear: "party.summary.minUe",
  max_party_clear: "party.summary.maxParty",
  party_composition: "party.summary.partyRatio.title",
  character_usage_table: "party.summary.usage.title",
  character_growth_stats: "party.summary.growth.title",
};

function SummaryNav({ sections, t }: { sections: SectionId[]; t: (k: string) => string }) {
  const [active, setActive] = useState<SectionId>(sections[0]);
  const navRef = useRef<HTMLDivElement>(null);
  const btnRefs = useRef<Map<string, HTMLButtonElement>>(new Map());

  useEffect(() => {
    const els = sections.map(id => document.getElementById(id)).filter(Boolean) as HTMLElement[];
    if (els.length === 0) return;

    const ratios = new Map<string, number>();
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) ratios.set(entry.target.id, entry.intersectionRatio);
        let best = sections[0];
        let bestRatio = 0;
        for (const id of sections) {
          const r = ratios.get(id) ?? 0;
          if (r > bestRatio) { bestRatio = r; best = id; }
        }
        if (bestRatio > 0) setActive(best);
      },
      { threshold: [0, 0.1, 0.5, 1] },
    );
    els.forEach(el => observer.observe(el));
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
    <nav className="sticky top-0 z-20 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 border-b -mx-4 px-4 mb-4">
      <div ref={navRef} className="flex gap-1.5 overflow-x-auto py-2" style={{ scrollbarWidth: "none", WebkitOverflowScrolling: "touch" }}>
        {sections.map((id) => (
          <button
            key={id}
            ref={el => { if (el) btnRefs.current.set(id, el); }}
            onClick={() => document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" })}
            className={`shrink-0 px-3 py-1 rounded-full text-xs font-medium transition-colors ${
              id === active ? "bg-sky-500 text-white" : "bg-muted text-muted-foreground hover:bg-muted/80"
            }`}
          >
            {t(SECTION_LABELS[id])}
          </button>
        ))}
      </div>
    </nav>
  );
}

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

  const searchKeyword = generateSearchKeyword(
    seasonNameKo ?? seasonDescription ?? "",
    level === "L" ? "L" : level === "T" ? "T" : ""
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
        `${process.env.NEXT_PUBLIC_CDN_URL}/batorment/v3/summary/${season}.json`
      );
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    },
    throwOnError: true,
  });

  const getFilterDataQuery = useQuery({
    queryKey: ["getFilterData", season, level],
    queryFn: async () => {
      const filterPath = level === "L" ? "lunatic-filter" : "nonlunatic-filter";
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_CDN_URL}/batorment/v3/${filterPath}/${season}.json`
      );
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    },
    throwOnError: true,
  });

  const handleGoToVideos = () => {
    router.push(`/video-analysis?raid=${season}`);
  };

  if (getSummaryDataQuery.isLoading || getFilterDataQuery.isLoading) {
    return <Loading />;
  }

  if (!getSummaryDataQuery.data || !getFilterDataQuery.data) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  const tormentSummaryData = getSummaryDataQuery.data.torment as RaidSummaryData;
  const lunaticSummaryData = getSummaryDataQuery.data.lunatic as RaidSummaryData;
  const summaryData = level === "L" ? lunaticSummaryData : tormentSummaryData;
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
        <Image src="/empty.webp" alt="Empty" width={192} height={192} className="mb-4" />
        <p className="text-muted-foreground text-lg">{t("party.summary.empty")}</p>
      </div>
    );
  }

  const strikerData = createCharTableData(data.filters || {}, data.clearCount || 0, studentsMap, "1");
  const specialData = createCharTableData(data.filters || {}, data.clearCount || 0, studentsMap, "2");
  const assistData = createCharTableData(data.assistFilters || {}, data.clearCount || 0, studentsMap).filter(
    (item) => item.percent >= 1
  );
  const partyCountData = createPartyCountData(data.partyCounts, data.clearCount || 0);

  const tormentClearPercent = Number(Math.min(tormentSummaryData.clearCount, 20000) / 20000) * 100;
  const lunaticClearPercent = Number(Math.min(lunaticSummaryData.clearCount, 20000) / 20000) * 100;

  const visibleSections: SectionId[] = [];
  if (level !== "I") visibleSections.push("platinum_stats");
  if (data.essentialCharacters?.length) visibleSections.push("essential_chars");
  if (data.highImpactCharacters?.length) visibleSections.push("high_impact_chars");
  if (assistData.length > 0) visibleSections.push("top_assistants");
  visibleSections.push("top_5_party");
  if (data.minUEUser) visibleSections.push("min_ue_clear");
  if (data.maxPartyUser) visibleSections.push("max_party_clear");
  visibleSections.push("party_composition", "character_usage_table", "character_growth_stats");

  return (
    <div className="container mx-auto py-4 sm:py-8 max-w-7xl">
      <SummaryNav sections={visibleSections} t={t} />
      <div className="mb-6 sm:mb-8">
        {searchKeyword && (
          <div className="mb-4 rounded-lg border border-gray-200 dark:border-gray-700 p-3">
            <div className="flex items-center gap-2 mb-2">
              <Search className="h-4 w-4 text-sky-500" />
              <span className="text-sm font-medium">{t("party.summary.search")}</span>
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
                <span>{copied ? t("party.summary.copied") : t("party.summary.copy")}</span>
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
          onClick={handleGoToVideos}
          className="group w-full mb-6 rounded-lg border-2 border-sky-500 bg-sky-500/5 hover:bg-sky-500/10 transition-colors p-4 text-left flex items-center gap-3"
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

        {level !== "I" && (
          <SummarySection section="platinum_stats">
            <PlatinumStats
              clearCount={data.clearCount || 0}
              clearPercent={level === "T" ? tormentClearPercent : lunaticClearPercent}
              platinumCuts={data.platinumCuts || []}
              partPlatinumCuts={data.partPlatinumCuts}
              lunaticClearPercent={
                level === "T" && lunaticSummaryData.clearCount > 0 ? lunaticClearPercent : undefined
              }
            />
          </SummarySection>
        )}
      </div>

      <div className="space-y-6">
        {data.essentialCharacters && data.essentialCharacters.length > 0 && (
          <SummarySection section="essential_chars">
            <EssentialCharacters data={data.essentialCharacters} studentsMap={studentsMap} />
          </SummarySection>
        )}

        {data.highImpactCharacters && data.highImpactCharacters.length > 0 && (
          <SummarySection section="high_impact_chars">
            <HighImpactCharacters data={data.highImpactCharacters} studentsMap={studentsMap} />
          </SummarySection>
        )}

        {assistData.length > 0 && (
          <SummarySection section="top_assistants">
            <TopAssistants data={assistData.slice(0, 3)} />
          </SummarySection>
        )}

        <SummarySection section="top_5_party">
          <CardWrapper
            icon={<Users className="h-5 w-5 text-sky-500" />}
            title={t("party.summary.top5")}
            description={t("party.summary.charNoteWeapon")}
          >
            <div className="space-y-3">
              {(data.top5Partys || []).map(([party_string, count], idx) => {
                const students = party_string.split("_").map(Number);
                const parties = [];
                for (let i = 0; i < students.length; i += 6) {
                  parties.push(students.slice(i, i + 6));
                }
                return (
                  <PartyCard
                    key={idx}
                    rank={idx + 1}
                    value={count}
                    valueSuffix={t("party.summary.users")}
                    parties={parties}
                  />
                );
              })}
            </div>
          </CardWrapper>
        </SummarySection>

        {data.minUEUser && (
          <SummarySection section="min_ue_clear">
            <CardWrapper
              icon={<Target className="h-5 w-5 text-sky-500" />}
              title={t("party.summary.minUe.title")}
              description={t("party.summary.minUe.desc").replace("{n}", String(data.minUEUser.ueCount))}
            >
              <PartyCard
                rank={data.minUEUser.rank}
                value={data.minUEUser.score}
                valueSuffix={t("party.summary.points")}
                parties={data.minUEUser.partyData}
              />
            </CardWrapper>
          </SummarySection>
        )}

        {data.maxPartyUser && (
          <SummarySection section="max_party_clear">
            <CardWrapper
              icon={<Users className="h-5 w-5 text-sky-500" />}
              title={t("party.summary.maxParty.title")}
              description={t("party.summary.maxParty.desc").replace("{n}", String(data.maxPartyUser.partyData.length))}
            >
              <PartyCard
                rank={data.maxPartyUser.rank}
                value={data.maxPartyUser.score}
                valueSuffix={t("party.summary.points")}
                parties={data.maxPartyUser.partyData}
              />
            </CardWrapper>
          </SummarySection>
        )}

        <SummarySection section="party_composition">
          <PartyCompositionChart data={partyCountData} />
        </SummarySection>

        <SummarySection section="character_usage_table">
          <CardWrapper
            icon={<TrendingUp className="h-5 w-5 text-sky-500" />}
            title={t("party.summary.usage.title")}
          >
            <div className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <CharacterUsageTable title="STRIKER" data={strikerData} />
                <CharacterUsageTable title="SPECIAL" data={specialData} />
                <CharacterUsageTable title={t("party.summary.assistTab")} data={assistData} />
              </div>
            </div>
          </CardWrapper>
        </SummarySection>

        <SummarySection section="character_growth_stats">
          <CharacterGrowthStats
            filters={data.filters || {}}
            studentsMap={studentsMap}
            studentSearchMap={studentSearchMap || {}}
          />
        </SummarySection>
      </div>
    </div>
  );
};

export default RaidSummary;
