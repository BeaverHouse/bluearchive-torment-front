import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { usePathname } from "next/navigation";
import { getVideoList } from "@/lib/api";
import { VideoListItem } from "@/types/video";
import { filteredPartys, getFilters } from "@/lib/party-filters";
import { usePartyFilter } from "@/hooks/use-party-filter";
import { useTranslations } from "@/lib/i18n";
import { mergeAliasFilters } from "@/constants/student-aliases";

interface PaginationState {
  page: number;
  limit: number;
  total: number;
  total_pages: number;
  has_next: boolean;
  has_prev: boolean;
}

interface FilterData {
  filters: Record<string, Record<string, number>>;
  assistFilters: Record<string, Record<string, number>>;
}

interface UseVideoAnalysisProps {
  studentsMap: Record<string, string>;
  initialRaid: string;
}

const DEFAULT_PAGINATION: PaginationState = {
  page: 1,
  limit: 15,
  total: 0,
  total_pages: 0,
  has_next: false,
  has_prev: false,
};

export function useVideoAnalysis({ studentsMap, initialRaid }: UseVideoAnalysisProps) {
  const pathname = usePathname();
  const { t } = useTranslations();

  const [videos, setVideos] = useState<VideoListItem[]>([]);
  const [allVideos, setAllVideos] = useState<VideoListItem[]>([]);
  const [filteredVideos, setFilteredVideos] = useState<VideoListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedRaid, setSelectedRaid] = useState<string>(initialRaid);
  const isFilterMode = selectedRaid !== "all";
  const [pagination, setPagination] = useState<PaginationState>(DEFAULT_PAGINATION);
  const [pageSize, setPageSize] = useState(15);
  const [currentPage, setCurrentPage] = useState(1);
  const [filterData, setFilterData] = useState<FilterData | null>(null);

  const requestIdRef = useRef(0);

  const { filters, updateFilters, resetFilters } = usePartyFilter({
    scoreRange: undefined,
    includeList: [],
    excludeList: [],
    assist: undefined,
    partyCountRange: [0, 99],
    hardExclude: false,
    allowDuplicate: true,
    youtubeOnly: false,
  });

  // 필터 데이터 로드
  useEffect(() => {
    if (!isFilterMode || !selectedRaid || selectedRaid === "all") {
      setFilterData(null);
      return;
    }

    const loadFilterData = async () => {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_CDN_URL}/batorment/v3/video-filter/${selectedRaid}.json`
        );
        if (response.ok) {
          setFilterData(await response.json());
        }
      } catch (error) {
        console.error("Failed to load filter data:", error);
      }
    };

    loadFilterData();
  }, [isFilterMode, selectedRaid]);

  // 비디오 데이터 로드
  useEffect(() => {
    const currentRequestId = ++requestIdRef.current;

    const fetchVideos = async () => {
      try {
        setError(null);
        setLoading(true);

        if (isFilterMode && selectedRaid !== "all") {
          const response = await getVideoList(selectedRaid, 1, 1000);
          if (currentRequestId !== requestIdRef.current) return;
          setAllVideos(response.data.data);
          setFilteredVideos(response.data.data);
        } else {
          const response = await getVideoList(undefined, pagination.page, 15);
          if (currentRequestId !== requestIdRef.current) return;
          setVideos(response.data.data);
          setPagination(response.data.pagination);
        }
      } catch (err) {
        if (currentRequestId !== requestIdRef.current) return;
        setError(
          err instanceof Error ? err.message : t("videoAnalysis.errors.fetchList")
        );
      } finally {
        if (currentRequestId !== requestIdRef.current) return;
        setLoading(false);
        setIsRefreshing(false);
      }
    };

    fetchVideos();
  }, [selectedRaid, pagination.page, isFilterMode, t]);

  const handleRaidChange = useCallback(
    (value: string) => {
      setSelectedRaid(value);
      setPagination((prev) => ({ ...prev, page: 1 }));
      setCurrentPage(1);
      resetFilters({
        scoreRange: [0, 100000000],
        partyCountRange: [0, 99],
      });

      // URL만 갱신, 서버 컴포넌트 재실행 방지
      const url = value === "all" ? pathname : `${pathname}?raid=${value}`;
      window.history.replaceState(null, "", url);
    },
    [pathname, resetFilters]
  );

  const handlePageChange = useCallback(
    (newPage: number) => {
      if (isFilterMode) {
        setCurrentPage(newPage);
      } else {
        setPagination((prev) => ({ ...prev, page: newPage }));
      }
    },
    [isFilterMode]
  );

  const handleResetFilters = useCallback(() => {
    resetFilters({
      scoreRange: [0, 100000000],
      partyCountRange: [0, 99],
    });
    setCurrentPage(1);
  }, [resetFilters]);

  const convertVideosToPartyData = (videoList: VideoListItem[]) => {
    return videoList.map((video) => ({
      rank: 1,
      score: video.score,
      partyData: video.party_data || [],
    }));
  };

  const getFilteredParties = useCallback(() => {
    if (!isFilterMode || !filterData) {
      return filteredVideos;
    }

    const partyData = convertVideosToPartyData(allVideos);
    const raidData = {
      parties: partyData,
      minPartys: Math.min(...partyData.map((p) => p.partyData.length)) || 1,
      maxPartys: Math.max(...partyData.map((p) => p.partyData.length)) || 10,
    };

    const filtered = filteredPartys(
      raidData,
      filters.scoreRange,
      filters.assist,
      filters.partyCountRange,
      filters.allowDuplicate,
      false,
      {
        kind: "filter",
        includeArray: filters.includeList,
        excludeArray: filters.excludeList,
        hardExclude: filters.hardExclude,
      }
    );

    const filteredScores = new Set(filtered.map((r) => r.party.score));
    return allVideos.filter((video) => filteredScores.has(video.score));
  }, [isFilterMode, filterData, filteredVideos, allVideos, filters]);

  // 비디오 분석에서는 모드 구분 불가 → alias를 canonical로 병합
  const mergedFilters = useMemo(
    () => filterData ? mergeAliasFilters(filterData.filters) : null,
    [filterData]
  );
  const mergedAssistFilters = useMemo(
    () => filterData ? mergeAliasFilters(filterData.assistFilters) : null,
    [filterData]
  );

  const filterOptions = useMemo(
    () => (mergedFilters ? getFilters(mergedFilters, studentsMap, t, { skipModeLabel: true }) : []),
    [mergedFilters, studentsMap, t]
  );

  const excludeOptions = useMemo(
    () =>
      mergedFilters
        ? Object.keys(mergedFilters).map((key) => ({
            value: parseInt(key),
            label: studentsMap[key],
          }))
        : [],
    [mergedFilters, studentsMap]
  );

  const assistOptions = useMemo(
    () => (mergedAssistFilters ? getFilters(mergedAssistFilters, studentsMap, t, { skipModeLabel: true }) : []),
    [mergedAssistFilters, studentsMap, t]
  );

  const getDisplayVideos = useCallback(() => {
    if (!isFilterMode) {
      return videos;
    }

    const filtered = getFilteredParties();
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    return filtered.slice(startIndex, endIndex);
  }, [isFilterMode, videos, currentPage, pageSize, getFilteredParties]);

  const getFilterModePagination = useCallback(() => {
    if (!isFilterMode) {
      return pagination;
    }

    const filtered = getFilteredParties();
    const totalPages = Math.ceil(filtered.length / pageSize);
    return {
      page: currentPage,
      limit: pageSize,
      total: filtered.length,
      total_pages: totalPages,
      has_next: currentPage < totalPages,
      has_prev: currentPage > 1,
    };
  }, [isFilterMode, pagination, currentPage, pageSize, getFilteredParties]);

  return {
    loading,
    isRefreshing,
    error,
    selectedRaid,
    isFilterMode,
    filterData,
    pagination,
    pageSize,
    currentPage,
    filters,
    filterOptions,
    excludeOptions,
    assistOptions,
    displayVideos: getDisplayVideos(),
    filterModePagination: getFilterModePagination(),
    handleRaidChange,
    handlePageChange,
    handleResetFilters,
    updateFilters,
    setPageSize,
    setCurrentPage,
  };
}
