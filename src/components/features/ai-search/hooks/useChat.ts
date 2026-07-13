import { useState, useRef, useCallback, useEffect } from "react";
import { aiSearchService } from "@/lib/ai-search-service";
import type {
  ChatMessage,
  ItemCardData,
  Message,
  SourceData,
  StreamMessage,
} from "@/types/ai-search";
import { getStatusMessageKey, getToolResultMessageKey, AI_SEARCH_FALLBACK_KEY } from "@/constants/ai-search";
import { trackEvent } from "@/utils/analytics";
import { useTranslations } from "@/lib/i18n";

interface UseChatProps {
  apiKey: string | null;
  personaPrompt: string;
  instructionPrompt: string;
  language: string;
  onApiKeyRequired: () => void;
}

export function useChat({ apiKey, personaPrompt, instructionPrompt, language, onApiKeyRequired }: UseChatProps) {
  const { t } = useTranslations();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [currentAnswer, setCurrentAnswer] = useState("");
  const [currentItemResults, setCurrentItemResults] = useState<Record<string, ItemCardData>>({});
  const [currentSourceResults, setCurrentSourceResults] = useState<Record<string, SourceData>>({});
  const [currentStatus, setCurrentStatus] = useState("");
  // 표시됐던 진행 단계 문구를 순서대로 누적 — 완료된 답변에 접힌 "진행
  // 과정"으로 붙인다.
  const [currentSteps, setCurrentSteps] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  const abortControllerRef = useRef<AbortController | null>(null);
  const wasLoadingRef = useRef(false);

  // 스트림 업데이트 핸들러
  const handleStreamUpdate = useCallback((message: StreamMessage) => {
    switch (message.type) {
      case "status": {
        const { statusKey, toolName } = message.metadata ?? {};
        if (statusKey === "answer_complete") break;
        const tkey = getStatusMessageKey(statusKey, toolName);
        const label = tkey ? t(tkey) : "";
        setCurrentStatus(label);
        if (label) setCurrentSteps((prev) => [...prev, label]);
        break;
      }
      case "item_result": {
        const { id, tool, item } = message.metadata ?? {};
        // <item-ref .../> 태그는 LLM Client의 answer 청크에 이미 인라인으로 들어 있다.
        // 여기서는 카드 원본 페이로드만 맵에 저장하고, answer 문자열은 건드리지 않는다.
        if (id) {
          setCurrentItemResults((prev) => ({
            ...prev,
            [id]: { tool: tool ?? "", item },
          }));
        }
        setCurrentStatus(t(getToolResultMessageKey(tool)));
        break;
      }
      case "source_result": {
        // 웹 출처 payload (B3). 같은 id 재수신 = 갱신(교체).
        const meta = message.metadata ?? {};
        if (meta.id) {
          const id = meta.id;
          setCurrentSourceResults((prev) => ({
            ...prev,
            [id]: {
              tool: meta.tool ?? "",
              origin: meta.origin ?? "tool",
              title: meta.title ?? "",
              url: meta.url ?? "",
              snippet: meta.snippet ?? "",
            },
          }));
        }
        break;
      }
      case "answer":
        setCurrentAnswer((prev) => prev + message.content);
        setCurrentStatus("");
        break;
      case "error":
        setError(message.content || message.title || t("arona.error.generic"));
        break;
    }
  }, [t]);

  // 메시지 전송
  const sendMessage = async (e?: React.FormEvent) => {
    e?.preventDefault();

    if (!input.trim() || isLoading) return;

    if (!apiKey) {
      trackEvent("arona_query_send", { has_api_key: false });
      onApiKeyRequired();
      return;
    }

    trackEvent("arona_query_send", { has_api_key: true });
    const question = input.trim();
    setInput("");
    setError(null);
    setCurrentAnswer("");
    setCurrentItemResults({});
    setCurrentSourceResults({});
    setCurrentStatus("");
    setCurrentSteps([]);
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
        language,
        onUpdate: handleStreamUpdate,
        signal: abortControllerRef.current.signal,
      });
    } catch (err) {
      if ((err as Error).name === "AbortError") {
        setCurrentAnswer((prev) => (prev ? prev + `\n\n${t("arona.error.aborted")}` : ""));
      } else {
        setError((err as Error).message || t("arona.error.generic"));
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
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content: currentAnswer,
            itemResults: Object.keys(currentItemResults).length > 0 ? currentItemResults : undefined,
            sourceResults: Object.keys(currentSourceResults).length > 0 ? currentSourceResults : undefined,
            steps: currentSteps.length > 0 ? currentSteps : undefined,
          },
        ]);
        setCurrentAnswer("");
        setCurrentItemResults({});
        setCurrentSourceResults({});
        setCurrentSteps([]);
      } else if (!error) {
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: t(AI_SEARCH_FALLBACK_KEY) },
        ]);
      }
    }
    wasLoadingRef.current = isLoading;
  }, [isLoading, currentAnswer, currentItemResults, currentSourceResults, currentSteps, error, t]);

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
    setCurrentItemResults({});
    setCurrentSourceResults({});
    setCurrentStatus("");
    setCurrentSteps([]);
    setError(null);
  };

  return {
    messages,
    input,
    setInput,
    isLoading,
    currentAnswer,
    currentItemResults,
    currentSourceResults,
    currentStatus,
    error,
    sendMessage,
    stopGeneration,
    clearChat,
  };
}
