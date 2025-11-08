import { translations } from "@/constants/assault";

/**
 * 레이드 이름과 난이도로 YouTube 검색 키워드를 생성합니다.
 * @param raidName - 레이드 이름 (한글)
 * @param level - 레이드 난이도 ("T" | "L" | "I" | "E" | "VH" | "H" | "N")
 * @returns YouTube 검색용 키워드 문자열
 */
export function generateSearchKeyword(raidName: string, level: string): string {
  const keywords = Object.keys(translations)
    .filter((key) => raidName.includes(key))
    .map((key) => translations[key]);

  const levelText = level === "T" ? "TORMENT" : level === "L" ? "LUNATIC" : "";

  return (keywords.join(" ") + " " + levelText).trim();
}
