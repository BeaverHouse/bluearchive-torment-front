"use client";

import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Cascader } from "@/components/shared/cascader";
import { MultiSelect } from "@/components/shared/multi-select";
import { FilterOption } from "@/types/raid";
import { PartyFilterState } from "@/types/filter";
import { scoreInfo } from "@/constants/score";

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

  // Optional 기능
  showYoutubeOnly?: boolean; // Youtube 옵션 표시 여부
  showScoreButtons?: boolean; // 점수 버튼 표시 여부

  // 리셋 핸들러
  onReset: () => void;
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

export function PartyFilter({
  filters,
  onFilterChange,
  filterOptions,
  excludeOptions,
  assistOptions,
  minPartys,
  maxPartys,
  showYoutubeOnly = false,
  showScoreButtons = true,
  onReset,
}: PartyFilterProps) {
  const handleScoreButtonClick = (level: "insane" | "torment" | "lunatic") => {
    const range = SCORE_RANGES[level];
    const currentRange = filters.scoreRange;

    // 같은 버튼을 다시 클릭하면 해제 (undefined로 설정)
    if (
      currentRange &&
      currentRange[0] === range.min &&
      currentRange[1] === range.max
    ) {
      onFilterChange({ scoreRange: undefined });
    } else {
      onFilterChange({ scoreRange: [range.min, range.max] });
    }
  };

  const getActiveScoreButton = ():
    | "insane"
    | "torment"
    | "lunatic"
    | null => {
    if (!filters.scoreRange) return null;

    const [min, max] = filters.scoreRange;

    if (
      min === SCORE_RANGES.insane.min &&
      max === SCORE_RANGES.insane.max
    ) {
      return "insane";
    }
    if (
      min === SCORE_RANGES.torment.min &&
      max === SCORE_RANGES.torment.max
    ) {
      return "torment";
    }
    if (
      min === SCORE_RANGES.lunatic.min &&
      max === SCORE_RANGES.lunatic.max
    ) {
      return "lunatic";
    }

    return null;
  };

  const activeScoreButton = getActiveScoreButton();

  return (
    <>
      <div className="flex justify-center mb-5">
        <Button className="w-60" onClick={onReset} variant="destructive">
          필터 Reset
        </Button>
      </div>

      {/* 점수 & 파티 수 Filter */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-center gap-6 mb-6">
        {/* 점수 필터 */}
        {showScoreButtons && (
          <div className="flex flex-col items-center">
            <label className="text-sm font-medium mb-2">점수</label>
            {/* 점수 버튼 */}
            <div className="flex gap-2 mb-2">
              <Button
                variant={activeScoreButton === "insane" ? "default" : "outline"}
                size="sm"
                onClick={() => handleScoreButtonClick("insane")}
                className="min-w-20"
              >
                ~Insane
              </Button>
              <Button
                variant={
                  activeScoreButton === "torment" ? "default" : "outline"
                }
                size="sm"
                onClick={() => handleScoreButtonClick("torment")}
                className="min-w-20"
              >
                Torment
              </Button>
              <Button
                variant={
                  activeScoreButton === "lunatic" ? "default" : "outline"
                }
                size="sm"
                onClick={() => handleScoreButtonClick("lunatic")}
                className="min-w-20"
              >
                Lunatic
              </Button>
            </div>
            {/* 점수 범위 직접 입력 */}
            <div className="flex items-center gap-2">
              <Input
                type="number"
                placeholder="최소"
                value={filters.scoreRange?.[0] ?? ""}
                onChange={(e) => {
                  const min = e.target.value ? parseInt(e.target.value) : 0;
                  const max = filters.scoreRange?.[1] ?? 999999999;
                  onFilterChange({ scoreRange: [min, max] });
                }}
                className="w-32 text-center"
              />
              <span className="text-sm text-muted-foreground">~</span>
              <Input
                type="number"
                placeholder="최대"
                value={filters.scoreRange?.[1] ?? ""}
                onChange={(e) => {
                  const min = filters.scoreRange?.[0] ?? 0;
                  const max = e.target.value ? parseInt(e.target.value) : 999999999;
                  onFilterChange({ scoreRange: [min, max] });
                }}
                className="w-32 text-center"
              />
            </div>
          </div>
        )}

        {/* 파티 수 Filter */}
        <div className="flex flex-col items-center">
          <label className="text-sm font-medium mb-2">파티 수</label>
          <div className="flex items-center gap-2">
            <Select
              value={filters.partyCountRange[0].toString()}
              onValueChange={(value) => {
                const min = parseInt(value);
                onFilterChange({
                  partyCountRange: [
                    min,
                    Math.max(min, filters.partyCountRange[1]),
                  ],
                });
              }}
            >
              <SelectTrigger className="w-20">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Array.from({ length: maxPartys - minPartys + 1 }, (_, i) => {
                  const value = minPartys + i;
                  return (
                    <SelectItem key={value} value={value.toString()}>
                      {value}
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
            <span className="text-sm text-muted-foreground">~</span>
            <Select
              value={filters.partyCountRange[1].toString()}
              onValueChange={(value) => {
                const max = parseInt(value);
                onFilterChange({
                  partyCountRange: [
                    Math.min(filters.partyCountRange[0], max),
                    max,
                  ],
                });
              }}
            >
              <SelectTrigger className="w-20">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Array.from({ length: maxPartys - minPartys + 1 }, (_, i) => {
                  const value = minPartys + i;
                  return (
                    <SelectItem key={value} value={value.toString()}>
                      {value}
                    </SelectItem>
                  );
                })}
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
          options={filterOptions}
          value={filters.includeList}
          onChange={(value) => onFilterChange({ includeList: value })}
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
          options={excludeOptions}
          value={filters.excludeList}
          onChange={(value) => onFilterChange({ excludeList: value as number[] })}
          placeholder="제외할 캐릭터를 선택하세요"
          className="w-full"
          allowClear
          showSearch
        />
      </div>

      <div className="flex items-center space-x-2 mb-4">
        <Checkbox
          id="hardExclude"
          checked={filters.hardExclude}
          onCheckedChange={(checked) =>
            onFilterChange({ hardExclude: !!checked })
          }
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
          value={filters.assist !== undefined ? [filters.assist] : []}
          onChange={(value) => {
            const newAssist = value.length > 0 ? value[0] : undefined;
            onFilterChange({ assist: newAssist });
          }}
          placeholder="조력자를 선택하세요"
          className="w-full"
          allowClear
          showSearch
        />
      </div>

      <div className="flex items-center space-x-2 mb-2">
        <Checkbox
          id="allowDuplicate"
          checked={filters.allowDuplicate}
          onCheckedChange={(checked) =>
            onFilterChange({ allowDuplicate: !!checked })
          }
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
            onCheckedChange={(checked) =>
              onFilterChange({ youtubeOnly: !!checked })
            }
          />
          <label htmlFor="youtubeOnly" className="text-sm">
            Youtube 영상
          </label>
        </div>
      )}
    </>
  );
}
