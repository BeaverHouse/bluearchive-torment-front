import { RaidInfo } from "@/types/raid";

const bosses = [
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

    const boss = bosses.find((b) => raid.name.includes(b));
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