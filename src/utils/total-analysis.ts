import { RaidInfo } from "@/types/raid";

export const ALL_BOSSES = [
    "비나",
    "헤세드",
    "시로쿠로",
    "예로니무스",
    "카이텐",
    "페로로지라",
    "호드",
    "고즈",
    "호버크래프트",
    "그레고리오",
    "쿠로카게",
    "게부라",
    "예소드",
]

const subcategories = {
    "경장갑": "폭발",
    "중장갑": "관통",
    "특수장갑": "신비",
    "탄력장갑": "진동"
}

export const categorizeAssault = (raids: RaidInfo[], raidId: string): {boss: string, subcategory: string} => {
    const raid = raids.find((r) => r.id === raidId);
    
    if (!raid) {
        return {boss: "", subcategory: ""};
    }

    const boss = ALL_BOSSES.find((b) => raid.name.includes(b));
    if (!boss) {
        return {boss: "", subcategory: ""};
    } else if (raidId.startsWith("S")) {
        return {boss: boss, subcategory: "LUNATIC"};
    } else {
        const subcategory = Object.keys(subcategories).find((key) => raid.name.includes(key));
        if (!subcategory) {
            return {boss: "", subcategory: ""};
        }
        return {boss: boss, subcategory: subcategories[subcategory as keyof typeof subcategories]};
    }
}

/** Map of canonical Korean boss name → i18n key. */
const BOSS_KEY: Record<string, string> = {
  "비나": "boss.binah",
  "헤세드": "boss.hesed",
  "시로쿠로": "boss.shirokuro",
  "예로니무스": "boss.hieronymus",
  "카이텐": "boss.kaiten",
  "페로로지라": "boss.perorodzilla",
  "호드": "boss.hod",
  "고즈": "boss.goz",
  "호버크래프트": "boss.hovercraft",
  "그레고리오": "boss.gregorio",
  "쿠로카게": "boss.kurokage",
  "게부라": "boss.geburah",
  "예소드": "boss.yesod",
};

/** Map of canonical Korean subtype/subcategory → i18n key. */
const SUBTYPE_KEY: Record<string, string> = {
  "폭발": "subtype.explosive",
  "관통": "subtype.piercing",
  "신비": "subtype.mystic",
  "진동": "subtype.vibration",
  "총력전": "subtype.totalAssault",
  "LUNATIC": "subtype.lunatic",
};

/** Get a localized boss label. Falls back to the input if not mapped or no t. */
export function bossDisplayName(boss: string, t?: (k: string) => string): string {
  const key = BOSS_KEY[boss];
  if (!key || !t) return boss;
  return t(key);
}

/** Get a localized subtype/column-type label. Falls back to the input. */
export function subtypeDisplayName(subtype: string, t?: (k: string) => string): string {
  const key = SUBTYPE_KEY[subtype];
  if (!key || !t) return subtype;
  return t(key);
}