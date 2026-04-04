import { useState, useRef, useCallback, useEffect } from "react";
import { aiSearchService } from "@/lib/ai-search-service";
import type { ChatMessage, Message, StreamMessage } from "@/types/ai-search";
import { getStatusMessage, getToolResultMessage, AI_SEARCH_FALLBACK_MESSAGE } from "@/constants/ai-search";

interface UseChatProps {
  apiKey: string | null;
  personaPrompt: string;
  instructionPrompt: string;
  onApiKeyRequired: () => void;
}

export function useChat({ apiKey, personaPrompt, instructionPrompt, onApiKeyRequired }: UseChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [currentAnswer, setCurrentAnswer] = useState("");
  const [currentStatus, setCurrentStatus] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [actions, setActions] = useState<Array<{ action: string; payload: Record<string, unknown> }>>([]);

  const abortControllerRef = useRef<AbortController | null>(null);
  const wasLoadingRef = useRef(false);

  // 스트림 업데이트 핸들러
  const handleStreamUpdate = useCallback((message: StreamMessage) => {
    switch (message.type) {
      case "status": {
        const { statusKey, toolName } = message.metadata ?? {};
        if (statusKey === "answer_complete") break;
        const displayMessage = getStatusMessage(statusKey, toolName);
        setCurrentStatus(displayMessage);
        break;
      }
      case "mcp_result": {
        const toolName = message.metadata?.tool;
        setCurrentStatus(getToolResultMessage(toolName));
        break;
      }
      case "answer":
        setCurrentAnswer((prev) => prev + message.content);
        setCurrentStatus("");
        break;
      case "action": {
        const actionType = message.metadata?.action;
        const payload = message.metadata?.payload;
        if (actionType && payload) {
          setActions((prev) => [...prev, { action: actionType, payload }]);
        }
        break;
      }
      case "error":
        setError(message.content || message.title || "오류가 발생했습니다.");
        break;
    }
  }, []);

  // 메시지 전송
  const sendMessage = async (e?: React.FormEvent) => {
    e?.preventDefault();

    if (!input.trim() || isLoading) return;

    if (!apiKey) {
      onApiKeyRequired();
      return;
    }

    const question = input.trim();
    setInput("");
    setError(null);
    setCurrentAnswer("");
    setCurrentStatus("");
    setActions([]);
    setIsLoading(true);

    const newUserMessage: ChatMessage = { role: "user", content: question };
    setMessages((prev) => [...prev, newUserMessage]);

    abortControllerRef.current = new AbortController();

    try {
      const previousMessages: Message[] = messages.map((msg) => ({
        role: msg.role,
        content: msg.content,
      }));

      await aiSearchService.streamSearch({
        apiKey,
        question,
        messages: previousMessages,
        personaPrompt: personaPrompt || undefined,
        instructionPrompt: instructionPrompt || undefined,
        onUpdate: handleStreamUpdate,
        signal: abortControllerRef.current.signal,
      });
    } catch (err) {
      if ((err as Error).name === "AbortError") {
        setCurrentAnswer((prev) => (prev ? prev + "\n\n(중단됨)" : ""));
      } else {
        setError((err as Error).message || "오류가 발생했습니다.");
      }
    } finally {
      setIsLoading(false);
      setCurrentStatus("");
      abortControllerRef.current = null;
    }
  };

  // 스트리밍 완료 시 메시지 추가
  useEffect(() => {
    if (wasLoadingRef.current && !isLoading) {
      if (currentAnswer) {
        setMessages((prev) => [...prev, { role: "assistant", content: currentAnswer }]);
        setCurrentAnswer("");
      } else if (!error) {
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: AI_SEARCH_FALLBACK_MESSAGE },
        ]);
      }
    }
    wasLoadingRef.current = isLoading;
  }, [isLoading, currentAnswer, error]);

  // 요청 중단
  const stopGeneration = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
  };

  // 대화 초기화
  const clearChat = () => {
    setMessages([]);
    setCurrentAnswer("");
    setCurrentStatus("");
    setError(null);
    setActions([]);
  };

  return {
    messages,
    input,
    setInput,
    isLoading,
    currentAnswer,
    currentStatus,
    error,
    sendMessage,
    actions,
    stopGeneration,
    clearChat,
  };
}
