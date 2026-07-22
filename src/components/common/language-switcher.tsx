"use client";

import { useState } from "react";
import { Globe, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { LOCALE_LABELS, LOCALES, useTranslations } from "@/lib/i18n";

export function LanguageSwitcher({ compact = false }: { compact?: boolean }) {
  const { locale, setLocale, t } = useTranslations();
  const [open, setOpen] = useState(false);

  if (compact) {
    // Popover (not Radix Select) so it never scroll-locks the body — a scroll
    // lock breaks the sticky header and makes the top bar vanish on open.
    return (
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <button className="inline-flex h-8 items-center gap-1 rounded-md px-2 text-xs text-muted-foreground transition-colors hover:bg-accent hover:text-foreground">
            <Globe className="h-3.5 w-3.5" />
            {LOCALE_LABELS[locale]}
          </button>
        </PopoverTrigger>
        <PopoverContent align="end" className="w-auto min-w-28 p-1">
          {LOCALES.map((l) => (
            <button
              key={l}
              onClick={() => {
                setLocale(l);
                setOpen(false);
              }}
              className={cn(
                "flex w-full items-center justify-between gap-3 rounded-sm px-2.5 py-1.5 text-sm transition-colors hover:bg-accent",
                l === locale && "font-medium"
              )}
            >
              {LOCALE_LABELS[l]}
              {l === locale && <Check className="h-3.5 w-3.5 text-primary" />}
            </button>
          ))}
        </PopoverContent>
      </Popover>
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
