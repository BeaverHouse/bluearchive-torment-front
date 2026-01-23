"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Users, Target, TrendingUp } from "lucide-react";
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
import { HighUsageCharacters } from "./HighUsageCharacters";
import {
  createCharTableData,
  createPartyCountData,
  getHighUsageCharacters,
} from "./utils/raidDataTransform";

const RaidSummary = ({
  season,
  studentsMap,
  studentSearchMap,
  level,
}: RaidComponentProps) => {
  const router = useRouter();
  const [, setCharacter] = useState<number | null>(null);

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

  useEffect(() => {
    setCharacter(null);
  }, [season]);

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
        <p className="text-muted-foreground text-lg">클리어 데이터가 없어요.</p>
      </div>
    );
  }

  const strikerData = createCharTableData(data.filters || {}, data.clearCount || 0, studentsMap, "1");
  const specialData = createCharTableData(data.filters || {}, data.clearCount || 0, studentsMap, "2");
  const assistData = createCharTableData(data.assistFilters || {}, data.clearCount || 0, studentsMap).filter(
    (item) => item.percent >= 1
  );
  const partyCountData = createPartyCountData(data.partyCounts, data.clearCount || 0);
  const highUsageCharacters = getHighUsageCharacters(data.filters, data.clearCount || 0, studentsMap);

  const tormentClearPercent = Number(Math.min(tormentSummaryData.clearCount, 20000) / 20000) * 100;
  const lunaticClearPercent = Number(Math.min(lunaticSummaryData.clearCount, 20000) / 20000) * 100;

  return (
    <div className="container mx-auto py-4 sm:py-8 max-w-7xl">
      <div className="mb-6 sm:mb-8">
        <Button
          onClick={handleGoToVideos}
          className="w-full bg-sky-500 hover:bg-sky-600 h-12 text-base mb-6"
        >
          <VideoIcon className="h-5 w-5 mr-2" />
          영상 분석 페이지로 이동
        </Button>

        {level !== "I" && (
          <PlatinumStats
            clearCount={data.clearCount || 0}
            clearPercent={level === "T" ? tormentClearPercent : lunaticClearPercent}
            platinumCuts={data.platinumCuts || []}
            partPlatinumCuts={data.partPlatinumCuts}
            lunaticClearPercent={
              level === "T" && lunaticSummaryData.clearCount > 0 ? lunaticClearPercent : undefined
            }
          />
        )}
      </div>

      <div className="space-y-6">
        {data.essentialCharacters && data.essentialCharacters.length > 0 && (
          <EssentialCharacters data={data.essentialCharacters} studentsMap={studentsMap} />
        )}

        {data.highImpactCharacters && data.highImpactCharacters.length > 0 && (
          <HighImpactCharacters data={data.highImpactCharacters} studentsMap={studentsMap} />
        )}

        {assistData.length > 0 && <TopAssistants data={assistData.slice(0, 3)} />}

        <HighUsageCharacters characters={highUsageCharacters} />

        <CardWrapper
          icon={<Users className="h-5 w-5 text-sky-500" />}
          title="Top 5 Party"
          description="전용무기와 배치는 표시되지 않아요."
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
                  valueSuffix="명 사용"
                  parties={parties}
                />
              );
            })}
          </div>
        </CardWrapper>

        {data.minUEUser && (
          <CardWrapper
            icon={<Target className="h-5 w-5 text-sky-500" />}
            title="최소 전용무기 클리어"
            description={`전용무기 ${data.minUEUser.ueCount}개로 클리어했어요.`}
          >
            <PartyCard
              rank={data.minUEUser.rank}
              value={data.minUEUser.score}
              valueSuffix="점"
              parties={data.minUEUser.partyData}
            />
          </CardWrapper>
        )}

        {data.maxPartyUser && (
          <CardWrapper
            icon={<Users className="h-5 w-5 text-sky-500" />}
            title="최다 파티 클리어"
            description={`${data.maxPartyUser.partyData.length}파티로 클리어했어요.`}
          >
            <PartyCard
              rank={data.maxPartyUser.rank}
              value={data.maxPartyUser.score}
              valueSuffix="점"
              parties={data.maxPartyUser.partyData}
            />
          </CardWrapper>
        )}

        <PartyCompositionChart data={partyCountData} />

        <CardWrapper
          icon={<TrendingUp className="h-5 w-5 text-sky-500" />}
          title="캐릭터 사용률"
        >
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <CharacterUsageTable title="STRIKER" data={strikerData} />
              <CharacterUsageTable title="SPECIAL" data={specialData} />
              <CharacterUsageTable title="조력자" data={assistData} />
            </div>
          </div>
        </CardWrapper>

        <CharacterGrowthStats
          filters={data.filters || {}}
          studentsMap={studentsMap}
          studentSearchMap={studentSearchMap || {}}
        />
      </div>
    </div>
  );
};

export default RaidSummary;
