"use client";

import React from "react";
import Swal from "sweetalert2";
import { RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import useStudentPoolStore from "@/store/useStudentPoolStore";
import { useTranslations } from "@/lib/i18n";

interface PoolToolbarProps {
  ownedCount: number;
}

export default function PoolToolbar({ ownedCount }: PoolToolbarProps) {
  const { t } = useTranslations();
  const clearPool = useStudentPoolStore((state) => state.clearPool);

  const confirmClear = async () => {
    if (ownedCount === 0) return;
    // Radix Dialog focus trap이 외부 portal을 inert 처리하므로,
    // Swal을 Dialog 내부로 렌더링해서 interactive 유지
    const dialogContent = document.querySelector(
      '[data-slot="dialog-content"]'
    ) as HTMLElement | null;
    const result = await Swal.fire({
      title: t("pool.toolbar.clearTitle"),
      text: t("pool.toolbar.clearText").replace("{n}", String(ownedCount)),
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: t("pool.toolbar.confirmClear"),
      cancelButtonText: t("pool.toolbar.cancel"),
      target: dialogContent || document.body,
      heightAuto: false,
    });
    if (result.isConfirmed) clearPool();
  };

  return (
    <Button
      type="button"
      variant="destructive"
      size="icon"
      className="h-8 w-8"
      onClick={confirmClear}
      disabled={ownedCount === 0}
      title={t("pool.toolbar.tooltip")}
    >
      <RotateCcw className="h-4 w-4" />
    </Button>
  );
}
