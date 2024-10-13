// Used in bluearchive-torment-front

export const legacyTorments = [];

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
    value: "3S9-T",
    label: `대결전 시즌9 실내 그레고리오(관통)`,
  },
  {
    value: "S65",
    label: `시즌65 시가지 호드`,
  },
  {
    value: "3S10-T",
    label: `대결전 시즌10 시가지 예로니무스(신비)`,
  },
  {
    value: "S66",
    label: `시즌66 실내 고즈`,
  },
  {
    value: "3S11-T",
    label: `대결전 시즌11 야외 호버크래프트(폭발)`,
  },
  {
    value: "S67",
    label: `시즌67 야외 비나`,
  },
  {
    value: "3S12-T",
    label: `대결전 시즌12 실내 시로쿠로(관통)`,
  },
  {
    value: "S68",
    label: `시즌68 야외 페로로지라`,
  },
  {
    value: "3S13-T",
    label: `대결전 시즌13 야외 고즈(관통)`,
  },
  {
    value: "S69",
    label: `시즌69 실내 시로쿠로`,
  },
  {
    value: "3S14-T",
    label: `대결전 시즌14 야외 페로로지라(탄력)`,
  },
  {
    value: "S70",
    label: `시즌70 시가지 카이텐`,
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
    1. 시즌70 시가지 카이텐 데이터 추가
    <br />
    2. 시즌64 실내 페로로지라 데이터 삭제
  </div>
);

export const announceUpdate = "20241013";
