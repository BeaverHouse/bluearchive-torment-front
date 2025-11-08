"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Plus, X } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { parseTimeToSeconds, formatSecondsToTime } from "@/utils/time";

type Stage = "stage3" | "stage4";

const FPS = 30; // 30프레임 기준

// 점수 계산
// 3단계: 33750000 x n / (F + 900 x n) + 38000
// 4단계: 2000000 x n / (F + 600 x n) + 67166.666
// n: 제한 시간(분), F: 실제 플레이 시간의 프레임 수 (30프레임 기준)
// Unofficial, but verified via several in-game videos
function calculateScore(stage: Stage, limitSeconds: number, playTimeSeconds: number): number {
  const F = playTimeSeconds * FPS; // 30프레임 기준 프레임 수
  const n = limitSeconds / 60; // 제한 시간(분)

  if (stage === "stage3") {
    const score = (33750000 * n) / (F + 900 * n) + 38000;
    return Math.floor(score);
  } else {
    const score = (20000000 * n) / (F + 600 * n) + 67166.666;
    return Math.floor(score);
  }
}

// 점수로 플레이 시간 역산 (이진 탐색)
function calculatePlayTimeFromScore(stage: Stage, limitSeconds: number, score: number): number | null {
  let left = 0;
  let right = limitSeconds * 10; // 최대 제한시간의 10배까지 탐색
  let bestTime = null;

  while (right - left > 0.001) {
    const mid = (left + right) / 2;
    const calculatedScore = calculateScore(stage, limitSeconds, mid);

    if (Math.abs(calculatedScore - score) < 1) {
      bestTime = mid;
      break;
    }

    if (calculatedScore < score) {
      right = mid;
    } else {
      left = mid;
    }
  }

  return bestTime;
}

interface CalculatorItem {
  id: number;
  stage: Stage;
  limitSeconds: string;
  playTimeInput: string;
  scoreInput: string;
  calculatedScore: string;
  calculatedPlayTime: string;
}

