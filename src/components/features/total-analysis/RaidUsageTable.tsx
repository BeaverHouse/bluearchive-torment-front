"use client";

import { useMemo } from "react";
import { TotalAnalysisData } from "@/types/total-analysis";
import { StudentImage } from "@/components/features/student/student-image";
import raidsData from "../../../../data/raids.json";
import { RaidInfo } from "@/types/raid";
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
  const raids = raidsData as RaidInfo[];

  const processedData = useMemo(() => {
    const sortedAnalyses = [...data.raidAnalyses].sort(() => {
      // Simple sort by raidId might not be enough if IDs are mixed (3S, S80 etc)
      // But for now let's assume raw order or just reverse if needed.
      // The JSON seems reverse chron? No, S80 (old) -> 3S25 (old?)
      // Let's assume input order is correct or use logic if needed.
      return 0;
    });

    return sortedAnalyses.map((raid) => {
      // raids.json에서 name을 가져와서 축약
      // "총력전 S80 시가지 호드" -> "시가지 호드"
      // "대결전 S25 시가지 비나 (경장갑,인세인)" -> "시가지 비나 (경장갑,인세인)"
      const raidInfo = raids.find((r) => r.id === raid.raidId);
      const fullName = raidInfo?.name || raid.raidId;
      // 총력전/대결전 SXX 제거
      const displayName = fullName.replace(/^(총력전|대결전)\s+S\d+\s+/, "");

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
        students: topItems,
      };
    });
  }, [data, raids, type, limit]);

  return (
    <Card className="h-[500px] flex flex-col">
      <CardHeader className="pb-3">
        <CardTitle className="text-base">{title}</CardTitle>
      </CardHeader>
      <CardContent className="flex-1 overflow-hidden p-0 px-4 pb-4">
        <div className="h-full overflow-y-auto">
          <Table>
            <TableHeader className="sticky top-0 z-10">
              <TableRow className="bg-card hover:bg-card">
                <TableHead className="w-[180px] min-w-[180px] text-xs bg-card">
                  총력전
                </TableHead>
                {Array.from({ length: limit }).map((_, i) => (
                  <TableHead
                    key={i}
                    className="w-[56px] min-w-[56px] text-center text-xs px-1 bg-card"
                  >
                    {i + 1}위
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {processedData.map((row) => (
                <TableRow key={row.id} className="hover:bg-muted/50">
                  <TableCell className="font-medium text-[11px] py-2 pr-2 w-[180px] min-w-[180px]">
                    {row.name}
                  </TableCell>
                  {row.students.map((student, index) => (
                    <TableCell
                      key={index}
                      className="w-[56px] min-w-[56px] text-center p-1"
                    >
                      <div className="flex flex-col items-center justify-center">
                        {student ? (
                          <>
                            <StudentImage code={student.studentId} size={36} />
                            <span className="text-[9px] text-muted-foreground leading-tight">
                              {student.usageCount.toLocaleString()}
                            </span>
                          </>
                        ) : (
                          <span className="text-muted-foreground text-xs">-</span>
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
