"use client";

import { useState } from "react";
import { Loader2, Megaphone } from "lucide-react";
import { cn } from "@/lib/utils";
import { submitWikiFeedback, type BuildSlot, type StudentBuild } from "@/lib/wiki";
import { useTranslations } from "@/lib/i18n";

const SLOT_LABEL: Record<string, string> = {
  ex: "EX",
  basic: "기본",
  enhanced: "강화",
  sub: "서브",
};

// The 스작 doc names the enhanced slot "패시브" and the basic slot "노말"; map
// those words (from compromise-row prose) onto the site's slot keys.
function slotKeyFromText(text: string): BuildSlot["key"] | null {
  const head = text.trim();
  if (/^EX/i.test(head)) return "ex";
  if (/^(기본|노말)/.test(head)) return "basic";
  if (/^(강화|패시브)/.test(head)) return "enhanced";
  if (/^서브/.test(head)) return "sub";
  return null;
}

const ALL_MAX: BuildSlot[] = (["ex", "basic", "enhanced", "sub"] as const).map(
  (key) => ({ key, level: "M", low: false }),
);

function SlotTable({ slots }: { slots: BuildSlot[] }) {
  return (
    <div className="grid grid-cols-4 overflow-hidden rounded-xl border text-center">
      {slots.map((s) => (
        <div
          key={s.key}
          className={cn(
            "flex flex-col gap-1 border-r px-1 py-2 last:border-r-0",
            s.low ? "bg-amber-50 dark:bg-amber-950/40" : "bg-muted/30",
          )}
        >
          <span className="text-[11px] text-muted-foreground">{SLOT_LABEL[s.key]}</span>
          <span
            className={cn(
              "text-sm font-bold",
              s.low ? "text-amber-600 dark:text-amber-400" : "text-foreground",
            )}
          >
            {s.level === "M" ? "MAX" : s.level}
          </span>
        </div>
      ))}
    </div>
  );
}

// No-sample state: say so explicitly and collect a tip instead of hiding the
// card — an absent card reads as "we forgot", not "no data yet".
function NoSample({ studentName }: { studentName: string }) {
  const { t } = useTranslations();
  const [text, setText] = useState("");
  const [state, setState] = useState<"idle" | "sending" | "done" | "fail">("idle");

  const send = async () => {
    if (!text.trim() || state === "sending") return;
    setState("sending");
    const ok = await submitWikiFeedback({
      slug: "notes/skill_build_trends",
      comment: `[스작 제보 — ${studentName}] ${text.trim()}`,
    });
    setState(ok ? "done" : "fail");
  };

  if (state === "done") {
    return <p className="text-sm text-emerald-700 dark:text-emerald-300">{t("students.build.reportDone")}</p>;
  }

  return (
    <div className="space-y-2.5">
      <p className="text-sm leading-relaxed">{t("students.build.noData")}</p>
      <div className="flex gap-2">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && send()}
          placeholder={t("students.build.reportPlaceholder")}
          className="min-w-0 flex-1 rounded-lg border bg-background px-3 py-1.5 text-sm outline-none focus:ring-1 focus:ring-sky-400"
        />
        <button
          type="button"
          onClick={send}
          disabled={!text.trim() || state === "sending"}
          className="inline-flex shrink-0 items-center gap-1.5 rounded-lg bg-sky-600 px-3 py-1.5 text-sm font-medium text-white transition hover:bg-sky-500 disabled:opacity-50"
        >
          {state === "sending" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Megaphone className="h-4 w-4" />}
          {t("students.build.send")}
        </button>
      </div>
      {state === "fail" && (
        <p className="text-xs text-red-600 dark:text-red-400">{t("students.build.reportFail")}</p>
      )}
    </div>
  );
}

// One layout for every case: the 4-slot table is always shown (all-MAX when the
// corpus shows no under-invested slot), followed by the reason line. A student
// with no sample at all gets an explicit no-data state with a tip form.
export function BuildNote({
  build,
  studentName,
}: {
  build: StudentBuild;
  studentName: string;
}) {
  const { t } = useTranslations();

  if (!build) return <NoSample studentName={studentName} />;

  let slots: BuildSlot[] = ALL_MAX;
  let headline = "";
  let reason = "";

  if (build.kind === "low-invest") {
    slots = build.slots;
    headline = t("students.build.recommend");
    reason = build.reason;
  } else if (build.kind === "compromise") {
    const key = slotKeyFromText(build.slot);
    slots = ALL_MAX.map((s) => (s.key === key ? { ...s, low: true } : s));
    headline = `${t("students.build.compromise")} — ${build.role}`;
    reason = `${t("students.build.compromiseSlot")}: ${build.slot}`;
  } else {
    headline = t("students.build.full");
    reason = build.group === "healer" ? t("students.build.fullHealer") : t("students.build.fullDealer");
  }

  const hasLow = slots.some((s) => s.low);

  return (
    <div className="space-y-3">
      <div>
        <div className="mb-1.5 flex items-center gap-2 text-xs font-semibold text-muted-foreground">
          {headline}
          {build.kind === "low-invest" && build.freq && (
            <span className="rounded-full bg-muted px-2 py-0.5 font-normal">
              {t("students.build.observed").replace("{n}", build.freq)}
            </span>
          )}
        </div>
        <SlotTable slots={slots} />
        {hasLow && (
          <p className="mt-1.5 text-[11px] text-muted-foreground">{t("students.build.lowHint")}</p>
        )}
      </div>
      {reason && (
        <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-200">{reason}</p>
      )}
    </div>
  );
}
