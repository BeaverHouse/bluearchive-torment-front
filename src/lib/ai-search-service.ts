import type { StreamMessage, Message, AISearchRequest } from "@/types/ai-search";

// LLM API Base URL - 환경변수에서 가져오거나 기본값 사용
const LLM_BASE_URL = process.env.NEXT_PUBLIC_LLM_BASE_URL || "http://127.0.0.1:8080";

export interface AISearchStreamOptions {
  apiKey: string;
  question: string;
  messages?: Message[];
  additionalSystemPrompt?: string;
  onUpdate: (message: StreamMessage) => void;
  signal?: AbortSignal;
}

/**
 * AI Search 서비스
 * BYOK (Bring Your Own Key) 방식으로 Gemini API를 사용
 */
class AISearchService {
  /**
   * AI Search 스트리밍 호출
   * /v1/call/free 엔드포인트 사용 (BYOK)
   */
  async streamSearch(options: AISearchStreamOptions): Promise<void> {
    const { apiKey, question, messages, additionalSystemPrompt, onUpdate, signal } = options;

    const apiUrl = `${LLM_BASE_URL}/v1/call/free`;

    // 연결 중 상태 전송
    onUpdate({
      type: "status",
      title: "연결 중...",
      title_key: "connecting",
      content: "",
      timestamp: new Date().toISOString(),
    });

    // 요청 body 구성
    const requestBody: AISearchRequest = {
      question,
      language: "ko",
      fixed_service_ids: ["batorment"],
    };

    // 이전 대화가 있으면 포함
    if (messages && messages.length > 0) {
      requestBody.messages = messages;
    }

    // 추가 시스템 프롬프트
    if (additionalSystemPrompt) {
      requestBody.additional_system_prompt = additionalSystemPrompt;
    }

    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        Accept: "text/event-stream",
        "Content-Type": "application/json",
        "L-Gemini-Key": apiKey,
      },
      body: JSON.stringify(requestBody),
      signal,
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API Error: ${response.status} - ${errorText}`);
    }

    const reader = response.body?.getReader();
    if (!reader) throw new Error("No response body");

    const decoder = new TextDecoder();
    let buffer = "";

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            try {
              const data = JSON.parse(line.slice(6)) as StreamMessage;
              onUpdate(data);
            } catch (parseError) {
              console.error("Error parsing stream data:", parseError, "Line:", line);
            }
          }
        }
      }
    } finally {
      reader.releaseLock();
    }
  }
}

export const aiSearchService = new AISearchService();
