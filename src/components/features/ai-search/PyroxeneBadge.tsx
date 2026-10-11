"use client";

import Image from "next/image";
import { useQuery } from "@tanstack/react-query";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { fetchGuestCredit } from "@/lib/ai-search-service";
import { useTranslations } from "@/lib/i18n";
import { cn } from "@/lib/utils";

export const GUEST_CREDIT_QUERY_KEY = ["guestCredit"];

// The daily free credit is shown as Pyroxene, the game's premium currency. One
// Pyroxene is $0.0001, so the site's $1.68 day is 16,800 and an answer costs
// exactly what it spent.
const PYROXENE_PER_USD = 10000;

/**
 * Today's free answers left, as Pyroxene. Hidden when the site has no free
 * credit, so a key-only deployment shows nothing.
 */
export function PyroxeneBadge({ className }: { className?: string }) {
  const { t, locale } = useTranslations();
  const { data } = useQuery({
    queryKey: GUEST_CREDIT_QUERY_KEY,
    queryFn: fetchGuestCredit,
    staleTime: 60_000,
  });

  if (!data?.enabled || data.limit_usd <= 0) return null;

  // The exhausted flag already holds back what one answer needs, so it decides
  // zero rather than the raw remainder.
  const pyroxene = data.exhausted ? 0 : Math.floor(data.remaining_usd * PYROXENE_PER_USD);
  const resetsAt = data.resets_at
    ? new Date(data.resets_at).toLocaleTimeString(locale, { hour: "2-digit", minute: "2-digit" })
    : null;

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          type="button"
          className={cn(
            "inline-flex items-center gap-1 rounded-full border border-sky-300 bg-sky-50 px-2.5 py-1 text-xs font-semibold text-sky-700 dark:border-sky-700 dark:bg-sky-950 dark:text-sky-300",
            pyroxene === 0 && "border-muted bg-muted text-muted-foreground",
            className,
          )}
          aria-label={`${t("arona.credit.name")} ${pyroxene.toLocaleString(locale)}`}
        >
          <Image src="/pyroxene.png" alt="" width={16} height={16} className="h-4 w-4 object-contain" />
          {pyroxene.toLocaleString(locale)}
        </button>
      </TooltipTrigger>
      <TooltipContent className="max-w-64 text-left">
        <p className="font-semibold">{t("arona.credit.name")}</p>
        <p className="mt-1">{t("arona.credit.desc")}</p>
        {resetsAt && (
          <p className="mt-1 text-muted-foreground">
            {t("arona.credit.resets")} {resetsAt}
          </p>
        )}
      </TooltipContent>
    </Tooltip>
  );
}
