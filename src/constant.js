// Used in bluearchive-torment-front

export const tab_items = [
  {
    value: "S55",
    label: `시즌55 실내 그레고리오`,
  },
  {
    value: "S56",
    label: `시즌56 야외 고즈`,
  },
  {
    value: "B1",
    label: `대결전 베타1 시가지 비나`,
  },
  {
    value: "3S1-T",
    label: `대결전 시즌1 야외 페로로지라(토먼트)`,
  },
  {
    value: "3S1-I",
    label: `대결전 시즌1 야외 페로로지라(관통 인세인)`,
  },
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
    1. 대결전 시즌5 야외 고즈(관통) 반영
    <br />
    최종랭킹 상위 1500명만 표시했습니다.
    <br />
    <b>토먼트 클리어 9176명</b>
    <br />
    <br />
    2. 실내 호드 데이터 삭제
  </div>
);

export const announceUpdate = "20231221";
