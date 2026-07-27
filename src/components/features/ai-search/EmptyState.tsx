"use client";

import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Key } from "lucide-react";
import { useTranslations } from "@/lib/i18n";

interface EmptyStateProps {
  hasApiKey: boolean;
  onSetupApiKey: () => void;
  showSetupAction?: boolean;
}

export function EmptyState({
  hasApiKey,
  onSetupApiKey,
  showSetupAction = true,
}: EmptyStateProps) {
  const { t } = useTranslations();
  return (
    <div className="flex min-h-full flex-col items-center justify-center text-center">
      <Image
        src="/arona.webp"
        alt="ARONA"
        width={80}
        height={80}
        className="rounded-full mb-4 object-cover"
      />
      <p className="text-lg font-medium mb-3">{t("arona.empty.greeting")}</p>
      <div className="mb-4 space-y-1.5 text-sm text-muted-foreground">
        <p>
          🔎 <strong>{t("arona.empty.student.label")}</strong> - {t("arona.empty.student.desc")}
        </p>
        <p>
          📚 <strong>{t("arona.empty.guide.label")}</strong> - {t("arona.empty.guide.desc")}
        </p>
        <p>
          📊 <strong>{t("arona.empty.party.label")}</strong> - {t("arona.empty.party.desc")}
        </p>
        <p>
          🧮 <strong>{t("arona.empty.calculate.label")}</strong> - {t("arona.empty.calculate.desc")}
        </p>
      </div>
      {showSetupAction && !hasApiKey && (
        <Button className="mt-2" onClick={onSetupApiKey}>
          <Key className="h-4 w-4 mr-2" />
          {t("arona.empty.setupKey")}
        </Button>
      )}
    </div>
  );
}
