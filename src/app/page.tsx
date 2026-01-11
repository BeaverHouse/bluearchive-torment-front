"use client";

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
        <a
          href="https://buymeacoffee.com/haulrest"
          target="_blank"
          rel="noreferrer"
        >
          <Image
            src="/bmc-button.png"
            alt="Buy Me a Coffee"
            width={180}
            height={50}
            className="hover:opacity-80 transition-opacity"
          />
        </a>
      </div>
    </div>
  );
}
