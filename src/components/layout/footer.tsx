"use client";

import Link from "next/link";
import { Mail } from "lucide-react";
import { Github } from "@/components/ui/brand-icons";
import { SupportButton } from "@/components/common/support-modal";
import { useTranslations } from "@/lib/i18n";

export function Footer() {
  const { t } = useTranslations();
  return (
    <footer className="border-t mt-auto">
      <div className="max-w-4xl mx-auto px-4 py-6">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Link
              href="https://github.com/BeaverHouse/bluearchive-torment-front"
              target="_blank"
              className="text-muted-foreground hover:text-foreground transition-colors"
              aria-label="GitHub"
            >
              <Github className="h-5 w-5" />
            </Link>
            <Link
              href="mailto:haulrest@gmail.com"
              className="text-muted-foreground hover:text-foreground transition-colors"
              aria-label="Email"
            >
              <Mail className="h-5 w-5" />
            </Link>
            <SupportButton />
          </div>

          {/* The footer is on every page, so prefetching these three made them
              as busy as the home page: /legal alone drew 262 requests an hour,
              every one of them referred by another page rather than clicked.
              Nobody browses to the terms from the footer often enough to pay
              for that, and the pages are static and about 7 KB. */}
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <Link
              href="/help"
              prefetch={false}
              className="hover:text-foreground transition-colors"
            >
              {t("common.siteGuide")}
            </Link>
            <span>|</span>
            <Link
              href="/legal/privacy"
              prefetch={false}
              className="hover:text-foreground transition-colors"
            >
              {t("common.privacyPolicy")}
            </Link>
            <span>|</span>
            <Link
              href="/legal/terms"
              prefetch={false}
              className="hover:text-foreground transition-colors"
            >
              {t("common.terms")}
            </Link>
          </div>

          <div className="text-xs text-muted-foreground text-center sm:text-right">
            <p>Blue Archive copyrighted by NEXON GAMES & YOSTAR</p>
            <p>{t("footer.unofficial")}</p>
            <p>2023-2026, powered by Austin</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
