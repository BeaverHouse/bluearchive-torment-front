"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import useStudentPoolStore from "@/store/useStudentPoolStore";

interface PoolToolbarProps {
  ownedCount: number;
}

export default function PoolToolbar({ ownedCount }: PoolToolbarProps) {
  const clearPool = useStudentPoolStore((state) => state.clearPool);

  const confirmClear = () => {
    if (ownedCount === 0) return;
    if (window.confirm(`학생 풀(${ownedCount}명)을 모두 비우시겠습니까?`)) {
      clearPool();
    }
  };

  return (
    <Button
      type="button"
      variant="destructive"
      onClick={confirmClear}
      disabled={ownedCount === 0}
      className="h-10"
    >
      전체 해제
    </Button>
  );
}
