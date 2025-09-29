"use client";

import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import useBAStore from "../../store/useBAStore";
import { filteredPartys, getFilters } from "../function";
import PartyCard from "./PartyCard";
import { RaidData, PartyData, FilterData, FilterOption, YoutubeLinkInfo } from "@/types/raid";
import { Button } from "../ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Checkbox } from "../ui/checkbox";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "../ui/collapsible";
import { ChevronDownIcon } from "@radix-ui/react-icons";
import { Cascader } from "../custom/cascader";
import { MultiSelect } from "../custom/multi-select";
import { lunaticMinScore, tormentMinScore } from "../constants";

interface RaidComponentProps {
  season: string;
  studentsMap: Record<string, string>;
  level: string;
}


const RaidSearch = ({ season, studentsMap }: RaidComponentProps) => {
  const [PartyCountRange, setPartyCountRange] = useState([0, 99]);
  const [Page, setPage] = useState(1);
  const [PageSize, setPageSize] = useState(10);
  const [pageInputValue, setPageInputValue] = useState("1");
  const [isPageInputActive, setIsPageInputActive] = useState(false);

  const {
    LevelList,
    IncludeList,
    ExcludeList,
    Assist,
    HardExclude,
    AllowDuplicate,
    YoutubeOnly,
    setLevelList,
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
    setPageInputValue("1");
  }, [
    LevelList,
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

  // Page가 변경될 때 pageInputValue 동기화 (사용자 입력 중이 아닐 때만)
  useEffect(() => {
    if (!isPageInputActive) {
      setPageInputValue(Page.toString());
    }
  }, [Page, isPageInputActive]);

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
  });

  const getLinksQuery = useQuery({
    queryKey: ["getLinks", season],
    queryFn: async () => {
      try {
        const linksModule = await import(`../../../data/links/${season}.json`);
        return linksModule.default;
      } catch {
        return [];
      }
    },
    throwOnError: false,
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
          // item[1]은 이미 levelKey 값 (예: 52)
          const levelKey = item[1].toString();
          return filterData.filters[key][levelKey] > 0;
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
              // Assist[1]은 이미 levelKey 값 (예: 52)
              const levelKey = Assist[1].toString();
              return filterData.assistFilters[Assist[0]][levelKey] > 0;
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

  if (
    getPartyDataQuery.isLoading ||
    getFilterDataQuery.isLoading ||
    getLinksQuery.isLoading
  )
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p>로딩 중...</p>
        </div>
      </div>
    );

  const partyData = getPartyDataQuery.data;
  const filterData = getFilterDataQuery.data;
  const youtubeLinkInfos: YoutubeLinkInfo[] = getLinksQuery.data || [];

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

  const topScore = data.parties[0]?.score || 0;
  const levelCategoryCount =
    topScore > lunaticMinScore ? 3 : topScore > tormentMinScore ? 2 : 1;

  const levelOptions = [
    {
      value: "I",
      label: "Insane",
    },
    {
      value: "T",
      label: "Torment",
    },
    {
      value: "L",
      label: "Lunatic",
    },
  ].slice(0, levelCategoryCount);

  const confirmReset = () => {
    const confirm = window.confirm("모든 캐릭터 필터가 리셋됩니다.");
    if (confirm) removeFilters();
  };

  const FilterComponent = () => {
    return (
      <>
        <Button
          className="w-60 mb-5"
          onClick={confirmReset}
          variant="destructive"
        >
          필터 Reset
        </Button>
        <br />
        {/* 난이도 & 파티 수 Filter */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-center gap-6 mb-6">
          {/* 난이도 Filter */}
          <div className="flex flex-col items-center">
            <label className="text-sm font-medium mb-2">난이도</label>
            <div className="flex gap-2">
              {levelOptions.map((option) => (
                <Button
                  key={option.value}
                  variant={
                    LevelList.includes(option.value) ? "default" : "outline"
                  }
                  size="sm"
                  onClick={() => {
                    if (LevelList.includes(option.value)) {
                      setLevelList(
                        LevelList.filter((level) => level !== option.value)
                      );
                    } else {
                      setLevelList([...LevelList, option.value]);
                    }
                  }}
                  className="min-w-20"
                >
                  {option.label}
                </Button>
              ))}
            </div>
          </div>

          {/* 파티 수 Filter */}
          <div className="flex flex-col items-center">
            <label className="text-sm font-medium mb-2">파티 수</label>
            <div className="flex items-center gap-2">
              <Select
                value={PartyCountRange[0].toString()}
                onValueChange={(value) => {
                  const min = parseInt(value);
                  setPartyCountRange([min, Math.max(min, PartyCountRange[1])]);
                }}
              >
                <SelectTrigger className="w-20">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Array.from(
                    { length: data.maxPartys - data.minPartys + 1 },
                    (_, i) => {
                      const value = data.minPartys + i;
                      return (
                        <SelectItem key={value} value={value.toString()}>
                          {value}
                        </SelectItem>
                      );
                    }
                  )}
                </SelectContent>
              </Select>
              <span className="text-sm text-muted-foreground">~</span>
              <Select
                value={PartyCountRange[1].toString()}
                onValueChange={(value) => {
                  const max = parseInt(value);
                  setPartyCountRange([Math.min(PartyCountRange[0], max), max]);
                }}
              >
                <SelectTrigger className="w-20">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Array.from(
                    { length: data.maxPartys - data.minPartys + 1 },
                    (_, i) => {
                      const value = data.minPartys + i;
                      return (
                        <SelectItem key={value} value={value.toString()}>
                          {value}
                        </SelectItem>
                      );
                    }
                  )}
                </SelectContent>
              </Select>
              <span className="text-sm text-muted-foreground">파티</span>
            </div>
          </div>
        </div>
        {/* 포함 캐릭터 Filter */}
        <div className="mb-4">
          <label className="text-sm font-medium mb-2 block">
            포함할 <strong>내 캐릭터</strong>
          </label>
          <Cascader
            multiple
            options={
              getFilters(
                combinedFilterData.filters,
                studentsMap
              ) as FilterOption[]
            }
            value={IncludeList}
            onChange={setIncludeList}
            placeholder="캐릭터를 선택하세요"
            className="w-full"
            allowClear
            showSearch
          />
        </div>
        {/* 제외 캐릭터 Filter */}
        <div className="mb-4">
          <label className="text-sm font-medium mb-2 block">
            제외할 <strong>내 캐릭터</strong>
          </label>
          <MultiSelect
            options={Object.keys(combinedFilterData.filters).map((key) => ({
              value: parseInt(key),
              label: studentsMap[key],
            }))}
            value={ExcludeList}
            onChange={(value) => setExcludeList(value as number[])}
            placeholder="제외할 캐릭터를 선택하세요"
            className="w-full"
            allowClear
            showSearch
          />
        </div>
        <div className="flex items-center space-x-2 mb-4">
          <Checkbox
            id="hardExclude"
            checked={HardExclude}
            onCheckedChange={(checked) => setHardExclude(!!checked)}
          />
          <label htmlFor="hardExclude" className="text-sm">
            조력자에서도 제외
          </label>
        </div>
        {/* 조력자 Filter */}
        <div className="mb-4">
          <label className="text-sm font-medium mb-2 block">조력자</label>
          <Cascader
            options={
              getFilters(
                combinedFilterData.assistFilters,
                studentsMap
              ) as FilterOption[]
            }
            value={Assist ? [Assist] : []}
            onChange={(value) =>
              setAssist(value.length > 0 ? value[0] : undefined)
            }
            placeholder="조력자를 선택하세요"
            className="w-full"
            allowClear
            showSearch
          />
        </div>
        <div className="flex items-center space-x-2 mb-2">
          <Checkbox
            id="allowDuplicate"
            checked={AllowDuplicate}
            onCheckedChange={(checked) => setAllowDuplicate(!!checked)}
          />
          <label htmlFor="allowDuplicate" className="text-sm">
            조력자 포함 중복 허용
          </label>
        </div>
        <div className="flex items-center space-x-2">
          <Checkbox
            id="youtubeOnly"
            checked={YoutubeOnly}
            onCheckedChange={(checked) => setYoutubeOnly(!!checked)}
          />
          <label htmlFor="youtubeOnly" className="text-sm">
            Youtube 링크 (beta)
          </label>
        </div>
      </>
    );
  };

  const parties = filteredPartys(
    data,
    youtubeLinkInfos,
    LevelList,
    IncludeList,
    ExcludeList,
    Assist,
    PartyCountRange,
    HardExclude,
    AllowDuplicate,
    YoutubeOnly
  );

  return (
    <>
      <div className="mx-auto mb-5 w-full">
        <Collapsible defaultOpen>
          <CollapsibleTrigger className="flex w-full items-center justify-between rounded-lg border border-gray-200 p-4 hover:bg-gray-50 dark:hover:bg-gray-800 dark:border-gray-700 dark:hover:bg-gray-800">
            <span className="text-sm font-medium">파티 Filter</span>
            <ChevronDownIcon className="h-4 w-4 transition-transform" />
          </CollapsibleTrigger>
          <CollapsibleContent className="border-l border-r border-b border-gray-200 p-4 dark:border-gray-700">
            <FilterComponent />
          </CollapsibleContent>
        </Collapsible>
      </div>
      <div className="mx-auto mb-5 w-full">
        검색 결과: 총 {parties.length}개
      </div>
      <div className="flex items-center justify-center gap-4 mb-5">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setPage(Math.max(1, Page - 1))}
          disabled={Page === 1}
        >
          이전
        </Button>
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={pageInputValue}
            onChange={(e) => {
              const value = e.target.value;
              setPageInputValue(value);

              // 숫자가 아닌 문자 제거
              const numericValue = value.replace(/[^0-9]/g, "");

              if (numericValue === "") {
                // 빈 값이면 아무것도 하지 않음 (입력 중일 수 있음)
                return;
              }

              const newPage = parseInt(numericValue);
              const maxPage = Math.ceil(parties.length / PageSize);

              if (newPage >= 1 && newPage <= maxPage) {
                setPage(newPage);
              }
            }}
            onFocus={() => {
              setIsPageInputActive(true);
              setPageInputValue("");
            }}
            onBlur={() => {
              setIsPageInputActive(false);

              // 빈 값이면 첫 페이지로 fallback
              if (pageInputValue === "" || pageInputValue === "0") {
                setPage(1);
                setPageInputValue("1");
              } else {
                // 유효하지 않은 값이면 현재 페이지로 복원
                const numericValue = pageInputValue.replace(/[^0-9]/g, "");
                const newPage = parseInt(numericValue);
                const maxPage = Math.ceil(parties.length / PageSize);

                if (isNaN(newPage) || newPage < 1 || newPage > maxPage) {
                  setPageInputValue(Page.toString());
                } else {
                  setPage(newPage);
                  setPageInputValue(newPage.toString());
                }
              }
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                (e.target as HTMLInputElement).blur();
              }
            }}
            placeholder="페이지"
            className="w-16 px-2 py-1 text-sm border rounded text-center"
          />
          <span className="text-sm">
            / {Math.ceil(parties.length / PageSize)}
          </span>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() =>
            setPage(Math.min(Math.ceil(parties.length / PageSize), Page + 1))
          }
          disabled={Page >= Math.ceil(parties.length / PageSize)}
        >
          다음
        </Button>
        <Select
          value={PageSize.toString()}
          onValueChange={(value) => setPageSize(parseInt(value))}
        >
          <SelectTrigger className="w-23">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="10">10개씩</SelectItem>
            <SelectItem value="20">20개씩</SelectItem>
          </SelectContent>
        </Select>
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
                data={party as PartyData}
                studentsMap={studentsMap}
                linkInfos={youtubeLinkInfos.filter(
                  (link) => link.score == party.score
                )}
              />
            ))
        ) : (
          <div className="flex flex-col items-center justify-center py-12">
            <img src="/empty.webp" alt="Empty" className="h-48 mb-4" />
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
