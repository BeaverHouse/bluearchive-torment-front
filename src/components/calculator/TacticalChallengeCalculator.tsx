"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export function TacticalChallengeCalculator() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>종합전술시험 점수 계산기</CardTitle>
        <CardDescription>
          종합전술시험의 점수를 계산합니다.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>작업 중 (WIP)</AlertTitle>
          <AlertDescription>
            종합전술시험 점수 계산기는 현재 개발 중입니다.
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );
}
