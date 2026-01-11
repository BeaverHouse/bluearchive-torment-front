"use client";

import { useState, useCallback, useMemo, memo, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ChevronDown } from "lucide-react";

interface RangeChipProps {
  label: string;
  min: number;
  max: number;
  minValue: number;
  maxValue: number;
  onChange: (min: number, max: number) => void;
  suffix?: string;
  className?: string;
}

function RangeChipComponent({
  label,
  min,
  max,
  minValue,
  maxValue,
  onChange,
  suffix = "",
  className,
}: RangeChipProps) {
  const [open, setOpen] = useState(false);

  // 로컬 상태 (Popover 내부에서 사용)
  const [localMin, setLocalMin] = useState(minValue);
  const [localMax, setLocalMax] = useState(maxValue);

  // Popover 열릴 때 현재 값으로 초기화
  useEffect(() => {
    if (open) {
      setLocalMin(minValue);
      setLocalMax(maxValue);
    }
  }, [open, minValue, maxValue]);

  const displayText = useMemo(() =>
    minValue === min && maxValue === max
      ? "전체"
      : minValue === maxValue
        ? `${minValue}${suffix}`
        : `${minValue}~${maxValue}${suffix}`,
    [minValue, maxValue, min, max, suffix]
  );

  const isDefault = minValue === min && maxValue === max;

  // 옵션 배열 메모이제이션
  const options = useMemo(() =>
    Array.from({ length: max - min + 1 }, (_, i) => min + i),
    [min, max]
  );

  const handleLocalMinChange = useCallback((value: string) => {
    const newMin = parseInt(value);
    setLocalMin(newMin);
    if (newMin > localMax) {
      setLocalMax(newMin);
    }
  }, [localMax]);

  const handleLocalMaxChange = useCallback((value: string) => {
    const newMax = parseInt(value);
    setLocalMax(newMax);
    if (newMax < localMin) {
      setLocalMin(newMax);
    }
  }, [localMin]);

  // 적용 버튼
  const handleApply = useCallback(() => {
    onChange(localMin, localMax);
    setOpen(false);
  }, [localMin, localMax, onChange]);

  // 초기화 버튼
  const handleReset = useCallback(() => {
    setLocalMin(min);
    setLocalMax(max);
    onChange(min, max);
  }, [min, max, onChange]);

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
      <PopoverContent className="w-auto p-3" align="start">
        <div className="space-y-3">
          <p className="text-sm font-medium">{label} 범위</p>
          <div className="flex items-center gap-2">
            <Select
              value={localMin.toString()}
              onValueChange={handleLocalMinChange}
            >
              <SelectTrigger className="w-20">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {options.map((value) => (
                  <SelectItem key={value} value={value.toString()}>
                    {value}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <span className="text-sm text-muted-foreground">~</span>
            <Select
              value={localMax.toString()}
              onValueChange={handleLocalMaxChange}
            >
              <SelectTrigger className="w-20">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {options.map((value) => (
                  <SelectItem key={value} value={value.toString()}>
                    {value}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <span className="text-sm text-muted-foreground">{suffix}</span>
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

export const RangeChip = memo(RangeChipComponent);
