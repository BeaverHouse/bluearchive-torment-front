"use client";

import { Suspense, useMemo } from "react";
import { VideoList } from "./_components/video-list";
import { VideoQueueDialog } from "./_components/VideoQueueDialog";
import { AddVideoDialog } from "./_components/AddVideoDialog";
import { useVideoAnalysis } from "./_components/hooks/useVideoAnalysis";
import { SingleSelect } from "@/components/ui/custom/single-select";
import { Pagination } from "@/components/shared/pagination";
import { Button } from "@/components/ui/button";
import { Youtube, RotateCcw } from "lucide-react";
import { useStudentMaps } from "@/hooks/use-student-maps";
import { useRaids } from "@/hooks/use-raids";
import ErrorPage from "@/components/common/error-page";
import { generateSearchKeyword } from "@/utils/raid";
import { PartyFilter } from "@/components/features/raid/party-filter";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { ChevronDownIcon } from "@radix-ui/react-icons";
import Loading from "@/components/common/loading";

function VideoAnalysisContent() {
  const { studentsMap, studentSearchMap } = useStudentMaps();
  const { raids } = useRaids();

  const {
    loading,
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
  } = useVideoAnalysis({ studentsMap });

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

  if (loading) {
    return (
      <div className="container mx-auto px-2 sm:px-4 py-4 sm:py-6">
        <div className="mb-8">
          <p className="text-muted-foreground">
            1000개 이상의 총력전 영상이 준비되어 있어요.
          </p>
        </div>
        <Loading />
      </div>
    );
  }

  if (error) {
    return <ErrorPage />;
  }

  return (
    <div className="container mx-auto px-2 sm:px-4 py-4 sm:py-6">
      <div className="mb-8">
        <p className="text-muted-foreground">
          1000개 이상의 총력전 영상이 준비되어 있어요.
        </p>
      </div>

      {/* 파티 필터 */}
      {isFilterMode && filterData && (
        <div className="mx-auto mb-5 w-full">
          <Collapsible>
            <div className="flex items-center rounded-lg border border-gray-200 dark:border-gray-700">
              <CollapsibleTrigger className="flex flex-1 items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-gray-800">
                <span className="text-sm font-medium">파티 Filter</span>
                <ChevronDownIcon className="h-4 w-4 transition-transform" />
              </CollapsibleTrigger>
              <div className="flex items-center gap-1 pr-2">
                <Button
                  variant="destructive"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => {
                    const confirm = window.confirm("모든 캐릭터 필터가 리셋됩니다.");
                    if (confirm) handleResetFilters();
                  }}
                  title="필터 초기화"
                >
                  <RotateCcw className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <CollapsibleContent className="border-l border-r border-b border-gray-200 p-4 dark:border-gray-700">
              <PartyFilter
                filters={filters}
                onFilterChange={updateFilters}
                filterOptions={filterOptions}
                excludeOptions={excludeOptions}
                assistOptions={assistOptions}
                minPartys={0}
                maxPartys={20}
                studentSearchMap={studentSearchMap}
                showYoutubeOnly={false}
              />
            </CollapsibleContent>
          </Collapsible>
        </div>
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

      <VideoList videos={displayVideos} />
    </div>
  );
}

export default function VideoAnalysisPage() {
  return (
    <Suspense
      fallback={
        <div className="container mx-auto px-2 sm:px-4 py-4 sm:py-6">
          <div className="mb-8">
            <p className="text-muted-foreground">
              700개 이상의 총력전 영상이 준비되어 있어요.
            </p>
          </div>
          <Loading />
        </div>
      }
    >
      <VideoAnalysisContent />
    </Suspense>
  );
}
