"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Textarea } from "@/components/ui/textarea";
import { Download, Upload, Copy, Check } from "lucide-react";
import { PartyFilterState } from "@/types/filter";

interface FilterPresetPopoverProps {
  filters: PartyFilterState;
  onLoadPreset: (preset: Partial<PartyFilterState>) => void;
  children: React.ReactNode;
}

export function FilterPresetPopover({
  filters,
  onLoadPreset,
  children,
}: FilterPresetPopoverProps) {
  const [open, setOpen] = useState(false);
  const [presetText, setPresetText] = useState("");
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleOpen = (isOpen: boolean) => {
    setOpen(isOpen);
    if (isOpen) {
      // 현재 필터를 JSON으로 변환
      setPresetText(JSON.stringify(filters, null, 2));
      setError(null);
      setCopied(false);
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(presetText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setError("클립보드 복사에 실패했습니다.");
    }
  };

  const handleLoad = () => {
    try {
      const parsed = JSON.parse(presetText);

      // 기본적인 유효성 검사
      if (typeof parsed !== "object" || parsed === null) {
        throw new Error("올바른 JSON 형식이 아닙니다.");
      }

      // PartyFilterState 타입에 맞게 필터링
      const validKeys: (keyof PartyFilterState)[] = [
        "scoreRange",
        "includeList",
        "excludeList",
        "assist",
        "partyCountRange",
        "hardExclude",
        "allowDuplicate",
        "youtubeOnly",
      ];

      const filteredPreset: Partial<PartyFilterState> = {};
      for (const key of validKeys) {
        if (key in parsed) {
          (filteredPreset as Record<string, unknown>)[key] = parsed[key];
        }
      }

      onLoadPreset(filteredPreset);
      setOpen(false);
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "JSON 파싱에 실패했습니다.");
    }
  };

  const handleDownload = () => {
    const blob = new Blob([presetText], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `filter-preset-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <Popover open={open} onOpenChange={handleOpen}>
      <PopoverTrigger asChild>{children}</PopoverTrigger>
      <PopoverContent className="w-80" align="end">
        <div className="space-y-3">
          <p className="text-sm font-medium">필터 프리셋</p>
          <p className="text-xs text-muted-foreground">
            현재 필터를 복사하거나, 저장된 프리셋을 붙여넣어 불러올 수 있습니다.
          </p>
          <Textarea
            rows={8}
            className="font-mono text-xs"
            value={presetText}
            onChange={(e) => {
              setPresetText(e.target.value);
              setError(null);
            }}
            placeholder="JSON 프리셋을 붙여넣으세요..."
          />
          {error && (
            <p className="text-xs text-destructive">{error}</p>
          )}
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              className="flex-1 gap-1"
              onClick={handleCopy}
            >
              {copied ? (
                <Check className="h-4 w-4" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
              <span>{copied ? "복사됨" : "복사"}</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="flex-1 gap-1"
              onClick={handleDownload}
            >
              <Download className="h-4 w-4" />
              <span>다운로드</span>
            </Button>
          </div>
          <Button
            size="sm"
            className="w-full gap-1"
            onClick={handleLoad}
          >
            <Upload className="h-4 w-4" />
            <span>불러오기</span>
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
