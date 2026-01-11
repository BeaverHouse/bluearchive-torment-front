"use client";

import { useState, useCallback, memo, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Cascader } from "@/components/shared/cascader";
import { MultiSelect } from "@/components/shared/multi-select";
import { FilterOption } from "@/types/raid";
import { PartyFilterState } from "@/types/filter";
import { scoreInfo } from "@/constants/score";
import { StudentSearchData } from "@/utils/search";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Crosshair } from "lucide-react";
import { RangeChip } from "@/components/ui/range-chip";
import { ScoreChip } from "@/components/ui/score-chip";

interface PartyFilterProps {
  // 필터 상태
  filters: PartyFilterState;
  onFilterChange: (filters: Partial<PartyFilterState>) => void;

  // 데이터
  filterOptions: FilterOption[]; // 포함할 캐릭터 옵션
  excludeOptions: { value: number; label: string }[]; // 제외할 캐릭터 옵션
  assistOptions: FilterOption[]; // 조력자 옵션
  minPartys: number;
  maxPartys: number;
  studentSearchMap?: StudentSearchData; // 학생 검색 데이터 맵

  // Optional 기능
  showYoutubeOnly?: boolean; // Youtube 옵션 표시 여부
  showScoreButtons?: boolean; // 점수 버튼 표시 여부

  // 점수 이동 핸들러
  onScoreJump?: (score: number) => void;
}

// 점수 범위 계산 (3분 기준 사용)
const SCORE_RANGES = {
  insane: { min: 0, max: scoreInfo.torment.threeMinuteBase - 1 },
  torment: {
    min: scoreInfo.torment.threeMinuteBase,
    max: scoreInfo.lunatic.threeMinuteBase - 1,
  },
  lunatic: { min: scoreInfo.lunatic.threeMinuteBase, max: 999999999 },
};

// 점수 프리셋 목록 (상수로 컴포넌트 밖에 정의)
const SCORE_PRESETS = [
  {
    label: "~Insane",
    min: SCORE_RANGES.insane.min,
    max: SCORE_RANGES.insane.max,
  },
  {
    label: "Torment",
    min: SCORE_RANGES.torment.min,
    max: SCORE_RANGES.torment.max,
  },
  {
    label: "Lunatic",
    min: SCORE_RANGES.lunatic.min,
    max: SCORE_RANGES.lunatic.max,
  },
];

