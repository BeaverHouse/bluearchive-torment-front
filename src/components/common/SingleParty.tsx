"use client";

import React from "react";
import { getCharacterName } from "@/utils/character";
import StudentImage from "./StudentImage";

interface SinglePartyProps {
  party: number[];
}

/**
 * Single party component
 * @param party Student codes of the party. 0 is empty slot
 */
export function SingleParty({ party }: SinglePartyProps) {
  // If party member is lower than 6, insert zero between the last 1xxxx(1xxxxxxx) and 2xxxx(2xxxxxxx)
  let finalParty = party;

  if (party.length < 6) {
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
    finalParty = [...strikers, ...zeros, ...specials];
  }

  return (
    <div className="grid grid-cols-6 gap-2 sm:gap-4 p-2 rounded border bg-muted/30 justify-items-center">
      {finalParty.map((student, idx) => {
        const key = "student" + idx;
        if (student === 0)
          return <div key={key} className="w-10 h-10 sm:w-12 sm:h-12"></div>;

        const code = Math.floor(student / 1000);

        return (
          <StudentImage
            code={student}
            name={getCharacterName(code)}
            key={key}
          />
        );
      })}
    </div>
  );
}

export default SingleParty;
