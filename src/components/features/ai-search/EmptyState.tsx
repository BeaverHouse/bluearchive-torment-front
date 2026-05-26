"use client";

import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Key } from "lucide-react";
import { useTranslations } from "@/lib/i18n";

interface EmptyStateProps {
  hasApiKey: boolean;
  onSetupApiKey: () => void;
}

export function EmptyState({ hasApiKey, onSetupApiKey }: EmptyStateProps) {
  const { t } = useTranslations();
  return (
    <div className="flex flex-col items-center justify-center h-full text-center">
      <Image
        src="/arona.webp"
        alt="ARONA"
        width={80}
        height={80}
        className="rounded-full mb-4 object-cover"
      />
      <p className="text-lg font-medium mb-3">{t("arona.empty.greeting")}</p>
      <div className="text-sm text-muted-foreground space-y-1 mb-4">
        <p>
          🔍 <strong>{t("arona.empty.search.label")}</strong> - {t("arona.empty.search.desc")}
        </p>
        <p>
          📋 <strong>{t("arona.empty.skill.label")}</strong> - {t("arona.empty.skill.desc")}
        </p>
        <p>
          ⚔️ <strong>{t("arona.empty.damage.label")}</strong> - {t("arona.empty.damage.desc")}
        </p>
      </div>
      {!hasApiKey && (
        <Button className="mt-2" onClick={onSetupApiKey}>
          <Key className="h-4 w-4 mr-2" />
          {t("arona.empty.setupKey")}
        </Button>
      )}
    </div>
  );
}
