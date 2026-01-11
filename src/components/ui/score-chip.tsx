"use client";

import { useState, useCallback, useMemo, memo, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ChevronDown } from "lucide-react";

interface ScorePreset {
  label: string;
  min: number;
  max: number;
}

interface ScoreChipProps {
  label: string;
  presets: ScorePreset[];
  scoreRange: [number, number] | undefined;
  onChange: (range: [number, number] | undefined) => void;
  className?: string;
}

function ScoreChipComponent({
  label,
  presets,
  scoreRange,
  onChange,
  className,
}: ScoreChipProps) {
  const [open, setOpen] = useState(false);

  // 로컬 상태 (Popover 내부에서 사용)
  const [localMin, setLocalMin] = useState<string>("");
  const [localMax, setLocalMax] = useState<string>("");

  // Popover 열릴 때 현재 값으로 초기화
  useEffect(() => {
    if (open) {
      setLocalMin(scoreRange ? scoreRange[0].toString() : "");
      setLocalMax(scoreRange ? (scoreRange[1] >= 999999999 ? "" : scoreRange[1].toString()) : "");
    }
  }, [open, scoreRange]);

  // 현재 선택된 프리셋 찾기 (메모이제이션)
  const activePreset = useMemo(() => presets.find(
    (preset) =>
      scoreRange &&
      scoreRange[0] === preset.min &&
      scoreRange[1] === preset.max
  ), [presets, scoreRange]);

  const displayText = useMemo(() => activePreset
    ? activePreset.label
    : scoreRange
      ? `${scoreRange[0].toLocaleString()} ~ ${scoreRange[1] >= 999999999 ? "최대" : scoreRange[1].toLocaleString()}`
      : "전체", [activePreset, scoreRange]);

  const isDefault = !scoreRange;

  // 프리셋 클릭 (즉시 적용)
  const handlePresetClick = useCallback((preset: ScorePreset) => {
    // 같은 프리셋 다시 클릭하면 해제
    if (
      scoreRange &&
      scoreRange[0] === preset.min &&
      scoreRange[1] === preset.max
    ) {
      onChange(undefined);
      setLocalMin("");
      setLocalMax("");
    } else {
      onChange([preset.min, preset.max]);
      setLocalMin(preset.min.toString());
      setLocalMax(preset.max >= 999999999 ? "" : preset.max.toString());
    }
  }, [scoreRange, onChange]);

  // 적용 버튼 클릭
  const handleApply = useCallback(() => {
    const min = localMin ? parseInt(localMin) : 0;
    const max = localMax ? parseInt(localMax) : 999999999;

    if (!localMin && !localMax) {
      onChange(undefined);
    } else {
      onChange([min, max]);
    }
    setOpen(false);
  }, [localMin, localMax, onChange]);

  // 초기화 버튼
  const handleReset = useCallback(() => {
    setLocalMin("");
    setLocalMax("");
    onChange(undefined);
  }, [onChange]);

  // 로컬 프리셋 활성화 상태 확인
  const getLocalActivePreset = useCallback(() => {
    const min = localMin ? parseInt(localMin) : 0;
    const max = localMax ? parseInt(localMax) : 999999999;
    return presets.find(p => p.min === min && p.max === max);
  }, [localMin, localMax, presets]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Badge
          variant={isDefault ? "outline" : "secondary"}
          className={cn(
            "cursor-pointer hover:bg-accent transition-colors px-2.5 py-1.5 text-sm font-normal gap-1 justify-center",
            className
          )}
        >
          <span className="text-muted-foreground">{label}:</span>
          <span className="font-medium">{displayText}</span>
          <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
        </Badge>
      </PopoverTrigger>
      <PopoverContent className="w-72 p-3" align="start">
        <div className="space-y-3">
          <p className="text-sm font-medium">{label} 범위</p>

          {/* 프리셋 버튼 */}
          <div className="flex gap-2 flex-wrap">
            {presets.map((preset) => {
              const localActive = getLocalActivePreset();
              const isActive = localActive?.label === preset.label;
              return (
                <Button
                  key={preset.label}
                  variant={isActive ? "default" : "outline"}
                  size="sm"
                  onClick={() => handlePresetClick(preset)}
                  className="min-w-20"
                >
                  {preset.label}
                </Button>
              );
            })}
          </div>

          {/* 직접 입력 */}
          <div className="flex items-center gap-2">
            <Input
              type="number"
              placeholder="최소"
              value={localMin}
              onChange={(e) => setLocalMin(e.target.value)}
              className="flex-1"
            />
            <span className="text-sm text-muted-foreground">~</span>
            <Input
              type="number"
              placeholder="최대"
              value={localMax}
              onChange={(e) => setLocalMax(e.target.value)}
              className="flex-1"
            />
          </div>

          {/* 버튼 */}
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleReset}
              className="flex-1"
            >
              초기화
            </Button>
            <Button
              size="sm"
              onClick={handleApply}
              className="flex-1"
            >
              적용
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}

export const ScoreChip = memo(ScoreChipComponent);
