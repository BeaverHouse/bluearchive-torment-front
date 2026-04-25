"use client";

import React from "react";
import { Download, Upload } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import useStudentPoolStore from "@/store/useStudentPoolStore";
import type { StudentPool } from "@/types/pool";
import { isGradeKey } from "@/types/pool";

interface PoolPresetSchema {
  schemaVersion: number;
  type: string;
  exportedAt: string;
  pool: Record<string, number>;
}

const SCHEMA_TYPE = "ba-torment-pool";
const SCHEMA_VERSION = 1;

function formatDate(): string {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}${mm}${dd}`;
}

export default function PoolPresetPopover() {
  const pool = useStudentPoolStore((state) => state.pool);
  const setAll = useStudentPoolStore((state) => state.setAll);
  const [importText, setImportText] = React.useState("");
  const [message, setMessage] = React.useState<string | null>(null);
  const [messageType, setMessageType] = React.useState<"success" | "error">(
    "success"
  );

  const showMessage = (text: string, type: "success" | "error" = "success") => {
    setMessage(text);
    setMessageType(type);
    setTimeout(() => setMessage(null), 3000);
  };

  const buildPayload = (): PoolPresetSchema => ({
    schemaVersion: SCHEMA_VERSION,
    type: SCHEMA_TYPE,
    exportedAt: new Date().toISOString(),
    pool: { ...pool.students },
  });

  const handleCopy = async () => {
    try {
      const payload = JSON.stringify(buildPayload(), null, 2);
      await navigator.clipboard.writeText(payload);
      showMessage("클립보드에 복사되었습니다.");
    } catch {
      showMessage("클립보드 복사에 실패했습니다.", "error");
    }
  };

  const handleDownload = () => {
    const payload = JSON.stringify(buildPayload(), null, 2);
    const blob = new Blob([payload], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `ba-pool-${formatDate()}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleImport = () => {
    if (!importText.trim()) {
      showMessage("붙여넣을 JSON이 비어 있습니다.", "error");
      return;
    }

    let parsed: unknown;
    try {
      parsed = JSON.parse(importText);
    } catch {
      showMessage("JSON 파싱 실패.", "error");
      return;
    }

    if (
      !parsed ||
      typeof parsed !== "object" ||
      (parsed as PoolPresetSchema).type !== SCHEMA_TYPE ||
      (parsed as PoolPresetSchema).schemaVersion !== SCHEMA_VERSION ||
      typeof (parsed as PoolPresetSchema).pool !== "object"
    ) {
      showMessage("BA Torment 풀 형식이 아닙니다.", "error");
      return;
    }

    const rawPool = (parsed as PoolPresetSchema).pool;
    const nextPool: StudentPool = { students: {} };
    for (const [key, value] of Object.entries(rawPool)) {
      if (!/^\d+$/.test(key)) continue;
      if (!isGradeKey(value)) continue;
      nextPool.students[key] = value;
    }

    const currentCount = Object.keys(pool.students).length;
    if (currentCount > 0) {
      const ok = window.confirm(
        `현재 풀(${currentCount}명)이 불러온 풀(${Object.keys(nextPool.students).length}명)로 대체됩니다. 계속하시겠습니까?`
      );
      if (!ok) return;
    }

    setAll(nextPool);
    setImportText("");
    showMessage("풀을 불러왔습니다.");
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" type="button">
          내보내기 / 불러오기
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80" align="end">
        <div className="flex flex-col gap-3">
          <div className="flex gap-2">
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={handleCopy}
              className="flex-1"
            >
              <Download className="w-4 h-4" />
              클립보드
            </Button>
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={handleDownload}
              className="flex-1"
            >
              <Download className="w-4 h-4" />
              JSON 다운로드
            </Button>
          </div>
          <div className="border-t pt-3">
            <Textarea
              placeholder="JSON을 붙여넣으세요"
              value={importText}
              onChange={(event) => setImportText(event.target.value)}
              rows={4}
              className="text-xs"
            />
            <Button
              type="button"
              size="sm"
              onClick={handleImport}
              className="w-full mt-2"
            >
              <Upload className="w-4 h-4" />
              불러오기
            </Button>
          </div>
          {message && (
            <div
              className={`text-xs ${
                messageType === "success"
                  ? "text-primary"
                  : "text-destructive"
              }`}
            >
              {message}
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
