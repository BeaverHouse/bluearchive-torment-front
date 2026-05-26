"use client";

import { useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RaidScoreCalculator } from "@/components/features/calculator/raid-score-calculator";
import { TacticalChallengeCalculator } from "@/components/features/calculator/tactical-challenge-calculator";
import { trackEvent } from "@/utils/analytics";
import { useTranslations } from "@/lib/i18n";

export default function ScoreCalculatorPage() {
  const { t } = useTranslations();

  useEffect(() => {
    trackEvent("calculator_use", { type: "raid_score" });
  }, []);

  return (
    <div className="container mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">{t("calc.title")}</h1>
        <p className="text-muted-foreground">{t("calc.subtitle")}</p>
      </div>

      <Tabs defaultValue="raid" className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger
            value="raid"
            onClick={() => trackEvent("calculator_use", { type: "raid_score" })}
          >
            {t("calc.tab.raid")}
          </TabsTrigger>
          <TabsTrigger
            value="tactical"
            onClick={() => trackEvent("calculator_use", { type: "tactical_challenge" })}
          >
            {t("calc.tab.tactical")}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="raid" className="mt-6">
          <RaidScoreCalculator />
        </TabsContent>

        <TabsContent value="tactical" className="mt-6">
          <TacticalChallengeCalculator />
        </TabsContent>
      </Tabs>
    </div>
  );
}
