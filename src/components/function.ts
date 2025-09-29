import { categoryLabels } from "./constants";

interface Option {
  value: number;
  label: string;
  children?: Option[];
}

interface RaidData {
  parties: PartyData[];
}

interface PartyData {
  rank: number;
  score: number;
  partyData: number[][];
}

interface YoutubeLinkInfo {
  userId: number;
  youtubeUrl: string;
  score: number;
}

export const getFilters = (
  rawData: Record<string, Record<string, number>>,
  studentsMap: Record<string, string>
): Option[] => {
  return Object.keys(rawData).map((key) => ({
    value: Number(key),
    label: studentsMap[key],
    children: Object.entries(rawData[key])
      .map(([levelKey, val]) => {
        if (val > 0) {
          const starLevel = parseInt(levelKey[0]);
          const weaponLevel = parseInt(levelKey[1]);
          // levelKey를 그대로 숫자로 사용 (예: "40" -> 40)
          const value = parseInt(levelKey);
          const categoryIdx = starLevel * 9 + weaponLevel;
          
          // 4성 이하이고 무기레벨이 0일 때는 무기0 표시 안함
          const weaponText = (starLevel <= 4 && weaponLevel === 0) ? "" : ` 무기${weaponLevel}`;
          const starText = `${starLevel}★${weaponText}`;
          
          return {
            value,
            label: `${studentsMap[key]} ${categoryLabels[categoryIdx] || starText} (${val})`,
          };
        }
        return null;
      })
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
    const students = party.partyData.flat();
    const codes = students.map((num) => Math.floor(num / 1000));
    const pureStudents = students.filter((num) => num % 10 !== 1);
    const partyAssist = students.find((num) => num % 10 === 1) || null;
    
    // v3에서는 LEVEL이 없으므로 점수로 난이도 판단
    const level = getScoreLevel(party.score);

    return (
      levelList.includes(level) &&
      includeAll(pureStudents, includeArray) &&
      // 포함 캐릭터에 대해서는 본인 캐릭터 목록에 모두 있어야 함
      !excludeArray.some((exclude) => (hardExclude ? students : pureStudents).some((num) => isInFilter([exclude], num))) &&
      // 제외 캐릭터에 대해서는 아예 없어야 함 (조력자까지 제외하냐 여부)
      (!assist || isAssistMatch(assist, partyAssist)) &&
      party.partyData.length >= partyCountRange[0] &&
      party.partyData.length <= partyCountRange[1] &&
      (allowDuplicate || Array.from(new Set(codes)).length === codes.length) &&
      (!youtubeOnly || youtubeLinkInfos.some(link => link.score == party.score))
    );
  });
};

const getScoreLevel = (score: number): string => {
  // 점수 기반으로 난이도 판단 (임시 로직, 실제 기준에 맞게 조정 필요)
  if (score >= 50000000) return "L"; // Lunatic
  if (score >= 30000000) return "T"; // Torment
  return "I"; // Insane
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
  const charId = Math.floor(num / 1000);
  const star = Math.floor((num % 1000) / 100);
  const weapon = Math.floor((num % 100) / 10);
  
  if (arr.length === 2) {
    // 부모-자식 선택: [charId, levelKey]
    const [selectedCharId, levelKey] = arr;
    if (charId !== selectedCharId) return false;
    
    // levelKey는 두 자리 숫자: 첫 번째 자리는 star, 두 번째 자리는 weapon
    const expectedStar = Math.floor(levelKey / 10);
    const expectedWeapon = levelKey % 10;
    
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