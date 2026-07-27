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
import { Search, Users, Video, Calculator, Sprout, Heart } from "lucide-react";
import { SupportModal } from "@/components/common/support-modal";
import { Button } from "@/components/ui/button";
import { trackEvent } from "@/utils/analytics";
import { useTranslations } from "@/lib/i18n";

type Feature = {
  titleKey: string;
  descKey: string;
  href: string;
  feature: "party_search" | "total_analysis" | "video" | "arona" | "calculator" | "guide";
} & (
  | { icon: typeof Search }
  | { image: string; badge: string }
);

const features: Feature[] = [
  {
    titleKey: "common.partyFinder",
    descKey: "home.party.desc",
    href: "/party",
    feature: "party_search",
    icon: Search,
  },
  {
    titleKey: "common.students",
    descKey: "home.students.desc",
    href: "/students",
    feature: "total_analysis",
    icon: Users,
  },
  {
    titleKey: "common.aronaArchive",
    descKey: "home.archive.desc",
    href: "/guide",
    feature: "guide",
    image: "/arona.webp",
    badge: "Beta",
  },
  {
    titleKey: "common.videos",
    descKey: "home.video.desc",
    href: "/video-analysis",
    feature: "video",
    icon: Video,
  },
  {
    titleKey: "common.scoreCalculator",
    descKey: "home.calculator.desc",
    href: "/calculator/score",
    feature: "calculator",
    icon: Calculator,
  },
];

export default function Home() {
  const { t } = useTranslations();

  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="text-center mb-6">
        <h1 className="text-3xl sm:text-4xl font-bold mb-3">BA Torment</h1>
        <p className="text-muted-foreground text-sm sm:text-base">{t("site.tagline")}</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {features.map((feature) => {
          const title = t(feature.titleKey);
          return (
            <Link
              key={feature.href}
              href={feature.href}
              onClick={() =>
                trackEvent("home_feature_click", { feature: feature.feature })
              }
            >
              <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer hover:border-primary/50">
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-3">
                    {"image" in feature ? (
                      <Image
                        src={feature.image}
                        alt={title}
                        width={40}
                        height={40}
                        className="rounded-full object-cover flex-shrink-0"
                      />
                    ) : (
                      <div
                        className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-primary/10"
                      >
                        <feature.icon className="h-5 w-5 text-primary" />
                      </div>
                    )}
                    <CardTitle className="text-lg flex items-center gap-2">
                      {title}
                      {"badge" in feature && (
                        <Badge variant="secondary" className="text-xs">
                          {feature.badge}
                        </Badge>
                      )}
                    </CardTitle>
                  </div>
                  <CardDescription className="mt-2">{t(feature.descKey)}</CardDescription>
                </CardHeader>
              </Card>
            </Link>
          );
        })}
      </div>

      <div className="mt-4">
        <Link
          href="/guide/guides/beginner"
          onClick={() => trackEvent("home_feature_click", { feature: "guide" })}
        >
          <div className="flex cursor-pointer items-center gap-3 rounded-lg border border-primary/30 bg-primary/10 px-4 py-3 transition-colors hover:bg-primary/15">
            <Sprout className="h-5 w-5 shrink-0 text-primary" />
            <span className="text-sm font-medium text-primary">{t("home.guide.question")}</span>
            <span className="ml-auto text-xs text-primary/80">{t("home.guide.cta")}</span>
          </div>
        </Link>
      </div>

      <div className="mt-12 flex flex-col items-center gap-3 text-center">
        <SupportModal>
          <Button variant="ghost" size="sm" className="gap-1.5 text-muted-foreground hover:text-foreground">
            <Heart className="w-4 h-4 text-red-500" />
            {t("home.support")}
          </Button>
        </SupportModal>
        <div className="flex flex-col items-center gap-1 text-xs text-muted-foreground">
          <p>
            {t("home.data.raid.prefix")}
            <a
              href="https://plana-stats.vercel.app/"
              target="_blank"
              rel="noreferrer"
              className="!underline underline-offset-2 hover:text-foreground"
            >
              Plana Stats
            </a>
            {t("home.data.sourceSuffix")}
          </p>
          <p>
            {t("home.data.ingame.prefix")}
            <a
              href="https://schaledb.com/"
              target="_blank"
              rel="noreferrer"
              className="!underline underline-offset-2 hover:text-foreground"
            >
              Schale DB
            </a>
            {t("home.data.sourceSuffix")}
          </p>
        </div>
      </div>
    </div>
  );
}
