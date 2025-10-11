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
import { scoreInfo } from "@/constants/score";

type Difficulty = "normal" | "hard" | "veryHard" | "hardcore" | "extreme" | "insane" | "torment" | "lunatic";
type TimeLimit = "3min" | "4min";

const DIFFICULTY_LABELS: Record<Difficulty, string> = {
  normal: "Normal",
  hard: "Hard",
  veryHard: "Very Hard",
  hardcore: "Hardcore",
  extreme: "Extreme",
  insane: "Insane",
  torment: "Torment",
  lunatic: "Lunatic",
};

const MAX_TIME_SECONDS = 3600; // 60분

interface CalculatorItem {
  id: number;
  difficulty: Difficulty;
  timeLimit: TimeLimit;
  timeInput: string;
  scoreInput: string;
  calculatedTime: string;
  calculatedScore: string;
}

// 시간 문자열(mm:ss.SSS 또는 mm:ss)을 초로 변환
function parseTimeToSeconds(timeStr: string): number | null {
  // mm:ss.SSS 형식
  let match = timeStr.match(/^(\d+):(\d{2})\.(\d{3})$/);
  if (match) {
    const minutes = parseInt(match[1]);
    const seconds = parseInt(match[2]);
    const milliseconds = parseInt(match[3]);
    return minutes * 60 + seconds + milliseconds / 1000;
  }

  // mm:ss 형식 (소수점 없음)
  match = timeStr.match(/^(\d+):(\d{2})$/);
  if (match) {
    const minutes = parseInt(match[1]);
    const seconds = parseInt(match[2]);
    return minutes * 60 + seconds;
  }

  return null;
}

// 초를 시간 문자열(mm:ss.SSS)로 변환
function formatSecondsToTime(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  const ms = Math.round((seconds % 1) * 1000);

  return `${minutes}:${secs.toString().padStart(2, '0')}.${ms.toString().padStart(3, '0')}`;
}

// 기본 점수 계산 (base + HP 점수)
function getBaseScore(difficulty: Difficulty, timeLimit: TimeLimit): number {
  const info = scoreInfo[difficulty];
  return timeLimit === "3min" ? info.threeMinuteBase : info.fourMinuteBase;
}

// 시간으로 점수 계산
function calculateScoreFromTime(timeSeconds: number, difficulty: Difficulty, timeLimit: TimeLimit): number {
  if (timeSeconds > MAX_TIME_SECONDS) return 0;

  const baseScore = getBaseScore(difficulty, timeLimit);
  const timeBonus = scoreInfo[difficulty].timeBonus;
  const score = baseScore + (MAX_TIME_SECONDS - timeSeconds) * timeBonus;

  return Math.max(0, Math.floor(score));
}

// 점수로 시간 계산
function calculateTimeFromScore(score: number, difficulty: Difficulty, timeLimit: TimeLimit): number {
  const baseScore = getBaseScore(difficulty, timeLimit);
  const timeBonus = scoreInfo[difficulty].timeBonus;
  const timeSeconds = MAX_TIME_SECONDS - (score - baseScore) / timeBonus;

  return Math.max(0, Math.min(MAX_TIME_SECONDS, timeSeconds));
}

export function RaidScoreCalculator() {
  const [items, setItems] = useState<CalculatorItem[]>([
    {
      id: 1,
      difficulty: "torment",
      timeLimit: "3min",
      timeInput: "",
      scoreInput: "",
      calculatedTime: "",
      calculatedScore: "",
    },
  ]);

  const addItem = () => {
    if (items.length >= 3) return;

    setItems([
      ...items,
      {
        id: Date.now(),
        difficulty: "torment",
        timeLimit: "3min",
        timeInput: "",
        scoreInput: "",
        calculatedTime: "",
        calculatedScore: "",
      },
    ]);
  };

  const removeItem = (id: number) => {
    if (items.length <= 1) return;
    setItems(items.filter(item => item.id !== id));
  };

  const updateDifficulty = (id: number, difficulty: Difficulty) => {
    setItems(items.map(item => {
      if (item.id === id) {
        // 난이도가 변경되면 입력값 초기화
        return {
          ...item,
          difficulty,
          timeInput: "",
          scoreInput: "",
          calculatedTime: "",
          calculatedScore: "",
        };
      }
      return item;
    }));
  };

  const updateTimeLimit = (id: number, timeLimit: TimeLimit) => {
    setItems(items.map(item => {
      if (item.id === id) {
        // 시간 제한이 변경되면 입력값 초기화
        return {
          ...item,
          timeLimit,
          timeInput: "",
          scoreInput: "",
          calculatedTime: "",
          calculatedScore: "",
        };
      }
      return item;
    }));
  };

  const updateTime = (id: number, timeInput: string) => {
    setItems(items.map(item => {
      if (item.id === id) {
        const seconds = parseTimeToSeconds(timeInput);
        let scoreInput = "";

        if (seconds !== null) {
          const score = calculateScoreFromTime(seconds, item.difficulty, item.timeLimit);
          scoreInput = score.toString();
        }

        return {
          ...item,
          timeInput,
          scoreInput,
          calculatedScore: "",
          calculatedTime: "",
        };
      }
      return item;
    }));
  };

  const updateScore = (id: number, scoreInput: string) => {
    setItems(items.map(item => {
      if (item.id === id) {
        const score = parseInt(scoreInput);
        let timeInput = "";

        if (!isNaN(score)) {
          const seconds = calculateTimeFromScore(score, item.difficulty, item.timeLimit);
          timeInput = formatSecondsToTime(seconds);
        }

        return {
          ...item,
          scoreInput,
          timeInput,
          calculatedTime: "",
          calculatedScore: "",
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
            <CardTitle>총력전/대결전 점수 계산기</CardTitle>
            <CardDescription>
              시간 또는 점수를 입력하면 나머지를 계산합니다. (최대 3개)
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
                  <label className="text-sm font-medium mb-2 block">난이도</label>
                  <Select
                    value={item.difficulty}
                    onValueChange={(value) => updateDifficulty(item.id, value as Difficulty)}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(DIFFICULTY_LABELS).map(([key, label]) => (
                        <SelectItem key={key} value={key}>
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">시간 제한</label>
                  <Select
                    value={item.timeLimit}
                    onValueChange={(value) => updateTimeLimit(item.id, value as TimeLimit)}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="3min">3분</SelectItem>
                      <SelectItem value="4min">4분</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">시간 입력</label>
                  <Input
                    placeholder="01:23 또는 01:23.456"
                    value={item.timeInput}
                    onChange={(e) => updateTime(item.id, e.target.value)}
                    inputMode="text"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">점수</label>
                  <Input
                    type="number"
                    placeholder="8640000"
                    value={item.scoreInput}
                    onChange={(e) => updateScore(item.id, e.target.value)}
                    inputMode="numeric"
                  />
                </div>
              </div>

              <div className="pt-2 border-t space-y-1">
                <p className="text-xs text-muted-foreground">
                  기본 점수: {getBaseScore(item.difficulty, item.timeLimit).toLocaleString()}점
                </p>
                <p className="text-xs text-muted-foreground">
                  1초당 점수: {scoreInfo[item.difficulty].timeBonus.toLocaleString()}점
                </p>
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
