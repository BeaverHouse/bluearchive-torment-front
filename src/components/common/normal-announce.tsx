"use client";

import { useState, useEffect } from "react";
import { X } from "lucide-react";
import { useTranslations } from "@/lib/i18n";

const ANNOUNCE_DATE = "26.06.04";
const ANNOUNCE_ITEM_KEYS = ["announce.item.1", "announce.item.2"];
const STORAGE_KEY = "batorment_announce_dismissed";

function NormalAnnounce() {
  const [isDismissed, setIsDismissed] = useState(true);
  const { t } = useTranslations();

  useEffect(() => {
    const dismissed = localStorage.getItem(STORAGE_KEY);
    setIsDismissed(dismissed === ANNOUNCE_DATE);
  }, []);

  const handleDismiss = () => {
    localStorage.setItem(STORAGE_KEY, ANNOUNCE_DATE);
    setIsDismissed(true);
  };

  if (isDismissed) return null;

  return (
    <div className="bg-sky-50 dark:bg-sky-950 border-b border-sky-200 dark:border-sky-800 text-sky-900 dark:text-sky-100 text-sm py-2 px-4 flex items-start justify-center gap-2 relative">
      <div className="flex flex-col items-center gap-0.5 py-0.5">
        <span className="font-semibold shrink-0">
          {ANNOUNCE_DATE} {t("announce.update")}
        </span>
        <ul className="space-y-0.5">
          {ANNOUNCE_ITEM_KEYS.map((key, i) => (
            <li key={key} className="flex gap-1.5">
              <span className="shrink-0">{i + 1}.</span>
              <span>{t(key)}</span>
            </li>
          ))}
        </ul>
      </div>
      <button
        onClick={handleDismiss}
        className="absolute right-3 top-2 p-1 hover:bg-sky-100 dark:hover:bg-sky-900 rounded transition-colors"
        aria-label={t("announce.close")}
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}

export default NormalAnnounce;
