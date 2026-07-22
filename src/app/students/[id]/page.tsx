"use client";

import { use, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Loader2, ArrowLeft, ExternalLink, BookOpen, MessageCircle, Search, Database } from "lucide-react";
import { useTotalAnalysis } from "@/hooks/use-total-analysis";
import { useStudentMaps } from "@/hooks/use-student-maps";
import { StudentImage } from "@/components/features/student/student-image";
import { StarDistChart } from "@/components/features/total-analysis/StarDistChart";
import { UsageHeatmap } from "@/components/features/total-analysis/UsageHeatmap";
import { AronaNoteCard } from "@/components/features/wiki/arona-note-card";
import { BuildNote } from "@/components/features/wiki/build-note";
import { Badge } from "@/components/ui/badge";
import { trackEvent } from "@/utils/analytics";
import {
  getStudentBuild,
  findReportsMentioning,
  schaleDbStudentUrl,
  type StudentBuild,
  type ReportRef,
} from "@/lib/wiki";
import { useTranslations } from "@/lib/i18n";

export default function StudentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const studentId = Number(id);
  const { t } = useTranslations();
  const { data, isLoading } = useTotalAnalysis();
  const { studentsMap } = useStudentMaps();

  const name = studentsMap[id] || id;
  const isStriker = studentId < 20000;
  const char = useMemo(
    () => data?.characterAnalyses.find((c) => c.studentId === studentId) ?? null,
    [data, studentId]
  );

  // undefined = still loading, null = confirmed no sample (renders the tip form)
  const [build, setBuild] = useState<StudentBuild | undefined>(undefined);
  const [reports, setReports] = useState<ReportRef[]>([]);
  const [showAllReports, setShowAllReports] = useState(false);

  const REPORT_CAP = 4;

  useEffect(() => {
    if (Number.isFinite(studentId)) trackEvent("student_page_view", { student_id: studentId });
  }, [studentId]);

  useEffect(() => {
    if (!name || name === id) return;
    let alive = true;
    getStudentBuild(name).then((b) => alive && setBuild(b));
    findReportsMentioning(name).then((r) => alive && setReports(r));
    return () => {
      alive = false;
    };
  }, [name, id]);

  if (isLoading || !data) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const stats = char
    ? [
        { label: t("totalAnalysis.character.statOverall"), value: `${char.overallRank}${t("students.rankUnit")}` },
        {
          label: isStriker ? t("totalAnalysis.character.statStrikerIn") : t("totalAnalysis.character.statSpecialIn"),
          value: `${char.categoryRank}${t("students.rankUnit")}`,
        },
        { label: t("totalAnalysis.character.statUsage"), value: char.totalUsage.toLocaleString() },
        { label: t("totalAnalysis.character.statAssist"), value: `${(char.assistStats.assistRatio * 100).toFixed(1)}%` },
      ]
    : [];

  return (
    <div className="mx-auto max-w-3xl px-4 py-6">
      <Link
        href="/students"
        className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        {t("students.back")}
      </Link>

      {/* Header */}
      <div className="rounded-2xl border bg-card p-5 shadow-sm">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-4">
            <div className="shrink-0 overflow-hidden rounded-2xl ring-1 ring-border">
              <StudentImage code={studentId} size={72} />
            </div>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-2xl font-bold">{name}</h1>
                <Badge variant="secondary" className="rounded-full">
                  {isStriker ? "STRIKER" : "SPECIAL"}
                </Badge>
              </div>
            </div>
          </div>
          <a
            href={schaleDbStudentUrl(studentId)}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex shrink-0 items-center gap-1.5 rounded-full border bg-background px-3 py-1.5 text-xs font-medium text-muted-foreground transition hover:text-foreground hover:ring-1 hover:ring-foreground/20"
          >
            <Database className="h-3.5 w-3.5" />
            SchaleDB
            <ExternalLink className="h-3 w-3" />
          </a>
        </div>

        {char && (
          <div className="mt-5 grid grid-cols-4 gap-2 border-t pt-4 text-center">
            {stats.map((s, i) => (
              <div key={i} className="flex flex-col gap-0.5">
                <span className="text-[11px] text-muted-foreground">{s.label}</span>
                <span className="text-base font-bold sm:text-lg">{s.value}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Arona build note — always rendered once loaded; a student with no
          sample gets an explicit no-data state with a tip form instead of
          silently missing the card */}
      {build !== undefined && (
        <div className="mt-4">
          <AronaNoteCard
            context="student"
            slug="notes/skill_build_trends"
            subtitle={t("students.build.subtitle")}
            defaultOpen
            links={[
              { label: t("students.buildReport"), href: "/guide/notes/skill_build_trends", icon: BookOpen },
              { label: t("arona.entry.ask"), href: "/guide", icon: MessageCircle },
            ]}
          >
            <BuildNote build={build} studentName={name} />
          </AronaNoteCard>
        </div>
      )}

      {char ? (
        <div className="mt-6 space-y-6">
          {/* Usage heatmap */}
          <section className="space-y-1.5">
            <UsageHeatmap characterData={char} raidAnalyses={data.raidAnalyses} />
            <p className="px-1 text-xs text-muted-foreground">⚠ {t("students.population")}</p>
          </section>

          {/* Synergy + star distribution — equal height */}
          <div className="grid items-stretch gap-4 md:grid-cols-2">
            {char.topSynergyChars.length > 0 && (
              <div className="flex flex-col rounded-2xl border bg-card p-4 shadow-sm">
                <div className="mb-3 text-sm font-semibold">{t("students.synergy.title")}</div>
                <div className="space-y-2.5">
                  {char.topSynergyChars.slice(0, 3).map((s, idx) => (
                    <Link
                      key={s.studentId}
                      href={`/students/${s.studentId}`}
                      className="flex items-center gap-3 rounded-lg p-1 transition-colors hover:bg-muted/60"
                    >
                      <span className="w-4 shrink-0 text-center text-sm font-semibold text-muted-foreground">
                        {idx + 1}
                      </span>
                      <div className="overflow-hidden rounded-lg">
                        <StudentImage code={s.studentId} size={36} />
                      </div>
                      <span className="flex-1 truncate text-sm font-medium">
                        {studentsMap[s.studentId.toString()] || s.studentId}
                      </span>
                      <span className="text-sm font-semibold text-sky-600 dark:text-sky-400">
                        {(s.coUsageRate * 100).toFixed(1)}%
                      </span>
                    </Link>
                  ))}
                </div>
              </div>
            )}
            {/* StarDistChart renders its own empty-with-reason state */}
            <StarDistChart characterData={char} />
          </div>
        </div>
      ) : (
        <p className="mt-6 rounded-2xl border bg-muted/30 p-4 text-center text-sm text-muted-foreground">
          {t("students.noStats")}
        </p>
      )}

      {/* Related records */}
      {reports.length > 0 && (
        <section className="mt-8">
          <h2 className="text-sm font-semibold">{t("students.related.title")}</h2>
          <p className="mb-3 mt-0.5 text-xs text-muted-foreground">{t("students.related.subtitle")}</p>
          <div className="grid gap-3 sm:grid-cols-2">
            {(showAllReports ? reports : reports.slice(0, REPORT_CAP)).map((r) => (
              <div
                key={r.slug}
                className="flex flex-col rounded-2xl border bg-card p-4 shadow-sm transition-colors hover:border-primary/40"
              >
                <Link href={`/guide/${r.slug}`} className="group">
                  <div className="flex items-start gap-2">
                    <BookOpen className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                    <span className="text-sm font-semibold leading-snug group-hover:text-primary">
                      {r.title}
                    </span>
                  </div>
                  {r.summary && (
                    <p className="mt-1.5 line-clamp-2 text-xs text-muted-foreground">{r.summary}</p>
                  )}
                </Link>
                {r.raidIds[0] && (
                  <Link
                    href={`/party?season=${encodeURIComponent(r.raidIds[0])}`}
                    className="mt-3 inline-flex w-fit items-center gap-1.5 rounded-full bg-muted px-3 py-1 text-xs font-medium transition-colors hover:bg-muted/70"
                  >
                    <Search className="h-3.5 w-3.5" />
                    {t("students.related.party")}
                  </Link>
                )}
              </div>
            ))}
          </div>
          {reports.length > REPORT_CAP && (
            <button
              onClick={() => setShowAllReports((v) => !v)}
              className="mx-auto mt-3 flex items-center gap-1 rounded-full border bg-background px-4 py-1.5 text-xs font-medium text-muted-foreground transition hover:text-foreground"
            >
              {showAllReports
                ? t("students.related.less")
                : t("students.related.more").replace("{n}", String(reports.length - REPORT_CAP))}
            </button>
          )}
        </section>
      )}
    </div>
  );
}
