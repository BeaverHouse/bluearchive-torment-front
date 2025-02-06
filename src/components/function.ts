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
  youtubeLinkInfos: YoutubeLinkInfo[],
  levelList: string[],
  includeArray: Array<number[]>,
  excludeArray: Array<number>,
  assist: Array<number> | undefined,
  partyCountRange: number[],
  hardExclude: boolean,
  allowDuplicate: boolean,
  youtubeOnly: boolean
): PartyData[] => {
  const rawPartys = data.parties;
  return rawPartys.filter((party) => {
    const students = Object.values(party.PARTY_DATA).flat();
    const codes = students.map((num) => Math.floor(num / 1000));
    const pureStudents = students.filter((num) => num % 10 !== 1);
    const partyAssist = students.find((num) => num % 10 === 1) || null;
    const youtubeUserIds = youtubeLinkInfos.map((info) => info.userId);

    return (
      levelList.includes(party.LEVEL) &&
      includeAll(pureStudents, includeArray) &&
      // 포함 캐릭터에 대해서는 본인 캐릭터 목록에 모두 있어야 함
      !excludeArray.some((exclude) => (hardExclude ? students : pureStudents).some((num) => isInFilter([exclude], num))) &&
      // 제외 캐릭터에 대해서는 아예 없어야 함 (조력자까지 제외하냐 여부)
      (!assist || partyAssist === getNumber(assist) * 10 + 1) &&
      Object.keys(party.PARTY_DATA).length >= partyCountRange[0] &&
      Object.keys(party.PARTY_DATA).length <= partyCountRange[1] &&
      (allowDuplicate || Array.from(new Set(codes)).length === codes.length) &&
      (youtubeOnly ? youtubeUserIds.includes(party.USER_ID) : !youtubeOnly)
    );
  });
};

const getNumber = (arr: number[]) => arr[0] * 100 + arr[1];

const isInFilter = (arr: number[], num: number) => {
  if (arr.length === 2) {
    return arr[0] * 100 + arr[1] === Math.floor(num / 10);
  } else if (arr.length === 1) {
    return arr[0] === Math.floor(num / 1000);
  } else {
    return false;
  }
};

const includeAll = (students: number[], includeArray: Array<number[]>) => {
  const sortedIncludeArray = [...includeArray].sort((a, b) => a[0] - b[0]);
  let lastChecked = -1;
  for (let i = 0; i < sortedIncludeArray.length; i++) {
    if (students.some((num) => isInFilter(sortedIncludeArray[i], num))) {
      lastChecked = sortedIncludeArray[i][0];
      continue;
    } else if (lastChecked === sortedIncludeArray[i][0]) {
      // 다른 성급의 캐릭터가 있으므로 넘어갑니다.
      continue;
    } else if (i < sortedIncludeArray.length - 1 && sortedIncludeArray[i][0] === sortedIncludeArray[i + 1][0]) {
      // 다른 성급의 캐릭터가 남았으므로 넘어갑니다.
      continue;
    } else {
      return false;
    }
  }
  return true;
};
