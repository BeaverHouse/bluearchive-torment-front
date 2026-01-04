"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Send, Loader2, StopCircle, Trash2, Key } from "lucide-react";
import { ApiKeyModal } from "./ApiKeyModal";
import { aiSearchService } from "@/lib/ai-search-service";
import type { Message, StreamMessage } from "@/types/ai-search";
import {
  getStatusMessage,
  AI_SEARCH_FALLBACK_MESSAGE,
} from "@/constants/ai-search";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

const API_KEY_STORAGE_KEY = "batorment_gemini_api_key";
const API_KEY_EXPIRY_KEY = "batorment_gemini_api_key_expiry";
const API_KEY_TTL_MS = 30 * 60 * 1000; // 30분
const SYSTEM_PROMPT_URL = "/data/prompt_ko.md";

export function AISearchChat() {
  const [apiKey, setApiKey] = useState<string | null>(null);
  const [showApiKeyModal, setShowApiKeyModal] = useState(false);
  const [systemPrompt, setSystemPrompt] = useState<string>("");

  // 세션스토리지에서 API 키 로드 (30분 만료)
  useEffect(() => {
    const savedKey = sessionStorage.getItem(API_KEY_STORAGE_KEY);
    const expiry = sessionStorage.getItem(API_KEY_EXPIRY_KEY);

    if (savedKey && expiry) {
      const expiryTime = parseInt(expiry, 10);
      if (Date.now() < expiryTime) {
        setApiKey(savedKey);
      } else {
        // 만료됨 - 삭제
        sessionStorage.removeItem(API_KEY_STORAGE_KEY);
        sessionStorage.removeItem(API_KEY_EXPIRY_KEY);
      }
    }
  }, []);

  // 시스템 프롬프트 로드
  useEffect(() => {
    fetch(SYSTEM_PROMPT_URL)
      .then((res) => res.text())
      .then((text) => setSystemPrompt(text))
      .catch((err) => console.error("Failed to load system prompt:", err));
  }, []);

  // API 키 저장 핸들러 (30분 후 만료)
  const handleApiKeySubmit = (key: string) => {
    setApiKey(key);
    const expiryTime = Date.now() + API_KEY_TTL_MS;
    sessionStorage.setItem(API_KEY_STORAGE_KEY, key);
    sessionStorage.setItem(API_KEY_EXPIRY_KEY, expiryTime.toString());
  };
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [currentAnswer, setCurrentAnswer] = useState("");
  const [currentStatus, setCurrentStatus] = useState("");
  const [error, setError] = useState<string | null>(null);

  const abortControllerRef = useRef<AbortController | null>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  // 스크롤 맨 아래로
  const scrollToBottom = useCallback(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, currentAnswer, scrollToBottom]);

  // 스트림 업데이트 핸들러
  const handleStreamUpdate = useCallback((message: StreamMessage) => {
    switch (message.type) {
      case "status": {
        const { statusKey, toolName } = message.metadata ?? {};
        // answer_complete는 무시
        if (statusKey === "answer_complete") break;
        const displayMessage = getStatusMessage(statusKey, toolName);
        setCurrentStatus(displayMessage);
        break;
      }
      case "answer":
        setCurrentAnswer((prev) => prev + message.content);
        setCurrentStatus("");
        break;
      case "error":
        setError(message.content || message.title || "오류가 발생했습니다.");
        setIsLoading(false);
        break;
    }
  }, []);

  // 메시지 전송
  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();

    if (!input.trim() || isLoading) return;

    // API 키 없으면 모달 표시
    if (!apiKey) {
      setShowApiKeyModal(true);
      return;
    }

    const question = input.trim();
    setInput("");
    setError(null);
    setCurrentAnswer("");
    setCurrentStatus("");
    setIsLoading(true);

    // 사용자 메시지 추가
    const newUserMessage: ChatMessage = { role: "user", content: question };
    setMessages((prev) => [...prev, newUserMessage]);

    // AbortController 생성
    abortControllerRef.current = new AbortController();

    try {
      // 이전 대화 히스토리 구성
      const previousMessages: Message[] = messages.map((msg) => ({
        role: msg.role,
        content: msg.content,
      }));

      await aiSearchService.streamSearch({
        apiKey,
        question,
        messages: previousMessages,
        additionalSystemPrompt: systemPrompt || undefined,
        onUpdate: handleStreamUpdate,
        signal: abortControllerRef.current.signal,
      });
    } catch (err) {
      if ((err as Error).name === "AbortError") {
        // 사용자가 중단한 경우 - 현재까지의 답변에 중단 표시 추가
        setCurrentAnswer((prev) => prev ? prev + "\n\n(중단됨)" : "");
      } else {
        setError((err as Error).message || "오류가 발생했습니다.");
      }
    } finally {
      setIsLoading(false);
      setCurrentStatus("");
      abortControllerRef.current = null;
    }
  };

  // 스트리밍 완료 여부 추적
  const wasLoadingRef = useRef(false);

  // 스트리밍 완료 시 메시지 추가 (useEffect로 처리)
  useEffect(() => {
    // 로딩이 끝났을 때
    if (wasLoadingRef.current && !isLoading) {
      if (currentAnswer) {
        // 정상 응답
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: currentAnswer },
        ]);
        setCurrentAnswer("");
      } else if (!error) {
        // 빈 응답이고 에러도 없으면 fallback 메시지
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: AI_SEARCH_FALLBACK_MESSAGE },
        ]);
      }
    }
    wasLoadingRef.current = isLoading;
  }, [isLoading, currentAnswer, error]);

  // 요청 중단
  const handleStop = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
  };

  // 대화 초기화
  const handleClear = () => {
    setMessages([]);
    setCurrentAnswer("");
    setCurrentStatus("");
    setError(null);
  };

  // API 키 변경
  const handleApiKeyChange = () => {
    setShowApiKeyModal(true);
  };

  // Enter로 전송 (Shift+Enter는 줄바꿈)
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

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
            className="rounded-full"
          />
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-sky-600 dark:text-sky-400">ARONA</h1>
              <Badge variant="secondary" className="text-xs">Beta</Badge>
            </div>
            <p className="text-sm text-muted-foreground">
              블루 아카이브 AI 비서
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handleApiKeyChange}>
            <Key className="h-4 w-4 mr-1" />
            {apiKey ? "키 변경" : "키 설정"}
          </Button>
          {messages.length > 0 && (
            <Button variant="outline" size="sm" onClick={handleClear}>
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
            {messages.length === 0 && !currentAnswer && !isLoading ? (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <Image
                  src="/arona.webp"
                  alt="ARONA"
                  width={80}
                  height={80}
                  className="rounded-full mb-4"
                />
                <p className="text-lg font-medium mb-3">선생님, 무엇을 도와드릴까요?</p>
                <div className="text-sm text-muted-foreground space-y-1 mb-4">
                  <p>🔍 <strong>학생 검색</strong> - 이름이나 별명으로 학생을 찾아요</p>
                  <p>📋 <strong>스킬 설명</strong> - 학생의 스킬과 능력을 설명해요</p>
                  <p>⚔️ <strong>데미지 계산</strong> - 특정 조건에서 데미지/힐량을 계산해요</p>
                  <p>👹 <strong>보스 정보</strong> - 총력전/대결전 보스 정보를 알려줘요</p>
                </div>
                {!apiKey && (
                  <Button className="mt-2" onClick={() => setShowApiKeyModal(true)}>
                    <Key className="h-4 w-4 mr-2" />
                    API 키 설정하기
                  </Button>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                {messages.map((msg, idx) => (
                  <div
                    key={idx}
                    className={`flex gap-2 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                  >
                    {msg.role === "assistant" && (
                      <Image
                        src="/arona.webp"
                        alt="ARONA"
                        width={32}
                        height={32}
                        className="rounded-full flex-shrink-0 mt-1"
                      />
                    )}
                    <div
                      className={`max-w-[80%] rounded-lg px-4 py-2 ${
                        msg.role === "user"
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted"
                      }`}
                    >
                      {msg.role === "assistant" ? (
                        <div className="prose prose-sm dark:prose-invert max-w-none">
                          <ReactMarkdown remarkPlugins={[remarkGfm]}>
                            {msg.content}
                          </ReactMarkdown>
                        </div>
                      ) : (
                        <p className="whitespace-pre-wrap">{msg.content}</p>
                      )}
                    </div>
                  </div>
                ))}

                {/* 현재 스트리밍 중인 답변 */}
                {(currentAnswer || currentStatus) && (
                  <div className="flex gap-2 justify-start">
                    <Image
                      src="/arona.webp"
                      alt="ARONA"
                      width={32}
                      height={32}
                      className="rounded-full flex-shrink-0 mt-1"
                    />
                    <div className="max-w-[80%] rounded-lg px-4 py-2 bg-muted">
                      {currentStatus && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                          <Loader2 className="h-4 w-4 animate-spin" />
                          {currentStatus}
                        </div>
                      )}
                      {currentAnswer && (
                        <div className="prose prose-sm dark:prose-invert max-w-none">
                          <ReactMarkdown remarkPlugins={[remarkGfm]}>
                            {currentAnswer}
                          </ReactMarkdown>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* 에러 메시지 */}
                {error && (
                  <div className="flex justify-center">
                    <div className="bg-destructive/10 text-destructive rounded-lg px-4 py-2 text-sm">
                      {error}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* 입력 영역 */}
      <form onSubmit={handleSubmit} className="relative">
        <Textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={apiKey ? "질문을 입력하세요..." : "API 키를 먼저 설정해주세요"}
          disabled={isLoading || !apiKey}
          className="min-h-[80px] max-h-[200px] resize-none pr-14 pb-12"
          rows={3}
        />
        <div className="absolute right-3 bottom-3">
          {isLoading ? (
            <Button
              type="button"
              variant="destructive"
              size="icon"
              onClick={handleStop}
              className="h-9 w-9 rounded-full"
            >
              <StopCircle className="h-4 w-4" />
            </Button>
          ) : (
            <Button
              type="submit"
              size="icon"
              disabled={!input.trim() || !apiKey}
              className="h-9 w-9 rounded-full"
            >
              <Send className="h-4 w-4" />
            </Button>
          )}
        </div>
      </form>

      {/* API 키 모달 */}
      <ApiKeyModal
        open={showApiKeyModal}
        onOpenChange={setShowApiKeyModal}
        onSubmit={handleApiKeySubmit}
      />
    </div>
  );
}
