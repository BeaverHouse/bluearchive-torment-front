"use client";

import Image from "next/image";
import { SkillOrder } from "@/types/video";
import { getCharacterName, parseCharacterInfo } from "@/utils/character";

interface SkillOrderTableProps {
  skillOrders: SkillOrder[];
  partyData: number[][];
  studentsMap: Record<string, string>;
}

export function SkillOrderTable({
  skillOrders,
  partyData,
  studentsMap,
}: SkillOrderTableProps) {
  if (!skillOrders || skillOrders.length === 0) {
    return null;
  }

  return (
    <div
      className="bg-card border rounded-lg p-4"
      style={{ width: "0", minWidth: "100%" }}
    >
      <h4 className="text-lg font-semibold mb-4">스킬 순서</h4>
      <div className="overflow-x-auto">
        <table
          className="border-collapse"
          style={{ width: "max-content", margin: "0 auto" }}
        >
          <thead>
            <tr className="border-b">
              <th className="text-left py-2 px-3 font-medium text-sm whitespace-nowrap">
                순서
              </th>
              <th className="text-left py-2 px-3 font-medium text-sm whitespace-nowrap">
                파티
              </th>
              <th className="text-left py-2 px-3 font-medium text-sm whitespace-nowrap">
                캐릭터
              </th>
              <th className="text-left py-2 px-3 font-medium text-sm whitespace-nowrap">
                코스트
              </th>
              <th className="text-left py-2 px-3 font-medium text-sm whitespace-nowrap">
                남은 시간
              </th>
              <th className="text-left py-2 px-3 font-medium text-sm whitespace-nowrap">
                설명
              </th>
            </tr>
          </thead>
          <tbody>
            {skillOrders.map((skill, index) => {
              const party = partyData[skill.partyNumber - 1];
              let characterName = "알 수 없음";
              let characterCode = 0;

              if (party) {
                const characterIndex =
                  skill.type === "striker" ? skill.order - 1 : skill.order - 1 + 4;
                const charValue = party[characterIndex];
                if (charValue && charValue > 0) {
                  const { code } = parseCharacterInfo(charValue);
                  characterCode = code;
                  characterName = getCharacterName(characterCode, studentsMap);
                }
              }

              return (
                <tr key={index} className="border-b hover:bg-muted/50">
                  <td className="py-2 px-3 text-sm font-medium whitespace-nowrap">
                    #{index + 1}
                  </td>
                  <td className="py-2 px-3 text-sm whitespace-nowrap">
                    파티 {skill.partyNumber}
                  </td>
                  <td className="py-2 px-3 text-sm">
                    <div className="flex items-center gap-2 min-w-0">
                      {characterCode > 0 && (
                        <Image
                          src={`${process.env.NEXT_PUBLIC_CDN_URL || ""}/batorment/character/${characterCode}.webp`}
                          alt={characterName}
                          width={24}
                          height={24}
                          className="object-cover rounded flex-shrink-0"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src = "/empty.webp";
                          }}
                        />
                      )}
                      <span className="truncate">{characterName}</span>
                    </div>
                  </td>
                  <td className="py-2 px-3 text-sm whitespace-nowrap">
                    {skill.cost / 10}
                  </td>
                  <td className="py-2 px-3 text-sm font-mono whitespace-nowrap">
                    {skill.remainingTime}
                  </td>
                  <td className="py-2 px-3 text-sm text-muted-foreground">
                    <div className="max-w-[200px] truncate">
                      {skill.description || "-"}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
