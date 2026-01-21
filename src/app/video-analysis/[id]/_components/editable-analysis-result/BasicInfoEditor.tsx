"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { BasicInfoEditorProps } from "./types";

export function BasicInfoEditor({
  score,
  description,
  onUpdateScore,
  onUpdateDescription,
}: BasicInfoEditorProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>기본 정보</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid grid-cols-1 gap-3">
          <div>
            <label className="text-xs font-medium mb-2 block text-muted-foreground">
              점수
            </label>
            <Input
              type="number"
              value={score}
              onChange={(e) => onUpdateScore(parseInt(e.target.value) || 0)}
              placeholder="점수를 입력하세요"
              className="h-9 w-full"
            />
          </div>
        </div>
        <div>
          <label className="text-xs font-medium mb-2 block text-muted-foreground">
            설명
          </label>
          <Textarea
            value={description || ""}
            onChange={(e) => onUpdateDescription(e.target.value)}
            placeholder="설명을 입력하세요"
            rows={3}
            className="w-full resize-none"
          />
        </div>
      </CardContent>
    </Card>
  );
}
