"use client";

import { useMemo } from "react";
import { TotalAnalysisData } from "@/types/total-analysis";
import { StudentImage } from "@/components/features/student/student-image";
import { useRaids } from "@/hooks/use-raids";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface RaidUsageTableProps {
  data: TotalAnalysisData;
  type: "striker" | "special" | "assist";
  title: string;
  limit?: number;
}

export function RaidUsageTable({
  data,
  type,
  title,
  limit = 5,
}: RaidUsageTableProps) {
  const { raids } = useRaids();

  const processedData = useMemo(() => {
    // 단순 역순 정렬
    const reversedAnalyses = [...data.raidAnalyses].reverse();

    return reversedAnalyses.map((raid) => {
      // raids.json에서 name을 가져와서 축약
      const raidInfo = raids.find((r) => r.id === raid.raidId);
      const fullName = raidInfo?.name || raid.raidId;
      // 총력전/대결전 SXX 제거
      let displayName = fullName.replace(/^(총력전|대결전)\s+S\d+\s+/, "");

      // 대결전: 괄호 앞에서 줄바꿈 (2줄로 분리)
      // "시가지 예로니무스 (경장갑,토먼트)" → { main: "시가지 예로니무스", sub: "(경장갑,토먼트)" }
      const bracketMatch = displayName.match(/^(.+?)\s*(\(.+\))$/);
      const nameParts = bracketMatch
        ? { main: bracketMatch[1], sub: bracketMatch[2] }
        : { main: displayName, sub: null };

      let students;
      if (type === "striker") students = raid.topStrikers;
      else if (type === "special") students = raid.topSpecials;
      else students = raid.topAssists;

      const topItems = Array.from({ length: limit }).map(
        (_, i) => students[i] || null
      );

      return {
        id: raid.raidId,
        name: displayName,
        nameParts,
        students: topItems,
      };
    });
  }, [data, raids, type, limit]);

  return (
    <Card className="h-[400px] sm:h-[500px] flex flex-col max-w-full overflow-hidden">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm sm:text-base">{title}</CardTitle>
      </CardHeader>
      <CardContent className="flex-1 overflow-hidden p-0 px-2 sm:px-4 pb-4 max-w-full">
        <div className="h-full overflow-auto max-w-full">
          <Table>
            <TableHeader className="sticky top-0 z-10">
              <TableRow className="bg-card hover:bg-card">
                <TableHead className="w-[90px] sm:w-[140px] text-[9px] sm:text-xs bg-card pl-1 pr-1">
                  총력전
                </TableHead>
                {Array.from({ length: limit }).map((_, i) => (
                  <TableHead
                    key={i}
                    className="w-[36px] sm:w-[48px] text-center text-[9px] sm:text-xs px-0.5 bg-card"
                  >
                    {i + 1}위
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {processedData.map((row) => (
                <TableRow key={row.id} className="hover:bg-muted/50">
                  <TableCell className="font-medium text-[9px] sm:text-[11px] py-1.5 pr-1 pl-1 w-[90px] sm:w-[140px]">
                    <div className="leading-tight">
                      <div className="truncate">{row.nameParts.main}</div>
                      {row.nameParts.sub && (
                        <div className="text-muted-foreground text-[8px] sm:text-[10px] truncate">
                          {row.nameParts.sub}
                        </div>
                      )}
                    </div>
                  </TableCell>
                  {row.students.map((student, index) => (
                    <TableCell
                      key={index}
                      className="w-[36px] sm:w-[48px] text-center p-0.5 sm:p-1"
                    >
                      <div className="flex flex-col items-center justify-center">
                        {student ? (
                          <>
                            <StudentImage code={student.studentId} size={24} />
                            <span className="text-[8px] sm:text-[9px] text-muted-foreground leading-tight">
                              {student.usageCount.toLocaleString()}
                            </span>
                          </>
                        ) : (
                          <span className="text-muted-foreground text-xs">
                            -
                          </span>
                        )}
                      </div>
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
