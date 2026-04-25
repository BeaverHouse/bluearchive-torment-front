"use client";

import Image from "next/image";
import { useEffect, useState, useMemo, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import useBAStore from "@/store/useBAStore";
import useStudentPoolStore from "@/store/useStudentPoolStore";
import useSearchModeStore from "@/store/useSearchModeStore";
import {
  filteredPartys,
  getFilters,
  type SearchModeContext,
} from "@/lib/party-filters";
import { createCDNQueryOptions } from "@/lib/queries";
import PartyCard from "./party-card";
import {
  RaidData,
  FilterData,
  FilterOption,
  RaidComponentProps,
} from "@/types/raid";
import { Pagination } from "../../shared/pagination";
import Loading from "../../common/loading";
import { PartyFilterSection } from "./party-filter-section";
import { PartyFilterState } from "@/types/filter";
import SearchModeSelector from "./search-mode-selector";
import PoolFilterToggle from "@/components/features/pool/pool-filter-toggle";
import ComboSelector from "@/components/features/combo/combo-selector";

const RaidSearch = ({ season, studentsMap, studentSearchMap }: RaidComponentProps) => {
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

  const poolStudents = useStudentPoolStore((state) => state.pool.students);
  const poolPolicy = useStudentPoolStore((state) => state.filter.policy);

  const searchMode = useSearchModeStore((s) => s.mode);
  const comboCodes = useSearchModeStore((s) => s.comboCodes);

  const comboCodesSet = useMemo(
    () => new Set(comboCodes),
    [comboCodes]
  );

  const searchModeContext: SearchModeContext = useMemo(() => {
    if (searchMode === "pool") {
      return {
        kind: "pool",
        pool: {
          pool: { students: poolStudents },
          policy: poolPolicy,
        },
      };
    }
    if (searchMode === "single") {
      return { kind: "single", codes: comboCodesSet };
    }
    return {
      kind: "filter",
      includeArray: IncludeList,
      excludeArray: ExcludeList,
      hardExclude: HardExclude,
    };
  }, [
    searchMode,
    poolStudents,
    poolPolicy,
    comboCodesSet,
    IncludeList,
    ExcludeList,
    HardExclude,
  ]);

  useEffect(() => {
    setPage(1);
  }, [
    ScoreRange,
    Assist,
    PartyCountRange,
    PageSize,
    AllowDuplicate,
    YoutubeOnly,
    season,
    searchModeContext,
  ]);

  const getPartyDataQuery = useQuery(createCDNQueryOptions<RaidData>("party", season));
  const getFilterDataQuery = useQuery(createCDNQueryOptions<FilterData>("filter", season));

  const getSummaryDataQuery = useQuery({
    queryKey: ["getSummaryData", season],
    queryFn: async () => {
      const url = `${process.env.NEXT_PUBLIC_CDN_URL}/batorment/v3/summary/${season}.json`;
      const response = await fetch(url);
      if (!response.ok) return null;
      return response.json() as Promise<{
        torment?: { clearCount?: number };
        lunatic?: { clearCount?: number };
      }>;
    },
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 10,
  });

  const getLunaticFilterDataQuery = useQuery({
    queryKey: ["getLunaticFilterData", season],
    queryFn: async () => {
      const url = `${process.env.NEXT_PUBLIC_CDN_URL}/batorment/v3/lunatic-filter/${season}.json`;
      const response = await fetch(url);
      if (!response.ok) return null;
      return response.json() as Promise<FilterData>;
    },
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 10,
  });

  // 현재 시즌의 전체(파티 데이터 기준) 사용률 ≥ 10% 학생 ID 집합
  const highUsageStudentIds = useMemo<ReadonlySet<number>>(() => {
    const parties = getPartyDataQuery.data?.parties ?? [];
    if (parties.length === 0) return new Set<number>();
    const counts: Record<number, number> = {};
    for (const party of parties) {
      const codeSet = new Set<number>();
      for (const num of party.partyData.flat()) {
        if (num % 10 === 1) continue;
        codeSet.add(Math.floor(num / 1000));
      }
      for (const code of codeSet) {
        counts[code] = (counts[code] || 0) + 1;
      }
    }
    const threshold = parties.length * 0.1;
    const result = new Set<number>();
    for (const [code, count] of Object.entries(counts)) {
      if (count >= threshold) result.add(Number(code));
    }
    return result;
  }, [getPartyDataQuery.data?.parties]);

  // 루나틱 사용률 ≥ 10%
  const highUsageLunaticStudentIds = useMemo<ReadonlySet<number>>(() => {
    const filters = getLunaticFilterDataQuery.data?.filters;
    const clearCount = getSummaryDataQuery.data?.lunatic?.clearCount ?? 0;
    if (!filters || clearCount === 0) return new Set<number>();
    const result = new Set<number>();
    for (const [code, gradeCounts] of Object.entries(filters)) {
      const total = Object.values(gradeCounts as Record<string, number>).reduce(
        (a, b) => a + b,
        0
      );
      if (total / clearCount >= 0.1) result.add(Number(code));
    }
    return result;
  }, [
    getLunaticFilterDataQuery.data?.filters,
    getSummaryDataQuery.data?.lunatic,
  ]);

  // data가 변경될 때마다 필터 값을 업데이트
  useEffect(() => {
    const data = getPartyDataQuery.data as RaidData;
    const filterData = getFilterDataQuery.data as FilterData;
    if (!data || !filterData) return;

    if (PartyCountRange[0] === 0 && PartyCountRange[1] === 99) {
      setPartyCountRange([data.minPartys, data.maxPartys]);
    }

    const validIncludeList = IncludeList.filter((item) =>
      Object.keys(filterData?.filters || {}).some((key) => {
        if (Number(key) !== item[0]) {
          return false;
        }
        if (item.length > 1) {
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
          ? true
          : (() => {
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

  const data: RaidData = useMemo(() => ({
    parties: partyData?.parties || [],
    minPartys: partyData?.minPartys || 1,
    maxPartys: partyData?.maxPartys || 10,
  }), [partyData]);

  const combinedFilterData: FilterData = useMemo(() => ({
    filters: filterData?.filters || {},
    assistFilters: filterData?.assistFilters || {},
  }), [filterData]);

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

  const handleFilterChange = useCallback((updates: Partial<PartyFilterState>) => {
    if ('scoreRange' in updates) setScoreRange(updates.scoreRange);
    if ('includeList' in updates && updates.includeList !== undefined) setIncludeList(updates.includeList);
    if ('excludeList' in updates && updates.excludeList !== undefined) setExcludeList(updates.excludeList);
    if ('assist' in updates) setAssist(updates.assist);
    if ('hardExclude' in updates && updates.hardExclude !== undefined) setHardExclude(updates.hardExclude);
    if ('allowDuplicate' in updates && updates.allowDuplicate !== undefined) setAllowDuplicate(updates.allowDuplicate);
    if ('youtubeOnly' in updates && updates.youtubeOnly !== undefined) setYoutubeOnly(updates.youtubeOnly);
    if ('partyCountRange' in updates && updates.partyCountRange !== undefined) setPartyCountRange(updates.partyCountRange);
  }, [setScoreRange, setIncludeList, setExcludeList, setAssist, setHardExclude, setAllowDuplicate, setYoutubeOnly]);

  const handleLoadPreset = useCallback((preset: Partial<PartyFilterState>) => {
    handleFilterChange(preset);
  }, [handleFilterChange]);

  const results = useMemo(() => filteredPartys(
    data,
    ScoreRange,
    Assist,
    PartyCountRange,
    AllowDuplicate,
    YoutubeOnly,
    searchModeContext
  ), [data, ScoreRange, Assist, PartyCountRange, AllowDuplicate, YoutubeOnly, searchModeContext]);

  const handleScoreJump = useCallback((targetScore: number) => {
    if (results.length === 0) return;

    let closestIndex = 0;
    let closestDiff = Math.abs(results[0].party.score - targetScore);

    results.forEach(({ party }, index) => {
      const diff = Math.abs(party.score - targetScore);
      if (diff < closestDiff) {
        closestDiff = diff;
        closestIndex = index;
      }
    });

    const targetPage = Math.floor(closestIndex / PageSize) + 1;
    setPage(targetPage);
  }, [results, PageSize]);

  const currentFilters: PartyFilterState = useMemo(() => ({
    scoreRange: ScoreRange,
    includeList: IncludeList,
    excludeList: ExcludeList,
    assist: Assist,
    partyCountRange: PartyCountRange as [number, number],
    hardExclude: HardExclude,
    allowDuplicate: AllowDuplicate,
    youtubeOnly: YoutubeOnly,
  }), [ScoreRange, IncludeList, ExcludeList, Assist, PartyCountRange, HardExclude, AllowDuplicate, YoutubeOnly]);

  if (getPartyDataQuery.isLoading || getFilterDataQuery.isLoading || !studentSearchMap)
    return <Loading />;

  const renderModeUI = () => {
    if (searchMode === "pool") {
      return (
        <PoolFilterToggle
          highUsageStudentIds={highUsageStudentIds}
          highUsageLunaticStudentIds={highUsageLunaticStudentIds}
        />
      );
    }
    if (searchMode === "single") {
      return (
        <div className="mb-4 rounded-lg border border-gray-200 dark:border-gray-700 p-3">
          <ComboSelector />
        </div>
      );
    }
    return null;
  };

  return (
    <>
      <SearchModeSelector />
      {renderModeUI()}
      <PartyFilterSection
        filters={currentFilters}
        onFilterChange={handleFilterChange}
        onReset={removeFilters}
        filterOptions={filterOptions}
        excludeOptions={excludeOptions}
        assistOptions={assistOptions}
        minPartys={data.minPartys}
        maxPartys={data.maxPartys}
        studentSearchMap={studentSearchMap}
        defaultOpen
        showYoutubeOnly
        showPresetPopover={searchMode === "filter"}
        onScoreJump={handleScoreJump}
        onLoadPreset={handleLoadPreset}
        hideIncludeExclude={searchMode !== "filter"}
      />
      <div className="mx-auto mb-5 w-full">
        검색 결과: 총 {results.length}개
      </div>
      <div className="mb-5">
        <Pagination
          currentPage={Page}
          totalItems={results.length}
          pageSize={PageSize}
          onPageChange={setPage}
          onPageSizeChange={setPageSize}
          pageSizeOptions={[10, 20]}
        />
      </div>
      <div className="w-full mx-auto mt-5">
        {results.length > 0 ? (
          results
            .filter(
              (_, idx) => idx >= (Page - 1) * PageSize && idx < Page * PageSize
            )
            .map(({ party, matchedSubPartyIndexes }, idx) => (
              <PartyCard
                key={idx}
                rank={party.rank}
                value={party.score}
                valueSuffix="점"
                parties={party.partyData}
                video_id={party.video_id}
                raid_id={party.video_id ? (party.raid_id || season) : undefined}
                matchedSubPartyIndexes={matchedSubPartyIndexes}
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
