"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import useStudentPoolStore from "@/store/useStudentPoolStore";

interface PoolToolbarProps {
  ownedCount: number;
}

export default function PoolToolbar({ ownedCount }: PoolToolbarProps) {
  const clearPool = useStudentPoolStore((state) => state.clearPool);
  const setAllGrade = useStudentPoolStore((state) => state.setAllGrade);

  const confirmClear = () => {
    if (ownedCount === 0) return;
    if (window.confirm(`학생 풀(${ownedCount}명)을 모두 비우시겠습니까?`)) {
      clearPool();
    }
  };

  return (
    <div className="flex flex-wrap gap-2 items-center">
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => setAllGrade(54)}
        disabled={ownedCount === 0}
      >
        보유 전원 전무4
      </Button>
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => setAllGrade(50)}
        disabled={ownedCount === 0}
      >
        보유 전원 5성
      </Button>
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => setAllGrade(30)}
        disabled={ownedCount === 0}
      >
        보유 전원 3성
      </Button>
      <Button
        type="button"
        variant="destructive"
        size="sm"
        onClick={confirmClear}
        disabled={ownedCount === 0}
      >
        전체 해제
      </Button>
    </div>
  );
}
