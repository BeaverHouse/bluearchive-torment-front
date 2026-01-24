import { useState, useEffect, useCallback, useMemo } from "react";
import { useRouter, usePathname } from "next/navigation";
import { getVideoList } from "@/lib/api";
import { VideoListItem } from "@/types/video";
import { filteredPartys, getFilters } from "@/lib/party-filters";
import { usePartyFilter } from "@/hooks/use-party-filter";

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
  initialVideos?: VideoListItem[];
  initialPagination?: PaginationState;
  initialRaid: string;
}

export function useVideoAnalysis({ studentsMap, initialVideos, initialPagination, initialRaid }: UseVideoAnalysisProps) {
  const router = useRouter();
  const pathname = usePathname();

  const [videos, setVideos] = useState<VideoListItem[]>(initialVideos || []);
  const [allVideos, setAllVideos] = useState<VideoListItem[]>([]);
  const [filteredVideos, setFilteredVideos] = useState<VideoListItem[]>([]);
  // 전체 화면 로딩 (데이터 없을 때)
  const [loading, setLoading] = useState(false);
  // 백그라운드 새로고침 (1페이지에서 prerender 데이터 있을 때)
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedRaid, setSelectedRaid] = useState<string>(initialRaid);
  const [isFilterMode, setIsFilterMode] = useState(initialRaid !== "all");
  const [pagination, setPagination] = useState<PaginationState>(
    initialPagination || {
      page: 1,
      limit: 15,
      total: 0,
      total_pages: 0,
      has_next: false,
      has_prev: false,
    }
  );

  const [pageSize, setPageSize] = useState(15);
  const [currentPage, setCurrentPage] = useState(1);
  const [filterData, setFilterData] = useState<FilterData | null>(null);

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

  // initialRaid 변경 시 상태 동기화
  useEffect(() => {
    setSelectedRaid(initialRaid);
    setIsFilterMode(initialRaid !== "all");

    if (initialRaid === "all") {
      setPagination((prev) => ({ ...prev, page: 1, limit: 15 }));
      setCurrentPage(1);
      resetFilters({
        scoreRange: [0, 100000000],
        partyCountRange: [0, 99],
      });
    }
  }, [initialRaid, resetFilters]);

  // 필터 데이터 로드
  useEffect(() => {
    const loadFilterData = async () => {
      if (!isFilterMode || !selectedRaid || selectedRaid === "all") {
        setFilterData(null);
        return;
      }

      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_CDN_URL}/batorment/v3/video-filter/${selectedRaid}.json`
        );
        if (response.ok) {
          const data = await response.json();
          setFilterData(data);
        }
      } catch (error) {
        console.error("Failed to load filter data:", error);
      }
    };

    loadFilterData();
  }, [isFilterMode, selectedRaid]);

  // 비디오 데이터 로드
  useEffect(() => {
    const fetchVideos = async () => {
      const hasInitialData = initialVideos && initialVideos.length > 0;
      const isFirstPage = !isFilterMode && selectedRaid === "all" && pagination.page === 1;

      try {
        setError(null);

        // 1페이지에서 prerender 데이터가 있으면 작은 로딩, 없으면 전체 로딩
        if (isFirstPage && hasInitialData) {
          setIsRefreshing(true);
        } else {
          setLoading(true);
        }

        if (isFilterMode && selectedRaid !== "all") {
          const response = await getVideoList(selectedRaid, 1, 1000);
          setAllVideos(response.data.data);
          setFilteredVideos(response.data.data);
        } else {
          const response = await getVideoList(undefined, pagination.page, 15);
          setVideos(response.data.data);
          setPagination(response.data.pagination);
        }
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "비디오 목록을 불러오는데 실패했습니다"
        );
      } finally {
        setLoading(false);
        setIsRefreshing(false);
      }
    };

    fetchVideos();
  }, [selectedRaid, pagination.page, isFilterMode, initialVideos]);

  const handleRaidChange = useCallback(
    (value: string) => {
      setSelectedRaid(value);
      setIsFilterMode(value !== "all");
      setPagination((prev) => ({ ...prev, page: 1 }));

      if (value === "all") {
        router.replace(pathname);
      } else {
        router.replace(`${pathname}?raid=${value}`);
      }
    },
    [pathname, router]
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
      filters.includeList,
      filters.excludeList,
      filters.assist,
      filters.partyCountRange,
      filters.hardExclude,
      filters.allowDuplicate,
      false
    );

    const filteredScores = new Set(filtered.map((p) => p.score));
    return allVideos.filter((video) => filteredScores.has(video.score));
  }, [isFilterMode, filterData, filteredVideos, allVideos, filters]);

  const filterOptions = useMemo(
    () => (filterData ? getFilters(filterData.filters, studentsMap) : []),
    [filterData, studentsMap]
  );

  const excludeOptions = useMemo(
    () =>
      filterData
        ? Object.keys(filterData.filters).map((key) => ({
            value: parseInt(key),
            label: studentsMap[key],
          }))
        : [],
    [filterData, studentsMap]
  );

  const assistOptions = useMemo(
    () => (filterData ? getFilters(filterData.assistFilters, studentsMap) : []),
    [filterData, studentsMap]
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
    // State
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
    // Computed
    filterOptions,
    excludeOptions,
    assistOptions,
    displayVideos: getDisplayVideos(),
    filterModePagination: getFilterModePagination(),
    // Actions
    handleRaidChange,
    handlePageChange,
    handleResetFilters,
    updateFilters,
    setPageSize,
    setCurrentPage,
  };
}
