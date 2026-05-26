"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import useStudentPoolStore from "@/store/useStudentPoolStore";
import type { MaxMissing, StarMatchPolicy } from "@/types/pool";
import PoolEditorDialog from "./pool-editor-dialog";
import { useTranslations } from "@/lib/i18n";

const POLICY_OPTIONS: { value: StarMatchPolicy; labelKey: string; hintKey: string }[] =
  [
    {
      value: "exact",
      labelKey: "pool.filter.policy.exact",
      hintKey: "pool.filter.policy.exactHint",
    },
    {
      value: "atLeast",
      labelKey: "pool.filter.policy.atLeast",
      hintKey: "pool.filter.policy.atLeastHint",
    },
    {
      value: "any",
      labelKey: "pool.filter.policy.any",
      hintKey: "pool.filter.policy.anyHint",
    },
  ];

const MAX_MISSING_OPTIONS: { value: MaxMissing; labelKey: string; hintKey: string }[] =
  [
    { value: 0, labelKey: "pool.filter.maxMissing.0", hintKey: "pool.filter.maxMissing.0hint" },
    { value: 1, labelKey: "pool.filter.maxMissing.1", hintKey: "pool.filter.maxMissing.1hint" },
    { value: 2, labelKey: "pool.filter.maxMissing.2", hintKey: "pool.filter.maxMissing.2hint" },
  ];

interface PoolFilterToggleProps {
  highUsageStudentIds?: ReadonlySet<number>;
  highUsageLunaticStudentIds?: ReadonlySet<number>;
}

export default function PoolFilterToggle({
  highUsageStudentIds,
  highUsageLunaticStudentIds,
}: PoolFilterToggleProps) {
  const { t } = useTranslations();
  const pool = useStudentPoolStore((state) => state.pool);
  const filter = useStudentPoolStore((state) => state.filter);
  const setPolicy = useStudentPoolStore((state) => state.setPolicy);
  const setMaxMissing = useStudentPoolStore((state) => state.setMaxMissing);

  const [editorOpen, setEditorOpen] = useState(false);

  const ownedCount = Object.keys(pool.students).length;
  const { policy, maxMissing } = filter;

  return (
    <div className="mb-4 rounded-lg border border-gray-200 dark:border-gray-700 p-3">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <span className="flex items-center gap-2 text-sm font-medium">
          {t("pool.filter.title")}
          <Badge variant="secondary">{t("pool.filter.ownedCount").replace("{n}", String(ownedCount))}</Badge>
        </span>
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={() => setEditorOpen(true)}
          className="w-full sm:w-auto"
        >
          {t("pool.filter.edit")}
        </Button>
      </div>

      {ownedCount === 0 && (
        <p className="text-xs text-muted-foreground mt-2">
          {t("pool.filter.empty")}
        </p>
      )}

      {ownedCount > 0 && (
        <>
          <div className="mt-3 flex flex-wrap justify-center gap-1">
            {POLICY_OPTIONS.map((opt) => (
              <Button
                key={opt.value}
                type="button"
                size="sm"
                variant={policy === opt.value ? "default" : "outline"}
                onClick={() => setPolicy(opt.value)}
                title={t(opt.hintKey)}
              >
                {t(opt.labelKey)}
              </Button>
            ))}
          </div>
          <div className="mt-2 flex flex-wrap items-center justify-center gap-1">
            <span className="text-xs text-muted-foreground mr-1">{t("pool.filter.missingAllowed")}</span>
            {MAX_MISSING_OPTIONS.map((opt) => (
              <Button
                key={opt.value}
                type="button"
                size="sm"
                variant={maxMissing === opt.value ? "default" : "outline"}
                onClick={() => setMaxMissing(opt.value)}
                title={t(opt.hintKey)}
              >
                {t(opt.labelKey)}
              </Button>
            ))}
          </div>
        </>
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
