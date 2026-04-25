"use client";

import React from "react";
import StudentImage from "../student/student-image";

interface SinglePartyProps {
  party: number[];
  /** 이 sub-party가 조합 매칭된 경우 강조 표시 (배경 틴트만) */
  highlighted?: boolean;
}

/**
 * Single party component
 * @param party Student codes of the party. 0 is empty slot
 */
export function SingleParty({ party, highlighted = false }: SinglePartyProps) {
  // If party member is lower than 6, insert zero between the last 1xxxx(1xxxxxxx) and 2xxxx(2xxxxxxx)
  const finalParty = React.useMemo(() => {
    if (party.length >= 6) return party;

    const strikers = party.filter((code) => {
      if (code === 0) return false;
      const firstDigit = Math.floor(
        code / Math.pow(10, Math.floor(Math.log10(code)))
      );
      return firstDigit === 1;
    });
    const specials = party.filter((code) => {
      if (code === 0) return false;
      const firstDigit = Math.floor(
        code / Math.pow(10, Math.floor(Math.log10(code)))
      );
      return firstDigit === 2;
    });

    const emptySlots = 6 - party.length;
    const zeros = Array(emptySlots).fill(0);
    return [...strikers, ...zeros, ...specials];
  }, [party]);

  const containerCls = highlighted
    ? "grid grid-cols-6 gap-2 p-2 mb-1 rounded border bg-sky-500/10"
    : "grid grid-cols-6 gap-2 p-2 mb-1 rounded border bg-muted/20";

  return (
    <div className={containerCls}>
      {finalParty.map((student, idx) => {
        const key = "student" + idx;
        if (student === 0)
          return <div key={key} className="w-10 h-10 sm:w-12 sm:h-12"></div>;

        return <StudentImage code={student} key={key} />;
      })}
    </div>
  );
}

export default React.memo(SingleParty);
