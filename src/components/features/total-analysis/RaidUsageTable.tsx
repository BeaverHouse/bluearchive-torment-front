"use client";

import { useMemo } from "react";
import { TotalAnalysisData } from "@/types/total-analysis";
import { StudentImage } from "@/components/features/student/student-image";
import { useRaids, getRaidName } from "@/hooks/use-raids";
import { useTranslations } from "@/lib/i18n";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";

interface RaidUsageTableProps {
  data: TotalAnalysisData;
  type: "striker" | "special" | "assist";
  limit?: number;
}

export function RaidUsageTable({ data, type, limit = 5 }: RaidUsageTableProps) {
  const { t, locale } = useTranslations();
  const { raids } = useRaids();

  const processedData = useMemo(() => {
    // 최신 시즌이 위로 오도록 역순 정렬
    const reversedAnalyses = [...data.raidAnalyses].reverse();

    return reversedAnalyses.map((raid) => {
      const raidInfo = raids.find((r) => r.id === raid.raidId);
      const fullName = raidInfo ? getRaidName(raidInfo, locale) : raid.raidId;
      // 총력전/대결전 SXX 접두사 제거
      const displayName = fullName.replace(/^(총력전|대결전)\s+S\d+\s+/, "");

      // 대결전: "시가지 예로니무스 (경장갑,토먼트)" → 본문 + 괄호(2줄)
      const bracketMatch = displayName.match(/^(.+?)\s*(\(.+\))$/);
      const nameParts = bracketMatch
        ? { main: bracketMatch[1], sub: bracketMatch[2] }
        : { main: displayName, sub: null };

      const students =
        type === "striker"
          ? raid.topStrikers
          : type === "special"
            ? raid.topSpecials
            : raid.topAssists;

      const topItems = Array.from({ length: limit }).map((_, i) => students[i] || null);

      return { id: raid.raidId, nameParts, students: topItems };
    });
  }, [data, raids, type, limit, locale]);

  return (
    <Card className="flex h-[480px] max-w-full flex-col overflow-hidden sm:h-[620px]">
      <CardContent className="max-w-full flex-1 overflow-hidden p-0">
        <div className="h-full max-w-full overflow-auto">
          <Table>
            <TableHeader className="sticky top-0 z-10">
              <TableRow className="bg-card hover:bg-card">
                <TableHead className="w-[76px] bg-card px-2 sm:w-[136px]" />
                {Array.from({ length: limit }).map((_, i) => (
                  <TableHead
                    key={i}
                    className="w-[48px] bg-card px-0.5 text-center text-[10px] font-medium text-muted-foreground sm:w-[56px] sm:text-xs"
                  >
                    {t("common.rank").replace("{n}", String(i + 1))}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {processedData.map((row) => (
                <TableRow key={row.id} className="hover:bg-muted/40">
                  <TableCell className="w-[76px] px-2 py-2 align-middle sm:w-[136px]">
                    <div className="leading-tight">
                      <div className="truncate text-[11px] font-semibold sm:text-xs">
                        {row.nameParts.main}
                      </div>
                      {row.nameParts.sub && (
                        <div className="truncate text-[9px] text-muted-foreground sm:text-[10px]">
                          {row.nameParts.sub}
                        </div>
                      )}
                    </div>
                  </TableCell>
                  {row.students.map((student, index) => (
                    <TableCell
                      key={index}
                      className="w-[48px] px-0.5 py-1.5 text-center align-top sm:w-[56px]"
                    >
                      {student ? (
                        <div className="flex flex-col items-center gap-0.5">
                          <StudentImage code={student.studentId} size={40} />
                          <span className="text-[9px] leading-none text-muted-foreground">
                            {student.usageCount.toLocaleString()}
                          </span>
                        </div>
                      ) : (
                        <span className="text-xs text-muted-foreground/50">–</span>
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
