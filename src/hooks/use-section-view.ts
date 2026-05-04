"use client";

import { useEffect, useRef } from "react";
import { trackEvent, type AnalyticsEvent } from "@/utils/analytics";

type SectionEvent = Extract<
  AnalyticsEvent,
  { name: "summary_section_view" | "total_analysis_section_view" }
>;

/**
 * 섹션이 화면에 50% 이상 1.5초 노출되면 1회 발화. 발화 후 observer 해제.
 */
export function useSectionView<E extends SectionEvent>(
  name: E["name"],
  section: string,
) {
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (typeof IntersectionObserver === "undefined") return;

    let timer: ReturnType<typeof setTimeout> | null = null;
    let fired = false;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting && entry.intersectionRatio >= 0.5) {
            if (!timer && !fired) {
              timer = setTimeout(() => {
                fired = true;
                trackEvent(name, { section } as E["params"]);
                observer.disconnect();
              }, 1500);
            }
          } else if (timer) {
            clearTimeout(timer);
            timer = null;
          }
        }
      },
      { threshold: 0.5 },
    );

    observer.observe(el);
    return () => {
      if (timer) clearTimeout(timer);
      observer.disconnect();
    };
  }, [name, section]);

  return ref;
}
