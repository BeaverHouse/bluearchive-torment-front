import { CharTableType, PartyTableType } from "@/types/raid";
import { basePartyCounts } from "@/constants/assault";

export function createCharTableData(
  filters: Record<string, Record<string, number>>,
  clearCount: number,
  studentsMap: Record<string, string>,
  filterPrefix?: string
): CharTableType[] {
  return Object.entries(filters)
    .filter(([key]) => (filterPrefix ? key.startsWith(filterPrefix) : true))
    .sort(
      (a, b) =>
        Object.values(b[1]).reduce((sum, cur) => sum + cur, 0) -
        Object.values(a[1]).reduce((sum, cur) => sum + cur, 0)
    )
    .map(([key, value], idx) => ({
      key: (idx + 1).toString(),
      studentId: key,
      name: studentsMap[key],
      percent: Number(
        (
          (Object.values(value).reduce((sum, cur) => sum + cur, 0) /
            (clearCount || 1)) *
          100
        ).toFixed(2)
      ),
    }));
}

export function createPartyCountData(
  partyCounts: Record<string, number[]> | undefined,
  clearCount: number
): PartyTableType[] {
  if (!partyCounts) return [];

  return [
    ...Array.from(new Set([...basePartyCounts, clearCount])).filter(
      (count) => count <= clearCount && `in${count}` in partyCounts
    ),
  ].map((count, index) => {
    const key = `in${count}`;
    const total = (partyCounts[key] || []).reduce((a, b) => a + b, 0);
    return {
      key: `In ${count}-${index}`,
      one: Number((((partyCounts[key]?.[0] || 0) / total) * 100).toFixed(2)),
      two: Number((((partyCounts[key]?.[1] || 0) / total) * 100).toFixed(2)),
      three: Number((((partyCounts[key]?.[2] || 0) / total) * 100).toFixed(2)),
      fourOrMore: Number((((partyCounts[key]?.[3] || 0) / total) * 100).toFixed(2)),
    };
  });
}

export function getHighUsageCharacters(
  filters: Record<string, Record<string, number>> | undefined,
  clearCount: number,
  studentsMap: Record<string, string>
) {
  if (!filters) return [];

  return Object.entries(filters)
    .map(([id, usage]) => ({
      id,
      name: studentsMap[id] || `Character ${id}`,
      totalUsage: Object.values(usage).reduce((a, b) => a + b, 0),
      usageRate:
        (Object.values(usage).reduce((a, b) => a + b, 0) / (clearCount || 1)) * 100,
    }))
    .filter((char) => char.usageRate >= 10)
    .sort((a, b) => b.totalUsage - a.totalUsage);
}
