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
import { useRaids, getRaidName } from "@/hooks/use-raids";
import { useTranslations } from "@/lib/i18n";
import ErrorPage from "@/components/common/error-page";
import { generateSearchKeyword } from "@/utils/raid";
import { PartyFilterSection } from "@/components/features/raid/party-filter-section";
import Loading from "@/components/common/loading";
import { trackEvent } from "@/utils/analytics";

interface VideoAnalysisContentProps {
  initialRaid: string;
}

export function VideoAnalysisContent({
  initialRaid,
}: VideoAnalysisContentProps) {
  const { studentsMap, studentSearchMap } = useStudentMaps();
  const { raids } = useRaids();
  const { t, locale } = useTranslations();

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
  } = useVideoAnalysis({ studentsMap, initialRaid });

  const raidsSelectOptions = useMemo(
    () => [
      { value: "all", label: t("raid.all") },
      ...raids.map((raid) => ({
        value: raid.id,
        label: getRaidName(raid, locale),
      })),
    ],
    [raids, locale, t]
  );

  if (error) {
    return <ErrorPage />;
  }

  return (
    <div className="container mx-auto px-2 sm:px-4 py-4 sm:py-6">
      <div className="mb-8 flex items-center gap-2">
        <p className="text-muted-foreground">
          {t("videoAnalysis.intro")}
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
        {t("videoAnalysis.searchResults").replace("{n}", String(filterModePagination.total))}
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
            onChange={(value) => {
              handleRaidChange(value);
              trackEvent("video_filter_apply", { raid_filter: value });
            }}
            placeholder={t("videoAnalysis.raidSelectPlaceholder")}
          />
          {selectedRaid !== "all" && (() => {
            const selectedRaidInfo = raids.find((r) => r.id === selectedRaid);
            if (!selectedRaidInfo) return null;

            const searchKeyword = generateSearchKeyword(selectedRaidInfo.name_ko ?? selectedRaidInfo.name, "");
            const youtubeSearchUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(searchKeyword)}`;

            return (
              <a
                href={youtubeSearchUrl}
                target="_blank"
                rel="noopener noreferrer"
                title={t("videoAnalysis.youtubeSearchTitle")}
              >
                <Button size="sm" className="gap-1.5 h-9 bg-red-500 hover:bg-red-600">
                  <Youtube className="h-4 w-4" />
                  <span className="text-xs">YouTube</span>
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
