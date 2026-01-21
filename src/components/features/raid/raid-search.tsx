"use client";

import Image from "next/image";
import { useEffect, useState, useMemo, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import useBAStore from "@/store/useBAStore";
import { filteredPartys, getFilters } from "@/lib/party-filters";
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

  const getPartyDataQuery = useQuery(createCDNQueryOptions<RaidData>("party", season));
  const getFilterDataQuery = useQuery(createCDNQueryOptions<FilterData>("filter", season));


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

  // 파티 데이터와 필터 데이터 분리 (메모이제이션)
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
  }, [setScoreRange, setIncludeList, setExcludeList, setAssist, setHardExclude, setAllowDuplicate, setYoutubeOnly]);

  // 프리셋 불러오기 핸들러
  const handleLoadPreset = useCallback((preset: Partial<PartyFilterState>) => {
    handleFilterChange(preset);
  }, [handleFilterChange]);

  // 점수로 이동 핸들러
  const handleScoreJump = useCallback((targetScore: number) => {
    // 현재 필터로 파티 목록 가져오기
    const currentParties = filteredPartys(
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

    if (currentParties.length === 0) return;

    // 가장 가까운 점수를 가진 파티 찾기
    let closestIndex = 0;
    let closestDiff = Math.abs(currentParties[0].score - targetScore);

    currentParties.forEach((party, index) => {
      const diff = Math.abs(party.score - targetScore);
      if (diff < closestDiff) {
        closestDiff = diff;
        closestIndex = index;
      }
    });

    // 해당 파티가 있는 페이지로 이동
    const targetPage = Math.floor(closestIndex / PageSize) + 1;
    setPage(targetPage);
  }, [data, ScoreRange, IncludeList, ExcludeList, Assist, PartyCountRange, HardExclude, AllowDuplicate, YoutubeOnly, PageSize]);

  // 필터링된 파티 목록 (메모이제이션)
  const parties = useMemo(() => filteredPartys(
    data,
    ScoreRange,
    IncludeList,
    ExcludeList,
    Assist,
    PartyCountRange,
    HardExclude,
    AllowDuplicate,
    YoutubeOnly
  ), [data, ScoreRange, IncludeList, ExcludeList, Assist, PartyCountRange, HardExclude, AllowDuplicate, YoutubeOnly]);

  // 현재 필터 상태 (메모이제이션) - 모든 훅은 조건부 리턴 전에 호출
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

  return (
    <>
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
        showPresetPopover
        onScoreJump={handleScoreJump}
        onLoadPreset={handleLoadPreset}
      />
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
