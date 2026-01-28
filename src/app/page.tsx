import Link from "next/link";
import Image from "next/image";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Search, PieChart, Video, Calculator } from "lucide-react";
import BuyMeACoffeeButton from "@/components/common/coffee";

const features = [
  {
    title: "파티 찾기 & 요약",
    description: "시즌별 파티 정보와 요약을 볼 수 있어요.",
    href: "/party",
    icon: Search,
    color: "text-blue-500",
    bgColor: "bg-blue-500/10",
  },
  {
    title: "통계",
    description: "전체 총력전 추이와 캐릭터별 통계를 볼 수 있어요.",
    href: "/total-analysis",
    icon: PieChart,
    color: "text-purple-500",
    bgColor: "bg-purple-500/10",
  },
  {
    title: "영상",
    description: "Youtube에 올라온 클리어 영상들이에요.",
    href: "/video-analysis",
    icon: Video,
    color: "text-rose-500",
    bgColor: "bg-rose-500/10",
  },
  {
    title: "ARONA",
    description: "아로나에게 궁금한 것을 물어보세요!",
    href: "/arona",
    image: "/arona.webp",
    badge: "Beta",
  },
  {
    title: "점수 계산기",
    description: "총력전, 대결전, 종합전술시험 점수를 계산할 수 있어요.",
    href: "/calculator/score",
    icon: Calculator,
    color: "text-emerald-500",
    bgColor: "bg-emerald-500/10",
  },
];

export default function Home() {
  return (
    <div className="w-full max-w-4xl mx-auto">
      {/* 헤더 */}
      <div className="text-center mb-6">
        <h1 className="text-3xl sm:text-4xl font-bold mb-3">BA Torment</h1>
        <p className="text-muted-foreground text-sm sm:text-base">
          블루 아카이브 총력전/대결전 도우미
        </p>
      </div>

      {/* 소개 텍스트 - AdSense 크롤러용 */}
      <section className="mb-8 text-center">
        <p className="text-muted-foreground text-sm leading-relaxed max-w-2xl mx-auto">
          BA Torment는 블루 아카이브(Blue Archive) 총력전과 대결전을 위한
          종합 도우미 서비스입니다. 시즌별 파티 정보 검색, 클리어 영상 분석,
          캐릭터 통계, AI 아로나 상담 등 다양한 기능을 제공합니다.
        </p>
      </section>

      {/* 기능 카드 그리드 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {features.map((feature) => (
          <Link key={feature.href} href={feature.href}>
            <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer hover:border-primary/50">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-3">
                  {"image" in feature ? (
                    <Image
                      src={feature.image as string}
                      alt={feature.title}
                      width={40}
                      height={40}
                      className="rounded-full object-cover flex-shrink-0"
                    />
                  ) : (
                    <div
                      className={`w-10 h-10 rounded-lg ${feature.bgColor} flex items-center justify-center flex-shrink-0`}
                    >
                      <feature.icon className={`w-5 h-5 ${feature.color}`} />
                    </div>
                  )}
                  <CardTitle className="text-lg flex items-center gap-2">
                    {feature.title}
                    {"badge" in feature && (
                      <Badge variant="secondary" className="text-xs">
                        {feature.badge}
                      </Badge>
                    )}
                  </CardTitle>
                </div>
                <CardDescription className="mt-2">{feature.description}</CardDescription>
              </CardHeader>
            </Card>
          </Link>
        ))}
      </div>

      {/* 기능 설명 - AdSense 크롤러용 */}
      <section className="mt-12 space-y-6">
        <h2 className="text-xl font-semibold text-center">주요 기능</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-muted-foreground">
          <div className="p-4 rounded-lg bg-muted/30">
            <h3 className="font-medium text-foreground mb-2">파티 찾기</h3>
            <p>
              총력전/대결전 시즌별로 상위 랭커들의 파티 구성을 검색하고,
              보유 캐릭터 기반으로 최적의 파티를 찾을 수 있습니다.
            </p>
          </div>
          <div className="p-4 rounded-lg bg-muted/30">
            <h3 className="font-medium text-foreground mb-2">영상 분석</h3>
            <p>
              YouTube에 업로드된 총력전/대결전 클리어 영상들을 모아보고,
              파티 구성과 점수를 확인할 수 있습니다.
            </p>
          </div>
          <div className="p-4 rounded-lg bg-muted/30">
            <h3 className="font-medium text-foreground mb-2">통계</h3>
            <p>
              전체 시즌의 캐릭터 사용률, 파티 구성 추이 등
              다양한 통계 데이터를 제공합니다.
            </p>
          </div>
          <div className="p-4 rounded-lg bg-muted/30">
            <h3 className="font-medium text-foreground mb-2">ARONA AI</h3>
            <p>
              AI 아로나에게 총력전/대결전 관련 질문을 하고
              맞춤형 답변을 받을 수 있습니다.
            </p>
          </div>
        </div>
      </section>

      {/* 데이터 출처 및 후원 */}
      <div className="mt-12 flex flex-col items-center gap-6 text-center">
        {/* 데이터 출처 */}
        <div className="flex flex-col items-center gap-1 text-xs text-muted-foreground">
          <p>
            총력전/대결전 데이터는{" "}
            <a
              href="https://plana-stats.vercel.app/"
              target="_blank"
              rel="noreferrer"
              className="!underline underline-offset-2 hover:text-foreground"
            >
              Plana Stats
            </a>
            에서 가져왔어요.
          </p>
          <p>
            인게임 데이터는{" "}
            <a
              href="https://schaledb.com/"
              target="_blank"
              rel="noreferrer"
              className="!underline underline-offset-2 hover:text-foreground"
            >
              Schale DB
            </a>
            에서 가져왔어요.
          </p>
        </div>

        {/* 후원 */}
        <BuyMeACoffeeButton />
      </div>
    </div>
  );
}
