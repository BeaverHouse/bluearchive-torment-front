import type { StreamMessage, Message, AISearchRequest } from "@/types/ai-search";

// LLM API Base URL - 환경변수에서 가져오거나 기본값 사용
const LLM_BASE_URL = process.env.NEXT_PUBLIC_LLM_BASE_URL || "http://127.0.0.1:8080";

/**
 * A request llm-client refused before streaming. `code` is its error code,
 * such as LLM_BYOK_REQUIRED or LLM_GUEST_CREDIT_EXHAUSTED.
 */
export class AISearchRequestError extends Error {
  constructor(
    readonly status: number,
    readonly code: string,
    message: string,
  ) {
    super(message);
    this.name = "AISearchRequestError";
  }
}

interface AISearchStreamOptions {
  /** The user's own Gemini key. Without it the site's free credit answers. */
  apiKey: string | null;
  question: string;
  messages?: Message[];
  personaPrompt?: string;
  instructionPrompt?: string;
  /** BCP47-ish locale tag forwarded to llm-client; the LLM responds in this language. */
  language?: string;
  onUpdate: (message: StreamMessage) => void;
  signal?: AbortSignal;
}

/**
 * AI Search 서비스
 * 사용자 Gemini 키(BYOK)가 있으면 그 키로, 없으면 사이트 무료 크레딧으로 답한다.
 */
class AISearchService {
  /**
   * AI Search 스트리밍 호출
   * /v1/call/free 엔드포인트 사용
   */
  async streamSearch(options: AISearchStreamOptions): Promise<void> {
    const { apiKey, question, messages, personaPrompt, instructionPrompt, language, onUpdate, signal } = options;

    const apiUrl = `${LLM_BASE_URL}/v1/call/free`;

    const requestBody: AISearchRequest = {
      question,
      language: language ?? "ko",
      fixed_service_ids: ["batorment", "gamewiki"],
    };

    // 이전 대화가 있으면 포함
    if (messages && messages.length > 0) {
      requestBody.messages = messages;
    }

    if (personaPrompt) {
      requestBody.persona_prompt = personaPrompt;
    }
    if (instructionPrompt) {
      requestBody.instruction_prompt = instructionPrompt;
    }

    const headers: Record<string, string> = {
      Accept: "text/event-stream",
      "Content-Type": "application/json",
    };
    if (apiKey) {
      headers["L-Gemini-Key"] = apiKey;
    }

    const response = await fetch(apiUrl, {
      method: "POST",
      headers,
      body: JSON.stringify(requestBody),
      signal,
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new AISearchRequestError(response.status, errorCode(errorText), `API Error: ${response.status} - ${errorText}`);
    }

    const reader = response.body?.getReader();
    if (!reader) throw new Error("No response body");

    const decoder = new TextDecoder();
    let buffer = "";

    try {
      while (true) {
        const { done, value } = await reader.read();

        if (done) {
          buffer += decoder.decode();
        } else {
          buffer += decoder.decode(value, { stream: true });
        }

        const lines = buffer.split("\n");
        buffer = done ? "" : (lines.pop() || "");

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

        if (done) break;
      }
    } finally {
      reader.releaseLock();
    }
  }
}

/** Today's free credit of this site, as llm-client reports it. */
export interface GuestCredit {
  enabled: boolean;
  limit_usd: number;
  remaining_usd: number;
  exhausted: boolean;
  resets_at?: string;
}

/** llm-client tells sites apart by the Origin the browser sends. */
export async function fetchGuestCredit(): Promise<GuestCredit> {
  const response = await fetch(`${LLM_BASE_URL}/v1/free/quota`);
  if (!response.ok) {
    throw new Error(`Guest credit: HTTP ${response.status}`);
  }
  const body = (await response.json()) as { data: GuestCredit };
  return body.data;
}

// llm-client puts the code first in the message: "LLM_BYOK_REQUIRED: ...".
function errorCode(body: string): string {
  try {
    const { message } = JSON.parse(body) as { message?: string };
    return message?.split(":")[0] ?? "";
  } catch {
    return "";
  }
}

export const aiSearchService = new AISearchService();
