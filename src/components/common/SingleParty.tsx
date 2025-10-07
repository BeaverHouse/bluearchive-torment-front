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
  const finalParty = party;

  // If party member is lower than 6, insert zero between the last 1xxxx(1xxxxxxx) and 2xxxx(2xxxxxxx)

  return (
    <div className="grid grid-cols-6 gap-2 sm:gap-4 p-2 rounded border bg-muted/30 justify-items-center">
      {party.map((student, idx) => {
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
