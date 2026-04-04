"use client";

import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CharacterAvatar } from "@/components/common/character-image";
import { ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";

// 편집하기 쉽게 상수로 분리
const ASSISTANTS = [
  {
    type: "폭발",
    characters: [{ id: 10086, name: "히나(드레스)" }],
  },
  {
    type: "관통",
    characters: [
      { id: 10059, name: "미카" },
      { id: 10111, name: "네루(교복)" },
    ],
  },
  {
    type: "신비",
    characters: [
      { id: 10033, name: "와카모" },
      { id: 10100, name: "시로코*테러" },
      { id: 10098, name: "호시노(무장)" },
      { id: 10134, name: "아리스(무장)" },
    ],
  },
  {
    type: "진동",
    characters: [
      { id: 10074, name: "하나코(수영복)" },
      { id: 10122, name: "미카(수영복)" },
    ],
  },
];

// 속성별 색상
const TYPE_COLORS: Record<string, string> = {
  폭발: "text-red-500",
  관통: "text-orange-500",
  신비: "text-purple-500",
  진동: "text-blue-500",
};

// 영상 링크 테이블 데이터 (편집하기 쉽게 상수로 분리)
// url: null 이면 해당 셀 비워둠
const VIDEO_TABLE: {
  boss: string;
  extreme: string[] | null;
  insane: string[] | null;
  notes?: string[];
}[] = [
  {
    boss: "비나",
    extreme: [
      "https://bluearchive-torment.netlify.app/video-analysis/2NI_MRwoPOY?raid_id=S86-0",
    ],
    insane: [
      "https://bluearchive-torment.netlify.app/video-analysis/6kJ_cSRr4AE?raid_id=S86-0",
    ],
    notes: ["60레벨 정도에도 클리어 가능해요", "가장 쉬워요"],
  },
  {
    boss: "예로니무스",
    extreme: [
      "https://bluearchive-torment.netlify.app/video-analysis/n1CwzkenlY4?raid_id=3S31-2",
      "https://bluearchive-torment.netlify.app/video-analysis/BU652VOnvsk?raid_id=3S31-3",
      "https://bluearchive-torment.netlify.app/video-analysis/69iFSgj3Vd0?raid_id=3S31-1",
    ],
    insane: null,
    notes: ["단일 힐러와 방어력 감소가 효과적이에요"],
  },
  {
    boss: "고즈",
    extreme: [
      "https://bluearchive-torment.netlify.app/video-analysis/v5wabaK6VDk?raid_id=S87-0",
    ],
    insane: [
      "https://bluearchive-torment.netlify.app/video-analysis/yhYZ9NKm2hI?raid_id=S87-0"
    ],
    notes: ["배포캐 전3 운스미와 수즈코를 활용하세요", "패턴 숙지가 어느 정도 필요해요"],
  },
  { boss: "헤세드", extreme: null, insane: null },
  { boss: "시로쿠로", extreme: null, insane: null },
];

export default function GuidePage() {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold">총력전/대결전 입문 가이드</h1>
      <p className="text-muted-foreground">
        총력전/대결전이 처음이신가요? 이 가이드를 참고해 시작해 보세요.
      </p>

      {/* 준비하기 */}
      <Card>
        <CardHeader>
          <CardTitle>1단계: 준비하기</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <h3 className="font-semibold">레벨과 장비</h3>
            <p className="text-muted-foreground text-sm">
              우선 레벨을 올리고 지역을 해금하세요. 레벨과 장비는 매우 중요해요.
            </p>
          </div>

          <div className="space-y-3">
            <h3 className="font-semibold">추천 조력자</h3>
            <p className="text-muted-foreground text-sm">
              친구를 통해 강력한 딜러 조력자를 구하세요. 필요하다면 다른
              조력자를 구할 수도 있어요.
            </p>
            <div className="space-y-3">
              {ASSISTANTS.map((group) => (
                <div key={group.type} className="flex items-start gap-4">
                  <span
                    className={`text-sm font-semibold w-8 pt-1 shrink-0 ${TYPE_COLORS[group.type] ?? ""}`}
                  >
                    {group.type}
                  </span>
                  <div className="flex flex-wrap gap-3">
                    {group.characters.map((char) => (
                      <div
                        key={char.id}
                        className="flex flex-col items-center gap-1 w-14"
                      >
                        <CharacterAvatar
                          studentId={char.id}
                          name={char.name}
                          size="md"
                        />
                        <span className="text-[10px] text-center text-muted-foreground leading-tight w-full break-keep">
                          {char.name}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <h3 className="font-semibold">기믹 & 버프 학생</h3>
            <p className="text-muted-foreground text-sm">
              기믹 해결을 할 수 있거나, 버프를 주는 학생을 키우세요.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* INSANE 도전하기 */}
      <Card>
        <CardHeader>
          <CardTitle>2단계: EXTREME/INSANE 도전하기</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground text-sm">
            준비가 끝났다면, EXTREME/INSANE 난이도를 도전해 보세요. 반복 클리어로
            코인과 보상을 챙기는 것을 목표로 해요.
          </p>
          <p className="text-muted-foreground text-sm">
            아래는 일본 서버 5주년 유입 기준 참고 영상이에요.
          </p>
          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2 pr-3 font-semibold">보스</th>
                  <th className="text-center py-2 px-3 font-semibold">EXTREME</th>
                  <th className="text-center py-2 px-3 font-semibold">INSANE</th>
                  <th className="hidden sm:table-cell text-left py-2 pl-4 font-semibold text-muted-foreground">
                    비고
                  </th>
                </tr>
              </thead>
              <tbody>
                {VIDEO_TABLE.map((row) => (
                  <tr key={row.boss} className="border-b last:border-0 align-top">
                    <td className="py-3 pr-3 font-medium whitespace-nowrap">
                      {row.boss}
                    </td>
                    <td className="py-3 px-3 text-center whitespace-nowrap">
                      {row.extreme ? (
                        <div className="flex flex-wrap gap-1 justify-center">
                          {row.extreme.map((url, i) => (
                            <Button key={i} asChild size="sm">
                              <a href={url} target="_blank" rel="noopener noreferrer">
                                <ExternalLink />
                                영상{row.extreme!.length > 1 ? ` ${i + 1}` : ""}
                              </a>
                            </Button>
                          ))}
                        </div>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </td>
                    <td className="py-3 px-3 text-center whitespace-nowrap">
                      {row.insane ? (
                        <div className="flex flex-wrap gap-1 justify-center">
                          {row.insane.map((url, i) => (
                            <Button key={i} asChild size="sm">
                              <a href={url} target="_blank" rel="noopener noreferrer">
                                <ExternalLink />
                                영상{row.insane!.length > 1 ? ` ${i + 1}` : ""}
                              </a>
                            </Button>
                          ))}
                        </div>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </td>
                    <td className="hidden sm:table-cell py-3 pl-4 text-xs text-muted-foreground">
                      {row.notes?.map((note, i) => (
                        <p key={i}>{note}</p>
                      ))}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* 높은 난이도 도전하기 */}
      <Card>
        <CardHeader>
          <CardTitle>3단계: 높은 난이도 도전하기</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-muted-foreground text-sm">
            인세인을 클리어했다면, TORMENT/LUNATIC 난이도를 도전해 보세요.
          </p>
          <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
            <li>
              <Link href="/party" target="_blank" className="text-[#27a567] underline underline-offset-2 hover:text-[#30c77d] font-semibold">파티 구성</Link>과{" "}
              <Link href="/video-analysis" target="_blank" className="text-[#27a567] underline underline-offset-2 hover:text-[#30c77d] font-semibold">영상</Link>을 사이트에서 찾아볼 수 있어요.
            </li>
            <li>
              더 많은 정보가 필요하다면 Youtube나 외부 사이트도 찾아 보세요.
            </li>
            <li>
              TORMENT는 보통 핵심 학생이 있다면 1-2파티로 준비할 수 있어요.
            </li>
            <li>
              <strong className="text-foreground">LUNATIC 입문은 비나</strong>가
              가장 좋아요.
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
