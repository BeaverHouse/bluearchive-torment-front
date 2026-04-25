"use client";

import React, { useMemo, useState } from "react";
import useStudentPoolStore from "@/store/useStudentPoolStore";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import PoolToolbar from "@/components/features/pool/pool-toolbar";
import PoolStudentGrid from "@/components/features/pool/pool-student-grid";
import PoolPresetPopover from "@/components/features/pool/pool-preset-popover";

export default function PoolPage() {
  const pool = useStudentPoolStore((state) => state.pool);
  const [searchQuery, setSearchQuery] = useState("");

  const ownedCount = useMemo(
    () => Object.keys(pool.students).length,
    [pool.students]
  );

  return (
    <div
      className="App"
      style={{
        width: "100%",
        maxWidth: 960,
        margin: "0 auto",
        padding: "8px",
      }}
    >
      <div className="flex flex-wrap gap-2 items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <h1 className="text-xl font-bold">내 캐릭터 풀</h1>
          <Badge variant="secondary">{ownedCount}명 보유</Badge>
        </div>
        <PoolPresetPopover />
      </div>

      <p className="text-sm text-muted-foreground mb-3">
        보유 중인 학생을 선택해 두면, 파티 찾기에서 &quot;내 풀로 필터링&quot;을 켜서 본인이 편성 가능한 파티만 볼 수 있습니다.
      </p>

      <div className="flex flex-col gap-3 mb-4">
        <Input
          type="text"
          placeholder="학생 이름 검색 (한/일/별명)"
          value={searchQuery}
          onChange={(event) => setSearchQuery(event.target.value)}
        />
        <PoolToolbar ownedCount={ownedCount} />
      </div>

      <PoolStudentGrid searchQuery={searchQuery} />
    </div>
  );
}
