import { categoryMap } from "@/constants/assault";
import { RaidData, PartyData, FilterOption } from "@/types/raid";
import type { PoolFilterContext } from "@/types/pool";
import { partyAgainstPool } from "@/lib/pool-filters";
import { parseCharacterInfo } from "@/utils/character";

export const getFilters = (
  rawData: Record<string, Record<string, number>>,
  studentsMap: Record<string, string>
): FilterOption[] => {
  return Object.keys(rawData).map((key) => ({
    value: Number(key),
    label: studentsMap[key],
    children: Object.entries(rawData[key])
      .map(([gradeKey, val]) => {
        if (val > 0) {
          const value = parseInt(gradeKey);

          return {
            value,
            label: `${studentsMap[key]} ${categoryMap[gradeKey]} (${val})`,
          };
        }
        return null;
      })
      .filter((obj) => obj != null),
  }));
};

export const filteredPartys = (
  data: RaidData,
  scoreRange: [number, number] | undefined,
  includeArray: Array<number[]>,
  excludeArray: Array<number>,
  assist: Array<number> | undefined,
  partyCountRange: number[],
  hardExclude: boolean,
  allowDuplicate: boolean,
  youtubeOnly: boolean,
  poolFilter?: PoolFilterContext
): PartyData[] => {
  const rawPartys = data.parties;
  const usePool =
    !!poolFilter && Object.keys(poolFilter.pool.students).length > 0;

  return rawPartys.filter((party) => {
    const students = party.partyData.flat();
    const codes = students.map((num) => Math.floor(num / 1000));
    const pureStudents = students.filter((num) => num % 10 !== 1);
    const partyAssist = students.find((num) => num % 10 === 1) || null;

    // 공통 필터 (풀 필터와 관계없이 항상 적용)
    const commonPass =
      (!scoreRange ||
        (party.score >= scoreRange[0] && party.score <= scoreRange[1])) &&
      (!assist || isAssistMatch(assist, partyAssist)) &&
      party.partyData.length >= partyCountRange[0] &&
      party.partyData.length <= partyCountRange[1] &&
      (allowDuplicate || Array.from(new Set(codes)).length === codes.length) &&
      (!youtubeOnly || !!party.video_id);

    if (!commonPass) return false;

    if (usePool) {
      // 풀 필터 활성: include/exclude/hardExclude는 무시하고 풀 체크로 대체
      return partyAgainstPool(students, poolFilter);
    }

    // 기존 include/exclude/hardExclude 경로
    return (
      includeAll(pureStudents, includeArray) &&
      !excludeArray.some((exclude) =>
        (hardExclude ? students : pureStudents).some((num) =>
          isInFilter([exclude], num)
        )
      )
    );
  });
};

const getNumber = (arr: number[]) => arr[0] * 100 + arr[1];

const isAssistMatch = (assist: number[], partyAssist: number | null): boolean => {
  if (!partyAssist) return false;
  
  if (assist.length === 1) {
    // 부모 항목 선택: 캐릭터 코드만 비교 (성급 무관)
    // partyAssist는 10001xx1 형태이므로, 1000으로 나눈 몫이 캐릭터 코드
    return Math.floor(partyAssist / 1000) === assist[0];
  } else if (assist.length === 2) {
    // 자식 항목 선택: 정확한 성급까지 일치
    return partyAssist === getNumber(assist) * 10 + 1;
  }
  
  return false;
};

const isInFilter = (arr: number[], num: number) => {
  const info = parseCharacterInfo(num);
  if (!info) return false;
  const { code: charId, star, weapon } = info;

  if (arr.length === 2) {
    // 부모-자식 선택: [charId, gradeKey]
    const [selectedCharId, gradeKey] = arr;
    if (charId !== selectedCharId) return false;
    
    // gradeKey는 두 자리 숫자: 첫 번째 자리는 star, 두 번째 자리는 weapon
    const expectedStar = Math.floor(gradeKey / 10);
    const expectedWeapon = gradeKey % 10;
    
    return star === expectedStar && weapon === expectedWeapon;
  } else if (arr.length === 1) {
    // 부모만 선택: charId만 확인
    return arr[0] === charId;
  } else {
    return false;
  }
};

const includeAll = (students: number[], includeArray: Array<number[]>) => {
  const sortedIncludeArray = [...includeArray].sort((a, b) => a[0] - b[0]);
  let lastChecked = -1;
  
  for (let i = 0; i < sortedIncludeArray.length; i++) {
    const found = students.some((num) => isInFilter(sortedIncludeArray[i], num));
    
    if (found) {
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