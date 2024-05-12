// Used in bluearchive-torment-front

export const legacyTorments = [
  "S59",
  "S60",
  "S61",
  "S62",
  "3S3-T",
  "3S4-T",
  "3S5-T",
  "3S6-T",
  "3S7-T",
];

export const weaponLabels = [
  "전5",
  "전4",
  "전3",
  "전2",
  "전1",
  "4성",
  "3성",
  "2성",
  "1성",
];

export const tabItems = [
  {
    value: "S59",
    label: `시즌59 야외 헤세드`,
  },
  {
    value: "3S4-T",
    label: `대결전 시즌4 시가지 호드(관통)`,
  },
  {
    value: "S60",
    label: `시즌60 시가지 쿠로카게`,
  },
  {
    value: "3S5-T",
    label: `대결전 시즌5 야외 고즈(관통)`,
  },
  {
    value: "S61",
    label: `시즌61 야외 호버크래프트`,
  },
  {
    value: "3S6-T",
    label: `대결전 시즌6 시가지 시로쿠로(폭발)`,
  },
  {
    value: "S62",
    label: `시즌62 실내 예로니무스`,
  },
  {
    value: "3S7-T",
    label: `대결전 시즌7 야외 카이텐(폭발)`,
  },
  {
    value: "S63",
    label: `시즌63 실내 헤세드`,
  },
  {
    value: "3S8-T",
    label: `대결전 시즌8 시가지 비나(신비)`,
  },
  {
    value: "S64",
    label: `시즌64 실내 페로로지라`,
  },
  {
    value: "3S9-T",
    label: `대결전 시즌9 실내 그레고리오(관통)`,
  },
  {
    value: "S65",
    label: `시즌65 시가지 호드`,
  },
];

export const defaultJson = {
  season: tabItems[0].value,
  include: [],
  exclude: [],
  assist: undefined,
  under3: [],
  under4: [],
  hardexclude: false,
  allowduplicate: true,
};

export const announceHTML = (
  <div>
    1. 총력전 시즌65 시가지 호드 데이터 추가
    <br />
    2. 대결전 시즌3 야외 카이텐(신비) 데이터 삭제
  </div>
);

export const announceUpdate = "20240512";
