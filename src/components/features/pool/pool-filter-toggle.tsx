"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import useStudentPoolStore from "@/store/useStudentPoolStore";
import type { StarMatchPolicy } from "@/types/pool";
import PoolEditorDialog from "./pool-editor-dialog";

const POLICY_OPTIONS: { value: StarMatchPolicy; label: string; hint: string }[] =
  [
    {
      value: "exact",
      label: "완전 일치",
      hint: "풀의 성급과 파티 성급이 정확히 같아야 함",
    },
    {
      value: "atLeast",
      label: "보유 성급 이상 (≥)",
      hint: "풀 성급이 파티 요구 성급 이상이면 매칭",
    },
    {
      value: "any",
      label: "성급 무관",
      hint: "풀에 학생이 있기만 하면 매칭",
    },
  ];

interface PoolFilterToggleProps {
  highUsageStudentIds?: ReadonlySet<number>;
  highUsageLunaticStudentIds?: ReadonlySet<number>;
}

export default function PoolFilterToggle({
  highUsageStudentIds,
  highUsageLunaticStudentIds,
}: PoolFilterToggleProps) {
  const pool = useStudentPoolStore((state) => state.pool);
  const filter = useStudentPoolStore((state) => state.filter);
  const setEnabled = useStudentPoolStore((state) => state.setEnabled);
  const setPolicy = useStudentPoolStore((state) => state.setPolicy);

  const [editorOpen, setEditorOpen] = useState(false);

  const ownedCount = Object.keys(pool.students).length;
  const { enabled, policy } = filter;

  return (
    <div className="mb-4 rounded-lg border border-primary/40 bg-primary/5 p-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <label className="flex items-center gap-2 cursor-pointer select-none">
          <Checkbox
            id="poolEnabled"
            checked={enabled}
            onCheckedChange={(checked) => setEnabled(!!checked)}
            disabled={ownedCount === 0}
          />
          <span className="text-sm font-medium">
            내 캐릭터 풀로 필터링
          </span>
          <Badge variant="secondary">{ownedCount}명</Badge>
        </label>
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={() => setEditorOpen(true)}
        >
          풀 편집
        </Button>
      </div>

      {ownedCount === 0 && (
        <p className="text-xs text-muted-foreground mt-2">
          학생 풀이 비어 있습니다. &quot;풀 편집&quot;에서 보유 학생을 먼저 추가하세요.
        </p>
      )}

      {enabled && ownedCount > 0 && (
        <div className="mt-3 flex flex-col gap-3">
          <div>
            <div className="text-xs font-medium text-muted-foreground mb-1">
              성급 일치 정책
            </div>
            <div className="flex flex-wrap gap-1">
              {POLICY_OPTIONS.map((opt) => (
                <Button
                  key={opt.value}
                  type="button"
                  size="sm"
                  variant={policy === opt.value ? "default" : "outline"}
                  onClick={() => setPolicy(opt.value)}
                  title={opt.hint}
                >
                  {opt.label}
                </Button>
              ))}
            </div>
          </div>
        </div>
      )}

      <PoolEditorDialog
        open={editorOpen}
        onOpenChange={setEditorOpen}
        highUsageStudentIds={highUsageStudentIds}
        highUsageLunaticStudentIds={highUsageLunaticStudentIds}
      />
    </div>
  );
}
