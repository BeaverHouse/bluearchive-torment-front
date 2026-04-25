"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import useStudentPoolStore from "@/store/useStudentPoolStore";
import type { StarMatchPolicy } from "@/types/pool";
import PoolEditorDialog from "./pool-editor-dialog";

const POLICY_OPTIONS: { value: StarMatchPolicy; label: string; hint: string }[] =
  [
    {
      value: "exact",
      label: "일치",
      hint: "풀의 성급과 파티 데이터가 정확히 같은 학생만 매칭",
    },
    {
      value: "atLeast",
      label: "낮은 성급 허용",
      hint: "파티 데이터보다 현재 풀의 성급이 더 좋으면 매칭",
    },
    {
      value: "any",
      label: "보유 상태만",
      hint: "학생 보유 상태로만 매칭",
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
  const setPolicy = useStudentPoolStore((state) => state.setPolicy);

  const [editorOpen, setEditorOpen] = useState(false);

  const ownedCount = Object.keys(pool.students).length;
  const { policy } = filter;

  return (
    <div className="mb-4 rounded-lg border border-primary/40 bg-primary/5 p-3">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <span className="flex items-center gap-2 text-sm font-medium">
          내 캐릭터 풀
          <Badge variant="secondary">{ownedCount}명</Badge>
        </span>
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={() => setEditorOpen(true)}
          className="w-full sm:w-auto"
        >
          풀 편집
        </Button>
      </div>

      {ownedCount === 0 && (
        <p className="text-xs text-muted-foreground mt-2">
          학생 풀이 비어 있습니다. &quot;풀 편집&quot;에서 보유 학생을 먼저 추가하세요.
        </p>
      )}

      {ownedCount > 0 && (
        <div className="mt-3 flex flex-wrap justify-center gap-1">
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
