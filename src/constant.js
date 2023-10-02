export const tab_items = [
    {
        value: 'S48',
        label: `시즌48 실내 고즈`,
    },
    {
        value: 'S50',
        label: `시즌50 실내 헤세드`,
    },
    {
        value: 'S51',
        label: `시즌51 시가지 시로쿠로`,
    },
    {
        value: 'S52',
        label: `시즌52 야외 카이텐`,
    },
    {
        value: 'S53',
        label: `시즌53 야외 페로로지라`,
    },
    {
        value: 'S54',
        label: `시즌54 실내 호드`,
    },
    {
        value: 'S55',
        label: `시즌55 실내 그레고리오`,
    },
    {
        value: 'S56',
        label: `시즌56 야외 고즈`,
    },
    {
        value: 'B1',
        label: `대결전 베타1 시가지 비나`,
    },
    {
        value: '3S1-T',
        label: `대결전 시즌1 야외 페로로지라(토먼트)`,
    },
    {
        value: '3S1-I',
        label: `대결전 시즌1 야외 페로로지라(관통 인세인)`,
    },
    {
        value: 'S57',
        label: `시즌56 야외 호버크래프트`,
    },
    {
        value: '3S2-T',
        label: `대결전 시즌2 실내 시로쿠로`,
    },
]

export const defaultJson = {
    "season": tab_items[0].value,
    "include": [],
    "exclude": [],
    "assist": undefined,
    "under3": [],
    "under4": [],
    "hardexclude": false,
    "allowduplicate": true
}

export const announceHTML = <div>
    1. 대결전 시로쿠로 반영
    <br />
    최종랭킹 상위 1500명만 표시했습니다.
    <br />
    (토먼트 클리어 수 7000+)
    <br />
    <br />
    2. 야외 비나 데이터 삭제
</div>

export const announceUpdate = "20231002"