import { useState, useEffect, useCallback, useMemo } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
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
}

export function useVideoAnalysis({ studentsMap }: UseVideoAnalysisProps) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const raidFromUrl = searchParams.get("raid");

  const [videos, setVideos] = useState<VideoListItem[]>([]);
  const [allVideos, setAllVideos] = useState<VideoListItem[]>([]);
  const [filteredVideos, setFilteredVideos] = useState<VideoListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedRaid, setSelectedRaid] = useState<string>("all");
  const [isFilterMode, setIsFilterMode] = useState(false);
  const [pagination, setPagination] = useState<PaginationState>({
    page: 1,
    limit: 15,
    total: 0,
    total_pages: 0,
    has_next: false,
    has_prev: false,
  });

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

  // URL에서 raid 파라미터 읽기
  useEffect(() => {
    const raidValue = raidFromUrl || "all";
    setSelectedRaid(raidValue);
    setIsFilterMode(raidValue !== "all");

    if (raidValue === "all") {
      setPagination((prev) => ({ ...prev, page: 1, limit: 15 }));
      setCurrentPage(1);
      resetFilters({
        scoreRange: [0, 100000000],
        partyCountRange: [0, 99],
      });
    }
  }, [raidFromUrl, resetFilters]);

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
      try {
        setLoading(true);
        setError(null);

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
      }
    };

    fetchVideos();
  }, [selectedRaid, pagination.page, isFilterMode]);

  const handleRaidChange = useCallback(
    (value: string) => {
      setSelectedRaid(value);
      setPagination((prev) => ({ ...prev, page: 1 }));

      const params = new URLSearchParams(searchParams.toString());
      if (value === "all") {
        params.delete("raid");
      } else {
        params.set("raid", value);
      }

      const newUrl = params.toString() ? `${pathname}?${params.toString()}` : pathname;
      router.replace(newUrl);
    },
    [searchParams, pathname, router]
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
