"use client";

import { useMemo } from "react";
import { VideoList } from "./video-list";
import { VideoQueueDialog } from "./VideoQueueDialog";
import { AddVideoDialog } from "./AddVideoDialog";
import { useVideoAnalysis } from "./hooks/useVideoAnalysis";
import { SingleSelect } from "@/components/ui/custom/single-select";
import { Pagination } from "@/components/shared/pagination";
import { Button } from "@/components/ui/button";
import { Youtube, RefreshCw } from "lucide-react";
import { useStudentMaps } from "@/hooks/use-student-maps";
import { useRaids } from "@/hooks/use-raids";
import ErrorPage from "@/components/common/error-page";
import { generateSearchKeyword } from "@/utils/raid";
import { PartyFilterSection } from "@/components/features/raid/party-filter-section";
import Loading from "@/components/common/loading";
import { VideoListItem } from "@/types/video";

interface VideoAnalysisContentProps {
  initialVideos: VideoListItem[];
  initialPagination: {
    page: number;
    limit: number;
    total: number;
    total_pages: number;
    has_next: boolean;
    has_prev: boolean;
  };
  initialRaid: string;
}

export function VideoAnalysisContent({
  initialVideos,
  initialPagination,
  initialRaid,
}: VideoAnalysisContentProps) {
  const { studentsMap, studentSearchMap } = useStudentMaps();
  const { raids } = useRaids();

  const {
    loading,
    isRefreshing,
    error,
    selectedRaid,
    isFilterMode,
    filterData,
    pageSize,
    filters,
    filterOptions,
    excludeOptions,
    assistOptions,
    displayVideos,
    filterModePagination,
    handleRaidChange,
    handlePageChange,
    handleResetFilters,
    updateFilters,
    setPageSize,
    setCurrentPage,
  } = useVideoAnalysis({ studentsMap, initialVideos, initialPagination, initialRaid });

  const raidsSelectOptions = useMemo(
    () => [
      { value: "all", label: "전체" },
      ...raids.map((raid) => ({
        value: raid.id,
        label: raid.name,
      })),
    ],
    [raids]
  );

  if (error) {
    return <ErrorPage />;
  }

  return (
    <div className="container mx-auto px-2 sm:px-4 py-4 sm:py-6">
      <div className="mb-8 flex items-center gap-2">
        <p className="text-muted-foreground">
          1000개 이상의 총력전 영상이 준비되어 있어요.
        </p>
        {isRefreshing && (
          <RefreshCw className="h-4 w-4 animate-spin text-muted-foreground" />
        )}
      </div>

      {/* 파티 필터 */}
      {isFilterMode && filterData && studentSearchMap && (
        <PartyFilterSection
          filters={filters}
          onFilterChange={updateFilters}
          onReset={handleResetFilters}
          filterOptions={filterOptions}
          excludeOptions={excludeOptions}
          assistOptions={assistOptions}
          minPartys={0}
          maxPartys={20}
          studentSearchMap={studentSearchMap}
        />
      )}

      <div className="mx-auto mb-5 w-full">
        검색 결과: 총 {filterModePagination.total}개
      </div>

      {/* 페이지네이션 */}
      {filterModePagination.total_pages > 1 && (
        <div className="mb-5">
          <Pagination
            currentPage={filterModePagination.page}
            totalItems={filterModePagination.total}
            pageSize={pageSize}
            onPageChange={handlePageChange}
            onPageSizeChange={(newPageSize) => {
              setPageSize(newPageSize);
              setCurrentPage(1);
            }}
            pageSizeOptions={[15, 30]}
          />
        </div>
      )}

      <div className="mb-6 flex flex-col sm:flex-row gap-4 sm:items-center sm:justify-between">
        <div className="flex gap-2 items-center">
          <SingleSelect
            options={raidsSelectOptions}
            value={selectedRaid}
            onChange={handleRaidChange}
            placeholder="총력전/대결전 선택"
          />
          {selectedRaid !== "all" && (() => {
            const selectedRaidInfo = raids.find((r) => r.id === selectedRaid);
            if (!selectedRaidInfo) return null;

            const searchKeyword = generateSearchKeyword(selectedRaidInfo.name, "");
            const youtubeSearchUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(searchKeyword)}`;

            return (
              <a
                href={youtubeSearchUrl}
                target="_blank"
                rel="noopener noreferrer"
                title="YouTube에서 검색"
              >
                <Button variant="outline" size="icon">
                  <Youtube className="h-4 w-4" />
                </Button>
              </a>
            );
          })()}
        </div>

        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          <VideoQueueDialog raids={raids} />
          <AddVideoDialog raids={raids} />
        </div>
      </div>

      {loading ? (
        <Loading />
      ) : (
        <VideoList videos={displayVideos} />
      )}
    </div>
  );
}
