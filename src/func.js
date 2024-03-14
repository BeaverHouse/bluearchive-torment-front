import { weaponLabels } from "./constant";

export const filteredPartys = (
  data,
  includeArray,
  excludeArray,
  assist,
  partyCountRange,
  under4Array,
  under3Array,
  hardExclude,
  allowDuplicate
) => {
  const rawPartys = data.partys;
  return rawPartys.filter(
    (party) =>
      arrayIncludes(party.characters, includeArray) &&
      !arrayDuplicates(party.characters, excludeArray) &&
      (!assist || party.assist === assist) &&
      party.party_count >= partyCountRange[0] &&
      party.party_count <= partyCountRange[1] &&
      arrayIncludes(party.under3 || [], under3Array) &&
      arrayIncludes(party.under4 || [], under4Array) &&
      !(hardExclude && excludeArray.includes(party.assist)) && // 조력자 제외 체크 + 제외할 캐릭터에 조력자가 들어가야 false
      (allowDuplicate || !party.characters.includes(party.assist)) // 중복 허용이면 무조건 패스, 아니면 캐릭풀과 조력자가 겹치면 안됨
  );
};

export const filteredPartysV2 = (
  data,
  includeArray,
  excludeArray,
  assist,
  partyCountRange,
  hardExclude,
  allowDuplicate
) => {
  const rawPartys = data.partys;
  return rawPartys.filter(
    (party) =>
      includeArray.every((char) =>
        party.search_keys.some((c) => c.startsWith(getSearchKey(char)))
      ) &&
      !arrayDuplicates(
        party.search_keys.map((char) => char.split("_")[0]),
        excludeArray
      ) &&
      (!assist || party.assist === assist.join("_")) &&
      party.party_count >= partyCountRange[0] &&
      party.party_count <= partyCountRange[1] &&
      !(
        hardExclude &&
        excludeArray.includes(party.assist ? party.assist.split("_")[0] : null)
      ) && // 조력자 제외 체크 + 제외할 캐릭터에 조력자가 들어가야 false
      (allowDuplicate ||
        !party.search_keys
          .map((char) => char.split("_")[0])
          .includes(party.assist ? party.assist.split("_")[0] : null)) // 중복 허용이면 무조건 패스,아니면 캐릭풀과 조력자가 겹치면 안됨;
  );
};

export const makeCascaderOptions = (filters) => {
  return Object.keys(filters).map((key) => ({
    value: key,
    label: `${key} (${filters[key].reduce((a, b) => a + b, 0)})`,
    children: filters[key]
      .map((val, idx) =>
        val > 0
          ? {
              label: `${key} ${weaponLabels[idx]} (${val})`,
              value: idx,
            }
          : null
      )
      .filter((obj) => obj != null),
  }));
};

const arrayIncludes = (array, subarray) =>
  subarray.every((element) => array.includes(element));

const arrayDuplicates = (a, b) => a.some((item) => b.includes(item));

const getSearchKey = (char) =>
  char.length > 1 ? char.join("_") : char[0] + "_";