function PartyFilterComponent({
  filters,
  onFilterChange,
  filterOptions,
  excludeOptions,
  assistOptions,
  minPartys,
  maxPartys,
  studentSearchMap,
  showYoutubeOnly = false,
  showScoreButtons = true,
  onScoreJump,
}: PartyFilterProps) {
  const [jumpScore, setJumpScore] = useState("");
  const [jumpPopoverOpen, setJumpPopoverOpen] = useState(false);

  const handleScoreJump = useCallback(() => {
    const score = parseInt(jumpScore);
    if (!isNaN(score) && onScoreJump) {
      onScoreJump(score);
      setJumpPopoverOpen(false);
      setJumpScore("");
    }
  }, [jumpScore, onScoreJump]);

  // 콜백 함수들 메모이제이션
  const handleScoreRangeChange = useCallback((range: [number, number] | undefined) => {
    onFilterChange({ scoreRange: range });
  }, [onFilterChange]);

  const handlePartyCountChange = useCallback((min: number, max: number) => {
    onFilterChange({ partyCountRange: [min, max] });
  }, [onFilterChange]);

  const handleIncludeChange = useCallback((value: number[][]) => {
    onFilterChange({ includeList: value });
  }, [onFilterChange]);

  const handleExcludeChange = useCallback((value: (string | number)[]) => {
    onFilterChange({ excludeList: value as number[] });
  }, [onFilterChange]);

  const handleAssistChange = useCallback((value: number[][]) => {
    const newAssist = value.length > 0 ? value[0] : undefined;
    onFilterChange({ assist: newAssist });
  }, [onFilterChange]);

  const handleHardExcludeChange = useCallback((checked: boolean | "indeterminate") => {
    onFilterChange({ hardExclude: !!checked });
  }, [onFilterChange]);

  const handleAllowDuplicateChange = useCallback((checked: boolean | "indeterminate") => {
    onFilterChange({ allowDuplicate: !!checked });
  }, [onFilterChange]);

  const handleYoutubeOnlyChange = useCallback((checked: boolean | "indeterminate") => {
    onFilterChange({ youtubeOnly: !!checked });
  }, [onFilterChange]);

  // 조력자 value 메모이제이션
  const assistValue = useMemo(() =>
    filters.assist !== undefined ? [filters.assist] : [],
    [filters.assist]
  );

  return (
    <>
      {/* 필터 칩들 - 모바일: 2줄(점수 / 파티+이동), PC: 1줄 */}
      <div className="flex flex-col sm:flex-row gap-2 items-center justify-center mb-6">
        {/* 점수 범위 칩 */}
        {showScoreButtons && (
          <ScoreChip
            label="점수"
            presets={SCORE_PRESETS}
            scoreRange={filters.scoreRange}
            onChange={handleScoreRangeChange}
            className="w-full sm:w-auto"
          />
        )}

        {/* 파티 수 + 점수 이동 */}
        <div className="flex gap-2 items-center w-full sm:w-auto">
          <RangeChip
            label="파티"
            min={minPartys}
            max={maxPartys}
            minValue={filters.partyCountRange[0]}
            maxValue={filters.partyCountRange[1]}
            onChange={handlePartyCountChange}
            suffix="파티"
            className="flex-1 sm:flex-none"
          />

          {/* 점수 이동 버튼 */}
          {onScoreJump && (
            <Popover open={jumpPopoverOpen} onOpenChange={setJumpPopoverOpen}>
              <PopoverTrigger asChild>
                <Button variant="secondary" size="sm" className="gap-1.5 h-8 flex-1 sm:flex-none">
                  <Crosshair className="h-4 w-4" />
                  <span>점수 이동</span>
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-64" align="end">
              <div className="space-y-3">
                <p className="text-sm font-medium">점수로 이동</p>
                <Input
                  type="number"
                  placeholder="점수 입력"
                  value={jumpScore}
                  onChange={(e) => setJumpScore(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleScoreJump();
                  }}
                />
                <Button
                  className="w-full"
                  size="sm"
                  onClick={handleScoreJump}
                  disabled={!jumpScore}
                >
                  이동
                </Button>
              </div>
            </PopoverContent>
          </Popover>
          )}
        </div>
      </div>

      {/* 포함 캐릭터 Filter */}
      <div className="mb-4">
        <label className="text-sm font-medium mb-2 block">
          포함할 <strong>내 캐릭터</strong>
        </label>
        <Cascader
          multiple
          options={filterOptions}
          value={filters.includeList}
          onChange={handleIncludeChange}
          placeholder="캐릭터를 선택하세요"
          className="w-full"
          allowClear
          showSearch
          studentSearchMap={studentSearchMap}
        />
      </div>

      {/* 제외 캐릭터 Filter */}
      <div className="mb-4">
        <label className="text-sm font-medium mb-2 block">
          제외할 <strong>내 캐릭터</strong>
        </label>
        <MultiSelect
          options={excludeOptions}
          value={filters.excludeList}
          onChange={handleExcludeChange}
          placeholder="제외할 캐릭터를 선택하세요"
          className="w-full"
          allowClear
          showSearch
          studentSearchMap={studentSearchMap}
        />
      </div>

      <div className="flex items-center space-x-2 mb-4">
        <Checkbox
          id="hardExclude"
          checked={filters.hardExclude}
          onCheckedChange={handleHardExcludeChange}
        />
        <label htmlFor="hardExclude" className="text-sm">
          조력자에서도 제외
        </label>
      </div>

      {/* 조력자 Filter */}
      <div className="mb-4">
        <label className="text-sm font-medium mb-2 block">조력자</label>
        <Cascader
          options={assistOptions}
          value={assistValue}
          onChange={handleAssistChange}
          placeholder="조력자를 선택하세요"
          className="w-full"
          allowClear
          showSearch
          studentSearchMap={studentSearchMap}
        />
      </div>

      {/* 체크박스 옵션들 */}
      <div className="flex items-center space-x-2 mb-2">
        <Checkbox
          id="allowDuplicate"
          checked={filters.allowDuplicate}
          onCheckedChange={handleAllowDuplicateChange}
        />
        <label htmlFor="allowDuplicate" className="text-sm">
          조력자 포함 중복 허용
        </label>
      </div>

      {showYoutubeOnly && (
        <div className="flex items-center space-x-2">
          <Checkbox
            id="youtubeOnly"
            checked={filters.youtubeOnly}
            onCheckedChange={handleYoutubeOnlyChange}
          />
          <label htmlFor="youtubeOnly" className="text-sm">
            Youtube 영상
          </label>
        </div>
      )}
    </>
  );
}

// React.memo로 감싸서 불필요한 리렌더링 방지
export const PartyFilter = memo(PartyFilterComponent);