export function TacticalChallengeCalculator() {
  const [items, setItems] = useState<CalculatorItem[]>([
    {
      id: 1,
      stage: "stage3",
      limitSeconds: "",
      playTimeInput: "",
      scoreInput: "",
      calculatedScore: "",
      calculatedPlayTime: "",
    },
  ]);

  const addItem = () => {
    if (items.length >= 3) return;

    setItems([
      ...items,
      {
        id: Date.now(),
        stage: "stage3",
        limitSeconds: "",
        playTimeInput: "",
        scoreInput: "",
        calculatedScore: "",
        calculatedPlayTime: "",
      },
    ]);
  };

  const removeItem = (id: number) => {
    if (items.length <= 1) return;
    setItems(items.filter(item => item.id !== id));
  };

  const updateStage = (id: number, stage: Stage) => {
    setItems(items.map(item => {
      if (item.id === id) {
        return {
          ...item,
          stage,
          playTimeInput: "",
          scoreInput: "",
          calculatedScore: "",
          calculatedPlayTime: "",
        };
      }
      return item;
    }));
  };

  const updateLimitSeconds = (id: number, value: string) => {
    setItems(items.map(item => {
      if (item.id === id) {
        const limit = parseInt(value);
        let calculatedScore = "";
        let calculatedPlayTime = "";

        if (!isNaN(limit) && limit >= 60) {
          if (item.playTimeInput) {
            const playTime = parseTimeToSeconds(item.playTimeInput);
            if (playTime !== null) {
              const score = calculateScore(item.stage, limit, playTime);
              calculatedScore = score.toString();
            }
          } else if (item.scoreInput) {
            const score = parseInt(item.scoreInput);
            if (!isNaN(score)) {
              const playTime = calculatePlayTimeFromScore(item.stage, limit, score);
              if (playTime !== null) {
                calculatedPlayTime = formatSecondsToTime(playTime);
              }
            }
          }
        }

        return {
          ...item,
          limitSeconds: value,
          calculatedScore,
          calculatedPlayTime,
        };
      }
      return item;
    }));
  };

  const updatePlayTime = (id: number, value: string) => {
    setItems(items.map(item => {
      if (item.id === id) {
        const limit = parseInt(item.limitSeconds);
        const playTime = parseTimeToSeconds(value);
        let scoreInput = "";

        if (!isNaN(limit) && limit >= 60 && playTime !== null) {
          const score = calculateScore(item.stage, limit, playTime);
          scoreInput = score.toString();
        }

        return {
          ...item,
          playTimeInput: value,
          scoreInput,
          calculatedScore: "",
          calculatedPlayTime: "",
        };
      }
      return item;
    }));
  };

  const updateScore = (id: number, value: string) => {
    setItems(items.map(item => {
      if (item.id === id) {
        const limit = parseInt(item.limitSeconds);
        const score = parseInt(value);
        let playTimeInput = "";

        if (!isNaN(limit) && limit >= 60 && !isNaN(score)) {
          const playTime = calculatePlayTimeFromScore(item.stage, limit, score);
          if (playTime !== null) {
            playTimeInput = formatSecondsToTime(playTime);
          }
        }

        return {
          ...item,
          scoreInput: value,
          playTimeInput,
          calculatedScore: "",
          calculatedPlayTime: "",
        };
      }
      return item;
    }));
  };

  // 총 점수 계산
  const getTotalScore = () => {
    return items.reduce((total, item) => {
      if (item.scoreInput) {
        const score = parseInt(item.scoreInput);
        return total + (isNaN(score) ? 0 : score);
      }
      return total;
    }, 0);
  };

  const totalScore = getTotalScore();

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <CardTitle>종합전술시험 점수 계산기</CardTitle>
            <CardDescription>
              플레이 시간 또는 점수를 입력하면 나머지를 계산합니다. (최대 3개)
            </CardDescription>
          </div>
          {totalScore > 0 && (
            <div className="text-left sm:text-right">
              <div className="text-sm text-muted-foreground">총 점수</div>
              <div className="text-2xl font-bold text-primary">
                {totalScore.toLocaleString()}
              </div>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {items.map((item, index) => (
          <Card key={item.id} className="relative">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">점수 #{index + 1}</CardTitle>
                {items.length > 1 && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeItem(item.id)}
                    className="h-8 w-8"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">단계</label>
                  <Select
                    value={item.stage}
                    onValueChange={(value) => updateStage(item.id, value as Stage)}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="stage3">3단계</SelectItem>
                      <SelectItem value="stage4">4단계</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">제한 시간 (초)</label>
                  <Input
                    type="number"
                    placeholder="60 이상"
                    value={item.limitSeconds}
                    onChange={(e) => updateLimitSeconds(item.id, e.target.value)}
                    min={60}
                    inputMode="numeric"
                    className="w-full"
                  />
                  {item.limitSeconds && parseInt(item.limitSeconds) < 60 && (
                    <p className="mt-1 text-xs text-destructive">
                      제한 시간은 60초 이상이어야 합니다.
                    </p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">실제 플레이 시간</label>
                  <Input
                    placeholder="01:23 또는 01:23.456"
                    value={item.playTimeInput}
                    onChange={(e) => updatePlayTime(item.id, e.target.value)}
                    disabled={!item.limitSeconds || parseInt(item.limitSeconds) < 60}
                    inputMode="text"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">점수</label>
                  <Input
                    type="number"
                    placeholder="56000"
                    value={item.scoreInput}
                    onChange={(e) => updateScore(item.id, e.target.value)}
                    disabled={!item.limitSeconds || parseInt(item.limitSeconds) < 60}
                    inputMode="numeric"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {items.length < 3 && (
          <Button onClick={addItem} variant="outline" className="w-full">
            <Plus className="h-4 w-4 mr-2" />
            계산기 추가 ({items.length}/3)
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
