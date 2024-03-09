// Used in bluearchive-torment-front

export const tab_items = [
  {
    value: "S57",
    label: `시즌57 야외 호버크래프트`,
  },
  {
    value: "3S2-T",
    label: `대결전 시즌2 실내 시로쿠로`,
  },
  {
    value: "S58",
    label: `시즌58 시가지 비나`,
  },
  {
    value: "3S3-T",
    label: `대결전 시즌3 야외 카이텐(신비)`,
  },
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
];

export const defaultJson = {
  season: tab_items[0].value,
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
    1. 시즌63 실내 헤세드 반영
    <br />
    최종랭킹 상위 1500명만 표시했습니다.
    <br />
    <b>토먼트 클리어 20000명 +</b>
  </div>
);

export const announceUpdate = "20240309";
