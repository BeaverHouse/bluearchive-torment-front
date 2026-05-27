"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ExternalLink, Key, AlertTriangle } from "lucide-react";
import { trackEvent } from "@/utils/analytics";
import { useTranslations } from "@/lib/i18n";

interface ApiKeyModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (apiKey: string) => void;
}

export function ApiKeyModal({
  open,
  onOpenChange,
  onSubmit,
}: ApiKeyModalProps) {
  const [apiKey, setApiKey] = useState("");
  const [error, setError] = useState("");
  const { t } = useTranslations();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!apiKey.trim()) {
      setError(t("apiKey.required"));
      return;
    }

    if (!apiKey.startsWith("AI")) {
      setError(t("apiKey.invalid"));
      return;
    }

    setError("");
    trackEvent("arona_apikey_set");
    onSubmit(apiKey.trim());
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Key className="h-5 w-5" />
            {t("apiKey.title")}
          </DialogTitle>
          <DialogDescription>
            {t("apiKey.desc.line1")}
            <br />
            {t("apiKey.desc.line2")}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="apiKey" className="text-sm font-medium">
              {t("apiKey.label")}
            </label>
            <Input
              id="apiKey"
              type="password"
              placeholder="AIza..."
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              autoComplete="off"
            />
            {error && <p className="text-sm text-destructive">{error}</p>}
          </div>

          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <ExternalLink className="h-4 w-4 flex-shrink-0" />
            <a
              href="https://aistudio.google.com/app/apikey"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:underline"
            >
              {t("apiKey.studio")}
            </a>
          </div>

          <div className="rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 p-3">
            <div className="flex items-center gap-2 text-amber-700 dark:text-amber-400 font-medium text-sm mb-2">
              <AlertTriangle className="h-4 w-4" />
              {t("apiKey.notice.title")}
            </div>
            <ul className="text-xs text-amber-700 dark:text-amber-400/80 space-y-1 list-disc list-inside">
              <li>{t("apiKey.notice.beta")}</li>
              <li>{t("apiKey.notice.wrong")}</li>
              <li>{t("apiKey.notice.feedback")}</li>
              <li>{t("apiKey.notice.limit")}</li>
            </ul>
          </div>

          <div className="rounded-lg bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 p-3">
            <div className="flex items-center gap-2 text-blue-700 dark:text-blue-400 font-medium text-sm mb-2">
              {t("apiKey.search.title")}
            </div>
            <ul className="text-xs text-blue-700 dark:text-blue-400/80 space-y-1 list-disc list-inside">
              <li>{t("apiKey.search.line1")}</li>
              <li>{t("apiKey.search.line2")}</li>
            </ul>
          </div>

          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              {t("common.cancel")}
            </Button>
            <Button type="submit">{t("common.confirm")}</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
