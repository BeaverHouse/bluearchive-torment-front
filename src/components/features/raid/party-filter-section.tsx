"use client";

import Swal from "sweetalert2";
import { Button } from "@/components/ui/button";
import { Download, RotateCcw } from "lucide-react";
import { ChevronDownIcon } from "@radix-ui/react-icons";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { PartyFilter } from "./party-filter";
import { FilterPresetPopover } from "./filter-preset-popover";
import { FilterOption } from "@/types/raid";
import { PartyFilterState } from "@/types/filter";
import { StudentSearchData } from "@/utils/search";

interface PartyFilterSectionProps {
  // 필터 상태
  filters: PartyFilterState;
  onFilterChange: (filters: Partial<PartyFilterState>) => void;
  onReset: () => void;

  // 필터 옵션 데이터
  filterOptions: FilterOption[];
  excludeOptions: { value: number; label: string }[];
  assistOptions: FilterOption[];
  minPartys: number;
  maxPartys: number;
  studentSearchMap: StudentSearchData;

  // 선택적 기능
  defaultOpen?: boolean;
  showYoutubeOnly?: boolean;
  showPresetPopover?: boolean;
  onScoreJump?: (score: number) => void;
  onLoadPreset?: (preset: Partial<PartyFilterState>) => void;
}

export function PartyFilterSection({
  filters,
  onFilterChange,
  onReset,
  filterOptions,
  excludeOptions,
  assistOptions,
  minPartys,
  maxPartys,
  studentSearchMap,
  defaultOpen = false,
  showYoutubeOnly = false,
  showPresetPopover = false,
  onScoreJump,
  onLoadPreset,
}: PartyFilterSectionProps) {
  const handleReset = async () => {
    const result = await Swal.fire({
      title: "필터 초기화",
      text: "모든 캐릭터 필터가 리셋됩니다.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "초기화",
      cancelButtonText: "취소",
    });
    if (result.isConfirmed) onReset();
  };

  return (
    <div className="mx-auto mb-5 w-full">
      <Collapsible defaultOpen={defaultOpen}>
        <div className="flex items-center rounded-lg border border-gray-200 dark:border-gray-700">
          <CollapsibleTrigger className="flex flex-1 items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-gray-800">
            <span className="text-sm font-medium">파티 Filter</span>
            <ChevronDownIcon className="h-4 w-4 transition-transform" />
          </CollapsibleTrigger>
          <div className="flex items-center gap-1 pr-2">
            {showPresetPopover && onLoadPreset && (
              <FilterPresetPopover
                filters={filters}
                onLoadPreset={onLoadPreset}
              >
                <Button
                  variant="secondary"
                  size="icon"
                  className="h-8 w-8"
                  title="필터 프리셋"
                >
                  <Download className="h-4 w-4" />
                </Button>
              </FilterPresetPopover>
            )}
            <Button
              variant="destructive"
              size="icon"
              className="h-8 w-8"
              onClick={handleReset}
              title="필터 초기화"
            >
              <RotateCcw className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <CollapsibleContent className="border-l border-r border-b border-gray-200 p-4 dark:border-gray-700">
          <PartyFilter
            filters={filters}
            onFilterChange={onFilterChange}
            filterOptions={filterOptions}
            excludeOptions={excludeOptions}
            assistOptions={assistOptions}
            minPartys={minPartys}
            maxPartys={maxPartys}
            studentSearchMap={studentSearchMap}
            showYoutubeOnly={showYoutubeOnly}
            onScoreJump={onScoreJump}
          />
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
}
