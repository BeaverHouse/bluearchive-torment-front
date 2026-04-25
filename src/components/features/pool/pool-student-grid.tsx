"use client";

import React, { useMemo } from "react";
import PoolStudentTile from "./pool-student-tile";
import useStudentPoolStore from "@/store/useStudentPoolStore";
import { useStudentMaps } from "@/hooks/use-student-maps";
import { matchesStudentSearch } from "@/utils/search";
import type { GradeKey } from "@/types/pool";

interface PoolStudentGridProps {
  searchQuery: string;
}

function sortByName(
  a: { id: number; name: string },
  b: { id: number; name: string }
) {
  return a.name.localeCompare(b.name, "ko");
}

export default function PoolStudentGrid({ searchQuery }: PoolStudentGridProps) {
  const { studentsMap, studentSearchMap, isLoaded } = useStudentMaps();
  const pool = useStudentPoolStore((state) => state.pool);
  const addStudent = useStudentPoolStore((state) => state.addStudent);
  const removeStudent = useStudentPoolStore((state) => state.removeStudent);
  const setStudentGrade = useStudentPoolStore((state) => state.setStudentGrade);

  const { strikers, specials } = useMemo(() => {
    const strikers: { id: number; name: string }[] = [];
    const specials: { id: number; name: string }[] = [];
    for (const [idStr, name] of Object.entries(studentsMap)) {
      const id = Number(idStr);
      if (!Number.isFinite(id)) continue;
      const entry = { id, name };
      if (id >= 10000 && id < 20000) strikers.push(entry);
      else if (id >= 20000 && id < 30000) specials.push(entry);
    }
    strikers.sort(sortByName);
    specials.sort(sortByName);
    return { strikers, specials };
  }, [studentsMap]);

  const matchesQuery = (id: number) => {
    if (!searchQuery.trim()) return true;
    return matchesStudentSearch(String(id), searchQuery, studentSearchMap);
  };

  const filteredStrikers = strikers.filter((s) => matchesQuery(s.id));
  const filteredSpecials = specials.filter((s) => matchesQuery(s.id));

  const renderTile = ({ id, name }: { id: number; name: string }) => {
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

  if (!isLoaded) {
    return (
      <div className="text-center text-muted-foreground py-8">
        학생 데이터를 불러오는 중...
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <section>
        <h3 className="text-sm font-semibold mb-2 text-muted-foreground">
          스트라이커 ({filteredStrikers.length}/{strikers.length})
        </h3>
        {filteredStrikers.length > 0 ? (
          <div className="grid gap-2 grid-cols-[repeat(auto-fill,minmax(110px,1fr))]">
            {filteredStrikers.map(renderTile)}
          </div>
        ) : (
          <div className="text-xs text-muted-foreground">
            검색 결과가 없습니다.
          </div>
        )}
      </section>
      <section>
        <h3 className="text-sm font-semibold mb-2 text-muted-foreground">
          스페셜 ({filteredSpecials.length}/{specials.length})
        </h3>
        {filteredSpecials.length > 0 ? (
          <div className="grid gap-2 grid-cols-[repeat(auto-fill,minmax(110px,1fr))]">
            {filteredSpecials.map(renderTile)}
          </div>
        ) : (
          <div className="text-xs text-muted-foreground">
            검색 결과가 없습니다.
          </div>
        )}
      </section>
    </div>
  );
}
