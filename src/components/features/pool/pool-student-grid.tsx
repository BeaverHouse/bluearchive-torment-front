"use client";

import React, { useMemo } from "react";
import PoolStudentTile from "./pool-student-tile";
import useStudentPoolStore from "@/store/useStudentPoolStore";
import { useStudentMaps } from "@/hooks/use-student-maps";
import { matchesStudentSearch } from "@/utils/search";
import type { GradeKey } from "@/types/pool";

interface PoolStudentGridProps {
  searchQuery: string;
  highUsageStudentIds?: ReadonlySet<number>;
  highUsageLunaticStudentIds?: ReadonlySet<number>;
}

interface StudentEntry {
  id: number;
  name: string;
}

function sortByName(a: StudentEntry, b: StudentEntry) {
  return a.name.localeCompare(b.name, "ko");
}

export default function PoolStudentGrid({
  searchQuery,
  highUsageStudentIds,
  highUsageLunaticStudentIds,
}: PoolStudentGridProps) {
  const { studentsMap, studentSearchMap, isLoaded } = useStudentMaps();
  const pool = useStudentPoolStore((state) => state.pool);
  const addStudent = useStudentPoolStore((state) => state.addStudent);
  const removeStudent = useStudentPoolStore((state) => state.removeStudent);
  const setStudentGrade = useStudentPoolStore((state) => state.setStudentGrade);

  const { highOverall, highLunaticOnly, strikers, specials } = useMemo(() => {
    const allStrikers: StudentEntry[] = [];
    const allSpecials: StudentEntry[] = [];
    for (const [idStr, name] of Object.entries(studentsMap)) {
      const id = Number(idStr);
      if (!Number.isFinite(id)) continue;
      const entry = { id, name };
      if (id >= 10000 && id < 20000) allStrikers.push(entry);
      else if (id >= 20000 && id < 30000) allSpecials.push(entry);
    }

    const all = [...allStrikers, ...allSpecials];
    const isOverall = (id: number) =>
      !!highUsageStudentIds && highUsageStudentIds.has(id);
    const isLunatic = (id: number) =>
      !!highUsageLunaticStudentIds && highUsageLunaticStudentIds.has(id);

    const overall = all.filter((s) => isOverall(s.id)).sort(sortByName);
    const lunaticOnly = all
      .filter((s) => !isOverall(s.id) && isLunatic(s.id))
      .sort(sortByName);
    const strikersRest = allStrikers
      .filter((s) => !isOverall(s.id) && !isLunatic(s.id))
      .sort(sortByName);
    const specialsRest = allSpecials
      .filter((s) => !isOverall(s.id) && !isLunatic(s.id))
      .sort(sortByName);

    return {
      highOverall: overall,
      highLunaticOnly: lunaticOnly,
      strikers: strikersRest,
      specials: specialsRest,
    };
  }, [studentsMap, highUsageStudentIds, highUsageLunaticStudentIds]);

  const matchesQuery = (id: number) => {
    if (!searchQuery.trim()) return true;
    return matchesStudentSearch(String(id), searchQuery, studentSearchMap);
  };

  const filteredOverall = highOverall.filter((s) => matchesQuery(s.id));
  const filteredLunatic = highLunaticOnly.filter((s) => matchesQuery(s.id));
  const filteredStrikers = strikers.filter((s) => matchesQuery(s.id));
  const filteredSpecials = specials.filter((s) => matchesQuery(s.id));

  const renderTile = ({ id, name }: StudentEntry) => {
    const grade = pool.students[String(id)];
    return (
      <PoolStudentTile
        key={id}
        code={id}
        name={name}
        grade={grade}
        onToggle={() => addStudent(id)}
        onGradeChange={(next: GradeKey) => setStudentGrade(id, next)}
        onRemove={() => removeStudent(id)}
      />
    );
  };

  const isSearching = searchQuery.trim() !== "";

  const renderSection = (
    title: string,
    list: StudentEntry[],
    totalCount: number
  ) => (
    <section>
      <h3 className="text-sm font-semibold mb-2 text-muted-foreground">
        {title} ({isSearching ? `${list.length}/${totalCount}` : totalCount})
      </h3>
      {list.length > 0 ? (
        <div className="grid gap-2 grid-cols-[repeat(auto-fill,minmax(110px,1fr))]">
          {list.map(renderTile)}
        </div>
      ) : (
        <div className="text-xs text-muted-foreground">
          검색 결과가 없습니다.
        </div>
      )}
    </section>
  );

  if (!isLoaded) {
    return (
      <div className="text-center text-muted-foreground py-8">
        학생 데이터를 불러오는 중...
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {highOverall.length > 0 &&
        renderSection(
          "전체 사용률 10% 이상",
          filteredOverall,
          highOverall.length
        )}
      {highLunaticOnly.length > 0 &&
        renderSection(
          "루나틱 사용률 10% 이상",
          filteredLunatic,
          highLunaticOnly.length
        )}
      {renderSection("스트라이커", filteredStrikers, strikers.length)}
      {renderSection("스페셜", filteredSpecials, specials.length)}
    </div>
  );
}
