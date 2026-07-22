"use client";

import { useState } from "react";
import { useTotalAnalysis } from "@/hooks/use-total-analysis";
import { LunaticClearChart } from "@/components/features/total-analysis/LunaticClearChart";
import { RaidUsageTable } from "@/components/features/total-analysis/RaidUsageTable";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ChevronDown, Loader2 } from "lucide-react";
import { useTranslations } from "@/lib/i18n";

// The "추이" tab leads with the season-over-season lunatic clear chart — that
// is the actual trend story. The raw per-season top-picks table is an archive
// some players do want, so it stays, but folded behind a toggle instead of
// dominating the tab as a cramped three-table grid.
export function SeasonTrends() {
  const { t } = useTranslations();
  const { data, isLoading } = useTotalAnalysis();
  const [showTable, setShowTable] = useState(false);
  const [type, setType] = useState<"striker" | "special" | "assist">("striker");

  if (isLoading || !data) {
    return (
      <div className="flex min-h-[300px] items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const title =
    type === "striker"
      ? t("totalAnalysis.raidUsage.strikerTitle")
      : type === "special"
        ? t("totalAnalysis.raidUsage.specialTitle")
        : t("totalAnalysis.raidUsage.assistTitle");

  return (
    <div className="flex w-full flex-col gap-4 overflow-x-hidden">
      <p className="text-sm text-muted-foreground">{t("totalAnalysis.intro")}</p>

      <LunaticClearChart data={data} />

      <button
        type="button"
        onClick={() => setShowTable((v) => !v)}
        className="flex items-center gap-1.5 self-start text-sm font-medium text-sky-600 hover:underline dark:text-sky-400"
      >
        <ChevronDown className={`h-4 w-4 transition-transform ${showTable ? "rotate-180" : ""}`} />
        {showTable ? t("totalAnalysis.raidUsage.hide") : t("totalAnalysis.raidUsage.show")}
      </button>

      {showTable && (
        <>
          <Tabs value={type} onValueChange={(v) => setType(v as typeof type)}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="striker">{t("totalAnalysis.raidUsage.strikerTitle")}</TabsTrigger>
              <TabsTrigger value="special">{t("totalAnalysis.raidUsage.specialTitle")}</TabsTrigger>
              <TabsTrigger value="assist">{t("totalAnalysis.raidUsage.assistTitle")}</TabsTrigger>
            </TabsList>
          </Tabs>
          <RaidUsageTable data={data} type={type} title={title} limit={type === "assist" ? 3 : 5} />
        </>
      )}
    </div>
  );
}
