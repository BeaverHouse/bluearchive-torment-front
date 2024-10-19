import { categoryLabels } from "./constants";

export const getFilters = (
  rawData: Record<string, number[]>,
  studentsMap: Record<string, string>
): Option[] => {
  return Object.keys(rawData).map((key) => ({
    value: Number(key),
    label: studentsMap[key],
    children: rawData[key]
      .map((val, idx) =>
        val > 0
          ? {
              value: idx > 5 ? 50 + (idx - 5) : idx * 10,
              label: `${studentsMap[key]} ${categoryLabels[idx]} (${val})`,
            }
          : null
      )
      .filter((obj) => obj != null),
  }));
};

export const filteredPartys = (
  data: RaidData,
  includeArray: Array<number[]>,
  excludeArray: Array<number>,
  assist: Array<number> | undefined,
  partyCountRange: number[],
  hardExclude: boolean,
  allowDuplicate: boolean
): PartyData[] => {
  const rawPartys = data.parties;
  return rawPartys.filter((party) => {
    const students = Object.values(party.PARTY_DATA).flat();
    const partyFiltered = students.map((num) => Math.floor(num / 10));
    const codeFiltered = students.map((num) => Math.floor(num / 1000));
    const partyAssist = students.find((num) => num % 10 === 1) || null;

    return (
      includeArray.every((arr) => partyFiltered.includes(getNumber(arr))) &&
      !excludeArray.some((num) => codeFiltered.includes(num)) &&
      (!assist || partyAssist === getNumber(assist)*10+1) &&
      Object.keys(party.PARTY_DATA).length >= partyCountRange[0] &&
      Object.keys(party.PARTY_DATA).length <= partyCountRange[1] &&
      !(
        hardExclude &&
        (!partyAssist || excludeArray.includes(Math.floor(partyAssist / 100)))
      ) && // 옵션 비활성화 or 제외할 캐릭터에 조건자가 들어가야 false
      (allowDuplicate ||
        Array.from(new Set(partyFiltered)).length === partyFiltered.length)
    );
  });
};

const getNumber = (arr: number[]) => arr[0] * 100 + arr[1];
