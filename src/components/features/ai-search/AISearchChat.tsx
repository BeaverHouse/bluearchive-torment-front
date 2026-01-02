"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Send, Loader2, StopCircle, Trash2, Key } from "lucide-react";
import { ApiKeyModal } from "./ApiKeyModal";
import { aiSearchService } from "@/lib/ai-search-service";
import type { Message, StreamMessage } from "@/types/ai-search";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

const API_KEY_STORAGE_KEY = "batorment_gemini_api_key";
const SYSTEM_PROMPT_URL = "/data/prompt_ko.md";

export function AISearchChat() {
  const [apiKey, setApiKey] = useState<string | null>(null);
  const [showApiKeyModal, setShowApiKeyModal] = useState(false);
  const [systemPrompt, setSystemPrompt] = useState<string>("");

  // 로컬스토리지에서 API 키 로드
  useEffect(() => {
    const savedKey = localStorage.getItem(API_KEY_STORAGE_KEY);
    if (savedKey) {
      setApiKey(savedKey);
    }
  }, []);

  // 시스템 프롬프트 로드
  useEffect(() => {
    fetch(SYSTEM_PROMPT_URL)
      .then((res) => res.text())
      .then((text) => setSystemPrompt(text))
      .catch((err) => console.error("Failed to load system prompt:", err));
  }, []);

  // API 키 저장 핸들러
  const handleApiKeySubmit = (key: string) => {
    setApiKey(key);
    localStorage.setItem(API_KEY_STORAGE_KEY, key);
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
      case "status":
        setCurrentStatus(message.title || message.content || "");
        break;
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

  // 스트리밍 완료 시 메시지 추가 (useEffect로 처리)
  useEffect(() => {
    if (!isLoading && currentAnswer) {
      setMessages((prev) => [...prev, { role: "assistant", content: currentAnswer }]);
      setCurrentAnswer("");
    }
  }, [isLoading, currentAnswer]);

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
        <div>
          <h1 className="text-2xl font-bold">AI Search</h1>
          <p className="text-sm text-muted-foreground">
            블루 아카이브 관련 질문을 AI에게 물어보세요
          </p>
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
              <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                <p className="text-lg mb-2">대화를 시작해보세요!</p>
                <p className="text-sm">블루 아카이브 총력전, 캐릭터, 공략 등에 대해 질문할 수 있습니다.</p>
                {!apiKey && (
                  <Button className="mt-4" onClick={() => setShowApiKeyModal(true)}>
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
                    className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                  >
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
                  <div className="flex justify-start">
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
      <form onSubmit={handleSubmit} className="flex gap-2">
        <Textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={apiKey ? "질문을 입력하세요..." : "API 키를 먼저 설정해주세요"}
          disabled={isLoading || !apiKey}
          className="min-h-[60px] max-h-[200px] resize-none"
          rows={2}
        />
        {isLoading ? (
          <Button type="button" variant="destructive" onClick={handleStop} className="shrink-0">
            <StopCircle className="h-4 w-4" />
          </Button>
        ) : (
          <Button type="submit" disabled={!input.trim() || !apiKey} className="shrink-0">
            <Send className="h-4 w-4" />
          </Button>
        )}
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
