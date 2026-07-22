"use client";

import { useEffect, useState, type ComponentType, type ReactNode } from "react";
import Link from "next/link";
import Image from "next/image";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { trackEvent } from "@/utils/analytics";
import { useTranslations } from "@/lib/i18n";

export interface AronaNoteLink {
  label: string;
  href: string;
  icon: ComponentType<{ className?: string }>;
  external?: boolean;
}

// "Arona's note" — a folded card placed where the user is already looking. It
// never pushes (no popup, no auto-open); the card is the whole gesture. Branded
// with Arona's avatar and a soft tint so it reads as her note, not a system box.
export function AronaNoteCard({
  context,
  slug,
  subtitle,
  children,
  links,
  defaultOpen,
}: {
  context: "party" | "student";
  slug: string;
  subtitle?: string;
  children: ReactNode;
  links: AronaNoteLink[];
  defaultOpen?: boolean;
}) {
  const { t } = useTranslations();
  const storageKey = `ba-torment.aronaNote.${context}`;
  const [open, setOpen] = useState(!!defaultOpen);

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(storageKey);
      if (saved !== null) setOpen(saved === "1");
    } catch {
      /* ignore */
    }
    trackEvent("wiki_note_view", { context, slug });
  }, [context, slug, storageKey]);

  const toggle = () => {
    const next = !open;
    setOpen(next);
    try {
      window.localStorage.setItem(storageKey, next ? "1" : "0");
    } catch {
      /* ignore */
    }
    if (next) trackEvent("wiki_note_expand", { context, slug });
  };

  return (
    <div className="overflow-hidden rounded-2xl border border-sky-200/70 bg-gradient-to-br from-sky-50 to-indigo-50/60 shadow-sm dark:border-sky-900/50 dark:from-sky-950/40 dark:to-indigo-950/20">
      <button
        onClick={toggle}
        className="flex w-full items-center gap-3 p-4 text-left transition-colors hover:bg-white/40 dark:hover:bg-white/5"
        aria-expanded={open}
      >
        <span className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white shadow ring-2 ring-sky-200 dark:bg-sky-950 dark:ring-sky-800">
          <Image src="/arona.webp" alt="ARONA" width={32} height={32} className="rounded-full" />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-sm font-semibold text-sky-900 dark:text-sky-100">
            {t("wiki.note.title")}
          </span>
          {subtitle && (
            <span className="block truncate text-xs text-sky-700/70 dark:text-sky-300/60">
              {subtitle}
            </span>
          )}
        </span>
        <ChevronDown
          className={cn(
            "h-5 w-5 shrink-0 text-sky-500 transition-transform",
            open && "rotate-180"
          )}
        />
      </button>

      {open && (
        <div className="space-y-4 px-4 pb-4">
          <div className="text-sm leading-relaxed text-slate-700 dark:text-slate-200">
            {children}
          </div>
          <div className="flex flex-wrap gap-2">
            {links.map((l) => {
              const Icon = l.icon;
              const cls =
                "inline-flex items-center gap-1.5 rounded-full bg-white/80 px-3.5 py-1.5 text-sm font-medium text-sky-800 shadow-sm ring-1 ring-sky-200 transition hover:bg-white hover:ring-sky-300 dark:bg-sky-950/60 dark:text-sky-200 dark:ring-sky-800";
              return l.external ? (
                <a key={l.href} href={l.href} target="_blank" rel="noopener noreferrer" className={cls}>
                  <Icon className="h-4 w-4" />
                  {l.label}
                </a>
              ) : (
                <Link key={l.href} href={l.href} className={cls}>
                  <Icon className="h-4 w-4" />
                  {l.label}
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
