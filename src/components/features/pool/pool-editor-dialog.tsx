"use client";

import React, { useMemo, useRef, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import useStudentPoolStore from "@/store/useStudentPoolStore";
import PoolToolbar from "./pool-toolbar";
import PoolStudentGrid from "./pool-student-grid";
import PresetPopover from "@/components/features/preset/preset-popover";
import { trackEvent } from "@/utils/analytics";
import { useTranslations } from "@/lib/i18n";

interface PoolEditorDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  highUsageStudentIds?: ReadonlySet<number>;
  highUsageLunaticStudentIds?: ReadonlySet<number>;
}

export default function PoolEditorDialog({
  open,
  onOpenChange,
  highUsageStudentIds,
  highUsageLunaticStudentIds,
}: PoolEditorDialogProps) {
  const { t } = useTranslations();
  const pool = useStudentPoolStore((state) => state.pool);
  const setAll = useStudentPoolStore((state) => state.setAll);
  const [searchQuery, setSearchQuery] = useState("");
  const initialOwnedCountRef = useRef<number | null>(null);

  const ownedCount = useMemo(
    () => Object.keys(pool.students).length,
    [pool.students]
  );

  const handleOpenChange = (next: boolean) => {
    if (next) {
      trackEvent("party_search_pool_open");
      initialOwnedCountRef.current = ownedCount;
    } else {
      if (
        initialOwnedCountRef.current !== null &&
        initialOwnedCountRef.current !== ownedCount
      ) {
        trackEvent("party_search_pool_save");
      }
      initialOwnedCountRef.current = null;
    }
    onOpenChange(next);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-3xl max-h-[90vh] flex flex-col p-0 gap-0">
        <DialogHeader className="px-6 pt-6 pb-3">
          <DialogTitle className="flex items-center gap-2">
            {t("pool.editor.title")}
            <Badge variant="secondary">{t("pool.editor.ownedBadge").replace("{n}", String(ownedCount))}</Badge>
          </DialogTitle>
          <DialogDescription>
            {t("pool.editor.description")}
          </DialogDescription>
        </DialogHeader>

        <div className="px-6 pb-3 flex flex-col sm:flex-row gap-2 sm:items-center">
          <Input
            type="text"
            placeholder={t("pool.editor.searchPlaceholder")}
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            className="sm:flex-1"
          />
          <div className="flex gap-1 items-center justify-end sm:justify-start">
            <PresetPopover mode="pool" pool={pool} onLoadPool={setAll}>
              <Button
                variant="secondary"
                size="icon"
                className="h-8 w-8"
                title={t("pool.editor.presetTooltip")}
              >
                <Download className="h-4 w-4" />
              </Button>
            </PresetPopover>
            <PoolToolbar ownedCount={ownedCount} />
          </div>
        </div>

        <div className="overflow-y-auto px-6 pb-6 flex-1">
          <PoolStudentGrid
            searchQuery={searchQuery}
            highUsageStudentIds={highUsageStudentIds}
            highUsageLunaticStudentIds={highUsageLunaticStudentIds}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
