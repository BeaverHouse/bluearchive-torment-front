"use client";

import React, { useMemo, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import useStudentPoolStore from "@/store/useStudentPoolStore";
import PoolToolbar from "./pool-toolbar";
import PoolStudentGrid from "./pool-student-grid";
import PoolPresetPopover from "./pool-preset-popover";

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
  const pool = useStudentPoolStore((state) => state.pool);
  const [searchQuery, setSearchQuery] = useState("");

  const ownedCount = useMemo(
    () => Object.keys(pool.students).length,
    [pool.students]
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-3xl max-h-[90vh] flex flex-col p-0 gap-0">
        <DialogHeader className="px-6 pt-6 pb-3">
          <DialogTitle className="flex items-center gap-2">
            내 캐릭터 풀
            <Badge variant="secondary">{ownedCount}명 보유</Badge>
          </DialogTitle>
          <DialogDescription>
            보유 중인 학생을 선택해 두면, 파티 찾기에서 본인이 편성 가능한 파티만 볼 수 있습니다.
          </DialogDescription>
        </DialogHeader>

        <div className="px-6 pb-3 flex flex-col gap-2">
          <div className="flex gap-2 items-center">
            <Input
              type="text"
              placeholder="학생 이름 검색 (한/일/별명)"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              className="flex-1"
            />
            <PoolPresetPopover />
          </div>
          <PoolToolbar ownedCount={ownedCount} />
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
