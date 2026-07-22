"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Loader2 } from "lucide-react";
import { useTotalAnalysis } from "@/hooks/use-total-analysis";
import { useStudentMaps } from "@/hooks/use-student-maps";
import { StudentImage } from "@/components/features/student/student-image";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useTranslations } from "@/lib/i18n";

type SortKey = "rank" | "name";

export default function StudentsPage() {
  const { t } = useTranslations();
  const { data, isLoading } = useTotalAnalysis();
  const { studentsMap } = useStudentMaps();
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<SortKey>("rank");

  const students = useMemo(() => {
    if (!data) return [];
    const q = query.trim().toLowerCase();
    const list = data.characterAnalyses
      .map((c) => ({
        id: c.studentId,
        name: studentsMap[c.studentId.toString()] || String(c.studentId),
        rank: c.overallRank,
      }))
      .filter((s) => !q || s.name.toLowerCase().includes(q));
    list.sort((a, b) =>
      sort === "name" ? a.name.localeCompare(b.name, "ko") : a.rank - b.rank
    );
    return list;
  }, [data, studentsMap, query, sort]);

  if (isLoading || !data) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-6">
      <h1 className="text-2xl font-bold">{t("students.title")}</h1>
      <p className="mt-1 text-sm text-muted-foreground">{t("students.subtitle")}</p>

      <div className="mt-5 flex flex-wrap items-center gap-2">
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={t("students.searchPlaceholder")}
          className="max-w-56"
        />
        <Select value={sort} onValueChange={(v) => setSort(v as SortKey)}>
          <SelectTrigger className="w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="rank">{t("students.sort.rank")}</SelectItem>
            <SelectItem value="name">{t("students.sort.name")}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="mt-6 grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-6">
        {students.map((s) => (
          <Link
            key={s.id}
            href={`/students/${s.id}`}
            className="group flex flex-col items-center gap-1.5 rounded-xl p-2 transition-colors hover:bg-muted/60"
          >
            <div className="overflow-hidden rounded-xl ring-1 ring-transparent transition-all group-hover:ring-primary/40 group-hover:shadow-md">
              <StudentImage code={s.id} size={72} />
            </div>
            <span className="w-full truncate text-center text-xs font-medium">{s.name}</span>
          </Link>
        ))}
      </div>

      {students.length === 0 && (
        <p className="mt-16 text-center text-sm text-muted-foreground">
          {t("students.empty")}
        </p>
      )}
    </div>
  );
}
