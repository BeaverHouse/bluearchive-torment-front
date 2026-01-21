"use client";

import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Key } from "lucide-react";

interface EmptyStateProps {
  hasApiKey: boolean;
  onSetupApiKey: () => void;
}

export function EmptyState({ hasApiKey, onSetupApiKey }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center">
      <Image
        src="/arona.webp"
        alt="ARONA"
        width={80}
        height={80}
        className="rounded-full mb-4 object-cover"
      />
      <p className="text-lg font-medium mb-3">선생님, 무엇을 도와드릴까요?</p>
      <div className="text-sm text-muted-foreground space-y-1 mb-4">
        <p>
          🔍 <strong>학생 검색</strong> - 이름이나 별명으로 학생을 찾아요
        </p>
        <p>
          📋 <strong>스킬 설명</strong> - 학생의 스킬과 능력을 설명해요
        </p>
        <p>
          ⚔️ <strong>데미지 계산</strong> - 특정 조건에서 데미지/힐량/스탯을 계산해요
        </p>
      </div>
      {!hasApiKey && (
        <Button className="mt-2" onClick={onSetupApiKey}>
          <Key className="h-4 w-4 mr-2" />
          API 키 설정하기
        </Button>
      )}
    </div>
  );
}
