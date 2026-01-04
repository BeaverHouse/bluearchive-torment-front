"use client";

import { useState, useEffect } from "react";
import { X } from "lucide-react";

const ANNOUNCE_DATE = "26.01.04";
const ANNOUNCE_TEXT = "종합 분석과 멍청한 아로나가 추가되었어요.";
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
    <div className="bg-sky-500 text-white text-sm py-2 px-4 flex items-center justify-center relative">
      <span>
        {ANNOUNCE_DATE} Update: {ANNOUNCE_TEXT}
      </span>
      <button
        onClick={handleDismiss}
        className="absolute right-3 p-1 hover:bg-sky-600 rounded transition-colors"
        aria-label="닫기"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}

export default NormalAnnounce;
