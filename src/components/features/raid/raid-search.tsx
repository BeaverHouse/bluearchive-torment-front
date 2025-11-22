"use client";

import Image from "next/image";
import { useEffect, useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import useBAStore from "@/store/useBAStore";
import { filteredPartys, getFilters } from "@/lib/party-filters";
import PartyCard from "./party-card";
import {
  RaidData,
  FilterData,
  FilterOption,
  RaidComponentProps,
} from "@/types/raid";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "../../ui/collapsible";
import { ChevronDownIcon } from "@radix-ui/react-icons";
import { Pagination } from "../../shared/pagination";
import Loading from "../../common/loading";
import { PartyFilter } from "./party-filter";
import { PartyFilterState } from "@/types/filter";

const RaidSearch = ({ season, studentsMap }: RaidComponentProps) => {
  const [PartyCountRange, setPartyCountRange] = useState([0, 99]);
  const [Page, setPage] = useState(1);
  const [PageSize, setPageSize] = useState(10);

  const {
    ScoreRange,
    IncludeList,
    ExcludeList,
    Assist,
    HardExclude,
    AllowDuplicate,
    YoutubeOnly,
    setScoreRange,
    setIncludeList,
    setExcludeList,
    setAssist,
    setHardExclude,
    setAllowDuplicate,
    setYoutubeOnly,
    removeFilters,
  } = useBAStore();

  useEffect(() => {
    setPage(1);
  }, [
    ScoreRange,
    IncludeList,
    ExcludeList,
    Assist,
    PartyCountRange,
    PageSize,
    HardExclude,
    AllowDuplicate,
    YoutubeOnly,
    season,
  ]);

  const getPartyDataQuery = useQuery({
    queryKey: ["getPartyData", season],
    queryFn: async () => {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_CDN_URL}/batorment/v3/party/${season}.json`
        );
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return await response.json();
      } catch (error) {
        console.error("Failed to load party data:", error);
        throw error;
      }
    },
    throwOnError: true,
    staleTime: 1000 * 60 * 5, // 5분 동안 데이터를 fresh 상태로 유지
    gcTime: 1000 * 60 * 10, // 10분 동안 캐시 유지 (구 cacheTime)
  });

  const getFilterDataQuery = useQuery({
    queryKey: ["getFilterData", season],
    queryFn: async () => {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_CDN_URL}/batorment/v3/filter/${season}.json`
        );
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return await response.json();
      } catch (error) {
        console.error("Failed to load filter data:", error);
        throw error;
      }
    },
    throwOnError: true,
    staleTime: 1000 * 60 * 5, // 5분 동안 데이터를 fresh 상태로 유지
    gcTime: 1000 * 60 * 10, // 10분 동안 캐시 유지 (구 cacheTime)
  });


  // data가 변경될 때마다 필터 값을 업데이트
  useEffect(() => {
    const data = getPartyDataQuery.data as RaidData;
    const filterData = getFilterDataQuery.data as FilterData;
    if (!data || !filterData) return;

    // 파티 수 필터 기본값 설정
    if (PartyCountRange[0] === 0 && PartyCountRange[1] === 99) {
      setPartyCountRange([data.minPartys, data.maxPartys]);
    }

    const validIncludeList = IncludeList.filter((item) =>
      Object.keys(filterData?.filters || {}).some((key) => {
        if (Number(key) !== item[0]) {
          return false;
        }
        if (item.length > 1) {
          // item[1]은 이미 gradeKey 값 (예: 52)
          const gradeKey = item[1].toString();
          return filterData.filters[key][gradeKey] > 0;
        }
        return true;
      })
    );

    const validExcludeList = ExcludeList.filter((item) =>
      Object.keys(filterData?.filters || {}).includes(item.toString())
    );

    const isAssistValid =
      !Assist ||
      (filterData.assistFilters[Assist[0]] &&
        (Assist.length === 1
          ? // 부모 항목 선택: 해당 캐릭터가 조력자 필터에 존재하는지만 확인
            true
          : // 자식 항목 선택: 특정 성급이 존재하는지 확인
            (() => {
              // Assist[1]은 이미 gradeKey 값 (예: 52)
              const gradeKey = Assist[1].toString();
              return filterData.assistFilters[Assist[0]][gradeKey] > 0;
            })()));

    if (validIncludeList.length !== IncludeList.length) {
      setIncludeList(validIncludeList);
    }
    if (validExcludeList.length !== ExcludeList.length) {
      setExcludeList(validExcludeList);
    }
    if (!isAssistValid) {
      setAssist(undefined);
    }
  }, [
    getPartyDataQuery.data,
    getFilterDataQuery.data,
    IncludeList,
    ExcludeList,
    Assist,
    PartyCountRange,
    setIncludeList,
    setExcludeList,
    setAssist,
  ]);

  const partyData = getPartyDataQuery.data;
  const filterData = getFilterDataQuery.data;

  // 파티 데이터와 필터 데이터 분리
  const data: RaidData = {
    parties: partyData?.parties || [],
    minPartys: partyData?.minPartys || 1,
    maxPartys: partyData?.maxPartys || 10,
  };

  const combinedFilterData: FilterData = {
    filters: filterData?.filters || {},
    assistFilters: filterData?.assistFilters || {},
  };

  const filterOptions = useMemo(
    () => getFilters(combinedFilterData.filters, studentsMap) as FilterOption[],
    [combinedFilterData.filters, studentsMap]
  );

  const excludeOptions = useMemo(
    () =>
      Object.keys(combinedFilterData.filters).map((key) => ({
        value: parseInt(key),
        label: studentsMap[key],
      })),
    [combinedFilterData.filters, studentsMap]
  );

  const assistOptions = useMemo(
    () => getFilters(combinedFilterData.assistFilters, studentsMap) as FilterOption[],
    [combinedFilterData.assistFilters, studentsMap]
  );

  const handleFilterChange = (updates: Partial<PartyFilterState>) => {
    // Zustand store 업데이트
    if ('scoreRange' in updates) setScoreRange(updates.scoreRange);
    if ('includeList' in updates && updates.includeList !== undefined) setIncludeList(updates.includeList);
    if ('excludeList' in updates && updates.excludeList !== undefined) setExcludeList(updates.excludeList);
    if ('assist' in updates) setAssist(updates.assist);
    if ('hardExclude' in updates && updates.hardExclude !== undefined) setHardExclude(updates.hardExclude);
    if ('allowDuplicate' in updates && updates.allowDuplicate !== undefined) setAllowDuplicate(updates.allowDuplicate);
    if ('youtubeOnly' in updates && updates.youtubeOnly !== undefined) setYoutubeOnly(updates.youtubeOnly);

    // Local state 업데이트
    if ('partyCountRange' in updates && updates.partyCountRange !== undefined) setPartyCountRange(updates.partyCountRange);
  };

  const confirmReset = () => {
    const confirm = window.confirm("모든 캐릭터 필터가 리셋됩니다.");
    if (confirm) removeFilters();
  };

  const parties = filteredPartys(
    data,
    ScoreRange,
    IncludeList,
    ExcludeList,
    Assist,
    PartyCountRange,
    HardExclude,
    AllowDuplicate,
    YoutubeOnly
  );

  if (getPartyDataQuery.isLoading || getFilterDataQuery.isLoading)
    return <Loading />;

  return (
    <>
      <div className="mx-auto mb-5 w-full">
        <Collapsible defaultOpen>
          <CollapsibleTrigger className="flex w-full items-center justify-between rounded-lg border border-gray-200 p-4 hover:bg-gray-50 dark:hover:bg-gray-800 dark:border-gray-700 dark:hover:bg-gray-800">
            <span className="text-sm font-medium">파티 Filter</span>
            <ChevronDownIcon className="h-4 w-4 transition-transform" />
          </CollapsibleTrigger>
          <CollapsibleContent className="border-l border-r border-b border-gray-200 p-4 dark:border-gray-700">
            <PartyFilter
              filters={{
                scoreRange: ScoreRange,
                includeList: IncludeList,
                excludeList: ExcludeList,
                assist: Assist,
                partyCountRange: PartyCountRange as [number, number],
                hardExclude: HardExclude,
                allowDuplicate: AllowDuplicate,
                youtubeOnly: YoutubeOnly,
              }}
              onFilterChange={handleFilterChange}
              filterOptions={filterOptions}
              excludeOptions={excludeOptions}
              assistOptions={assistOptions}
              minPartys={data.minPartys}
              maxPartys={data.maxPartys}
              showYoutubeOnly={true}
              onReset={confirmReset}
            />
          </CollapsibleContent>
        </Collapsible>
      </div>
      <div className="mx-auto mb-5 w-full">
        검색 결과: 총 {parties.length}개
      </div>
      <div className="mb-5">
        <Pagination
          currentPage={Page}
          totalItems={parties.length}
          pageSize={PageSize}
          onPageChange={setPage}
          onPageSizeChange={setPageSize}
          pageSizeOptions={[10, 20]}
        />
      </div>
      <div className="w-full mx-auto mt-5">
        {parties.length > 0 ? (
          parties
            .filter(
              (_, idx) => idx >= (Page - 1) * PageSize && idx < Page * PageSize
            )
            .map((party, idx) => (
              <PartyCard
                key={idx}
                rank={party.rank}
                value={party.score}
                valueSuffix="점"
                parties={party.partyData}
                video_id={party.video_id}
                raid_id={party.video_id ? (party.raid_id || season) : undefined}
              />
            ))
        ) : (
          <div className="flex flex-col items-center justify-center py-12">
            <Image src="/empty.webp" alt="Empty" width={192} height={192} className="mb-4" />
            <p className="text-gray-500 dark:text-gray-400">
              검색 결과가 없어요.
            </p>
          </div>
        )}
      </div>
    </>
  );
};

export default RaidSearch;
