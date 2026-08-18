"use client";

import React from "react";
import StudentImage from "../student/student-image";

interface SinglePartyProps {
  party: number[];
  skillOrders?: number[];
  /** 이 sub-party가 조합 매칭된 경우 강조 표시 (배경 틴트만) */
  highlighted?: boolean;
  showModeBadge?: boolean;
  missingCodes?: ReadonlySet<number>;
}

/**
 * Single party component
 * @param party Student codes of the party. 0 is empty slot
 */
export function SingleParty({
  party,
  skillOrders,
  highlighted = false,
  showModeBadge,
  missingCodes,
}: SinglePartyProps) {
  // If party member is lower than 6, insert zero between the last 1xxxx(1xxxxxxx) and 2xxxx(2xxxxxxx)
  const finalParty = React.useMemo(() => {
    const slots = party.map((student, index) => ({
      student,
      skillOrder: skillOrders?.[index],
    }));
    if (slots.length >= 6) return slots;

    const strikers = slots.filter(({ student }) => {
      if (student === 0) return false;
      const firstDigit = Math.floor(
        student / Math.pow(10, Math.floor(Math.log10(student)))
      );
      return firstDigit === 1;
    });
    const specials = slots.filter(({ student }) => {
      if (student === 0) return false;
      const firstDigit = Math.floor(
        student / Math.pow(10, Math.floor(Math.log10(student)))
      );
      return firstDigit === 2;
    });

    const emptySlots = 6 - slots.length;
    const zeros = Array.from({ length: emptySlots }, () => ({
      student: 0,
      skillOrder: undefined,
    }));
    return [...strikers, ...zeros, ...specials];
  }, [party, skillOrders]);

  const containerCls = highlighted
    ? "grid grid-cols-6 gap-2 p-2 mb-1 rounded border bg-sky-500/10"
    : "grid grid-cols-6 gap-2 p-2 mb-1 rounded border bg-muted/20";

  return (
    <div className={containerCls}>
      {finalParty.map(({ student, skillOrder }, idx) => {
        const key = "student" + idx;
        if (student === 0)
          return <div key={key} className="w-10 h-10 sm:w-12 sm:h-12"></div>;

        const studentCode = student < 100000 ? student : Math.floor(student / 1000);
        const isMissing = missingCodes?.has(studentCode) ?? false;
        return (
          <StudentImage
            code={student}
            key={key}
            showModeBadge={showModeBadge}
            missing={isMissing}
            skillOrder={skillOrder}
          />
        );
      })}
    </div>
  );
}

export default React.memo(SingleParty);
