"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RaidScoreCalculator } from "@/components/features/calculator/raid-score-calculator";
import { TacticalChallengeCalculator } from "@/components/features/calculator/tactical-challenge-calculator";

export default function ScoreCalculatorPage() {
  return (
    <div className="container mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">점수 계산기</h1>
        <p className="text-muted-foreground">
          총력전/대결전 또는 종합전술시험의 점수를 계산합니다.
        </p>
      </div>

      <Tabs defaultValue="raid" className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="raid">총력전/대결전</TabsTrigger>
          <TabsTrigger value="tactical">종합전술시험</TabsTrigger>
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
