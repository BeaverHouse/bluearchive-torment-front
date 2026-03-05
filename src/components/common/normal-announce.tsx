"use client";

import { useState, useEffect } from "react";
import { X } from "lucide-react";

const ANNOUNCE_DATE = "26.03.05";
const ANNOUNCE_ITEMS = [
  "UI 오류를 수정하고 뉴비 가이드 페이지를 추가했어요.",
  "3월 중에 보안 패치가 있을 예정이에요. 사이트 이용 중 5-10분 정도의 끊김이 있을 수 있어요.",
];
const STORAGE_KEY = "batorment_announce_dismissed";

function NormalAnnounce() {
  const [isDismissed, setIsDismissed] = useState(true);

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
        <span className="font-semibold shrink-0">{ANNOUNCE_DATE} Update</span>
        <ul className="space-y-0.5">
          {ANNOUNCE_ITEMS.map((item, i) => (
            <li key={i} className="flex gap-1.5">
              <span className="shrink-0">{i + 1}.</span>
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </div>
      <button
        onClick={handleDismiss}
        className="absolute right-3 top-2 p-1 hover:bg-sky-100 dark:hover:bg-sky-900 rounded transition-colors"
        aria-label="닫기"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}

export default NormalAnnounce;
