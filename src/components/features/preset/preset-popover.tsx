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
import type { PartyFilterState } from "@/types/filter";
import type { GradeKey, StudentPool } from "@/types/pool";
import { isGradeKey } from "@/types/pool";

const SCHEMA_TYPE = "ba-torment-preset";
const SCHEMA_VERSION = 1;
const LEGACY_POOL_TYPE = "ba-torment-pool";

const FILTER_KEYS: (keyof PartyFilterState)[] = [
  "scoreRange",
  "includeList",
  "excludeList",
  "assist",
  "partyCountRange",
  "hardExclude",
  "allowDuplicate",
  "youtubeOnly",
];

interface UnifiedPreset {
  schemaVersion: number;
  type: string;
  exportedAt: string;
  filter?: Partial<PartyFilterState>;
  pool?: StudentPool;
}

function extractFilter(value: unknown): Partial<PartyFilterState> | undefined {
  if (!value || typeof value !== "object") return undefined;
  const obj = value as Record<string, unknown>;
  const result: Partial<PartyFilterState> = {};
  for (const key of FILTER_KEYS) {
    if (key in obj) {
      (result as Record<string, unknown>)[key] = obj[key];
    }
  }
  return Object.keys(result).length > 0 ? result : undefined;
}

function extractPool(value: unknown): StudentPool | undefined {
  if (!value || typeof value !== "object") return undefined;
  const obj = value as Record<string, unknown>;
  const rawStudents =
    obj.students && typeof obj.students === "object" ? obj.students : obj;
  if (!rawStudents || typeof rawStudents !== "object") return undefined;
  const students: Record<string, GradeKey> = {};
  for (const [code, grade] of Object.entries(rawStudents)) {
    if (!/^\d+$/.test(code)) continue;
    if (!isGradeKey(grade)) continue;
    students[code] = grade;
  }
  return Object.keys(students).length > 0 ? { students } : undefined;
}

function buildExport(
  mode: "filter" | "pool",
  filter?: PartyFilterState,
  pool?: StudentPool
): UnifiedPreset {
  const payload: UnifiedPreset = {
    schemaVersion: SCHEMA_VERSION,
    type: SCHEMA_TYPE,
    exportedAt: new Date().toISOString(),
  };
  if (mode === "filter" && filter) payload.filter = filter;
  if (mode === "pool" && pool) payload.pool = pool;
  return payload;
}

function parseFilterPreset(raw: unknown): Partial<PartyFilterState> {
  if (!raw || typeof raw !== "object") {
    throw new Error("올바른 JSON 형식이 아닙니다.");
  }
  const obj = raw as Record<string, unknown>;

  // 새 통합 포맷
  if (obj.type === SCHEMA_TYPE) {
    if (obj.schemaVersion !== SCHEMA_VERSION) {
      throw new Error(`지원하지 않는 schemaVersion: ${obj.schemaVersion}`);
    }
    const filter = extractFilter(obj.filter);
    if (!filter) throw new Error("이 프리셋에 필터 데이터가 없습니다.");
    return filter;
  }

  // 레거시 풀 포맷 → 필터 진입점에서는 거부
  if (obj.type === LEGACY_POOL_TYPE) {
    throw new Error("이 프리셋은 캐릭터 풀 전용입니다.");
  }

  // 레거시 필터 raw 포맷
  const filter = extractFilter(obj);
  if (!filter) throw new Error("BA Torment 필터 프리셋이 아닙니다.");
  return filter;
}

function parsePoolPreset(raw: unknown): StudentPool {
  if (!raw || typeof raw !== "object") {
    throw new Error("올바른 JSON 형식이 아닙니다.");
  }
  const obj = raw as Record<string, unknown>;

  // 새 통합 포맷
  if (obj.type === SCHEMA_TYPE) {
    if (obj.schemaVersion !== SCHEMA_VERSION) {
      throw new Error(`지원하지 않는 schemaVersion: ${obj.schemaVersion}`);
    }
    const pool = extractPool(obj.pool);
    if (!pool) throw new Error("이 프리셋에 캐릭터 풀 데이터가 없습니다.");
    return pool;
  }

  // 레거시 풀 포맷
  if (obj.type === LEGACY_POOL_TYPE) {
    const pool = extractPool(obj.pool);
    if (!pool) throw new Error("이 프리셋이 비어 있습니다.");
    return pool;
  }

  // 레거시 필터 raw 포맷 → 풀 진입점에서는 거부
  const filterKeys = FILTER_KEYS.some((k) => k in obj);
  if (filterKeys) {
    throw new Error("이 프리셋은 필터 전용입니다.");
  }

  throw new Error("BA Torment 캐릭터 풀 프리셋이 아닙니다.");
}

function formatDate(): string {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}${mm}${dd}`;
}

type FilterMode = {
  mode: "filter";
  filter: PartyFilterState;
  onLoadFilter: (filter: Partial<PartyFilterState>) => void;
};

type PoolMode = {
  mode: "pool";
  pool: StudentPool;
  onLoadPool: (pool: StudentPool) => void;
};

type PresetPopoverProps = (FilterMode | PoolMode) & {
  children: React.ReactNode;
};

export default function PresetPopover(props: PresetPopoverProps) {
  const { mode, children } = props;
  const [open, setOpen] = useState(false);
  const [presetText, setPresetText] = useState("");
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [container, setContainer] = useState<HTMLElement | null>(null);

  const isFilterMode = mode === "filter";
  const headerText = isFilterMode ? "필터 프리셋" : "캐릭터 풀 프리셋";
  const filename = isFilterMode
    ? `ba-torment-filter-${formatDate()}.json`
    : `ba-torment-pool-${formatDate()}.json`;

  const handleOpen = (isOpen: boolean) => {
    setOpen(isOpen);
    if (isOpen) {
      // Radix Dialog 내부에서 사용될 경우, dialog 안으로 portal해서 inert 회피
      const dialogContent = document.querySelector(
        '[data-slot="dialog-content"]'
      ) as HTMLElement | null;
      setContainer(dialogContent);

      const payload = buildExport(
        mode,
        isFilterMode ? props.filter : undefined,
        !isFilterMode ? props.pool : undefined
      );
      setPresetText(JSON.stringify(payload, null, 2));
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

  const handleDownload = () => {
    const blob = new Blob([presetText], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleLoad = () => {
    try {
      const parsed = JSON.parse(presetText);
      if (isFilterMode) {
        const filter = parseFilterPreset(parsed);
        props.onLoadFilter(filter);
      } else {
        const pool = parsePoolPreset(parsed);
        props.onLoadPool(pool);
      }
      setOpen(false);
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "JSON 파싱에 실패했습니다.");
    }
  };

  return (
    <Popover open={open} onOpenChange={handleOpen}>
      <PopoverTrigger asChild>{children}</PopoverTrigger>
      <PopoverContent className="w-80" align="end" container={container}>
        <div className="space-y-3">
          <p className="text-sm font-medium">{headerText}</p>
          <p className="text-xs text-muted-foreground">
            현재 설정을 복사하거나, 저장된 프리셋을 붙여넣어 불러올 수 있습니다.
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
          {error && <p className="text-xs text-destructive">{error}</p>}
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
          <Button size="sm" className="w-full gap-1" onClick={handleLoad}>
            <Upload className="h-4 w-4" />
            <span>불러오기</span>
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
