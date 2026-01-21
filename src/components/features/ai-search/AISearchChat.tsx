"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trash2, Key } from "lucide-react";
import { ApiKeyModal } from "./ApiKeyModal";
import { ChatMessages } from "./ChatMessages";
import { ChatInput } from "./ChatInput";
import { EmptyState } from "./EmptyState";
import { useApiKey } from "./hooks/useApiKey";
import { useChat } from "./hooks/useChat";

const SYSTEM_PROMPT_URL = "/data/prompt_ko.md";

export function AISearchChat() {
  const [systemPrompt, setSystemPrompt] = useState<string>("");
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  const {
    apiKey,
    showApiKeyModal,
    saveApiKey,
    openApiKeyModal,
    setShowApiKeyModal,
  } = useApiKey();

  const {
    messages,
    input,
    setInput,
    isLoading,
    currentAnswer,
    currentStatus,
    error,
    sendMessage,
    stopGeneration,
    clearChat,
  } = useChat({
    apiKey,
    systemPrompt,
    onApiKeyRequired: openApiKeyModal,
  });

  // 시스템 프롬프트 로드
  useEffect(() => {
    fetch(SYSTEM_PROMPT_URL)
      .then((res) => res.text())
      .then((text) => setSystemPrompt(text))
      .catch((err) => console.error("Failed to load system prompt:", err));
  }, []);

  // 스크롤 맨 아래로
  const scrollToBottom = useCallback(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, currentAnswer, scrollToBottom]);

  const isEmpty = messages.length === 0 && !currentAnswer && !isLoading;

  return (
    <div className="flex flex-col h-[calc(100vh-200px)] max-w-4xl mx-auto">
      {/* 헤더 */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <Image
            src="/arona.webp"
            alt="ARONA"
            width={48}
            height={48}
            className="rounded-full object-cover"
          />
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-sky-600 dark:text-sky-400">
                A.R.O.N.A
              </h1>
              <Badge variant="secondary" className="text-xs">
                Beta
              </Badge>
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={openApiKeyModal}>
            <Key className="h-4 w-4 mr-1" />
            {apiKey ? "키 변경" : "키 설정"}
          </Button>
          {messages.length > 0 && (
            <Button variant="outline" size="sm" onClick={clearChat}>
              <Trash2 className="h-4 w-4 mr-1" />
              초기화
            </Button>
          )}
        </div>
      </div>

      {/* 메시지 영역 */}
      <Card className="flex-1 mb-4 overflow-hidden">
        <CardContent className="p-0 h-full">
          <div className="h-full overflow-y-auto p-4" ref={scrollAreaRef}>
            {isEmpty ? (
              <EmptyState hasApiKey={!!apiKey} onSetupApiKey={openApiKeyModal} />
            ) : (
              <ChatMessages
                messages={messages}
                currentAnswer={currentAnswer}
                currentStatus={currentStatus}
                error={error}
              />
            )}
          </div>
        </CardContent>
      </Card>

      {/* 입력 영역 */}
      <ChatInput
        input={input}
        onInputChange={setInput}
        onSubmit={sendMessage}
        onStop={stopGeneration}
        isLoading={isLoading}
        disabled={!apiKey}
        placeholder={apiKey ? "질문을 입력하세요..." : "API 키를 먼저 설정해주세요"}
      />

      {/* API 키 모달 */}
      <ApiKeyModal
        open={showApiKeyModal}
        onOpenChange={setShowApiKeyModal}
        onSubmit={saveApiKey}
      />
    </div>
  );
}
