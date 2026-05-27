"use client";

import { Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { LOCALE_LABELS, LOCALES, useTranslations, type Locale } from "@/lib/i18n";

export function LanguageSwitcher({ compact = false }: { compact?: boolean }) {
  const { locale, setLocale, t } = useTranslations();

  if (compact) {
    return (
      <Select value={locale} onValueChange={(v) => setLocale(v as Locale)}>
        <SelectTrigger className="h-8 w-auto gap-1 border-none bg-transparent px-2 text-xs">
          <Globe className="h-3.5 w-3.5" />
          <SelectValue />
        </SelectTrigger>
        <SelectContent align="end">
          {LOCALES.map((l) => (
            <SelectItem key={l} value={l}>
              {LOCALE_LABELS[l]}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <Globe className="h-4 w-4 text-muted-foreground" aria-label={t("language")} />
      <div className="flex gap-1">
        {LOCALES.map((l) => (
          <Button
            key={l}
            variant={locale === l ? "default" : "outline"}
            size="sm"
            onClick={() => setLocale(l)}
          >
            {LOCALE_LABELS[l]}
          </Button>
        ))}
      </div>
    </div>
  );
}
