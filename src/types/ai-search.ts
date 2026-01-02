// AI Search 관련 타입 정의

// 메시지 역할
export type MessageRole = "user" | "assistant" | "system" | "tool";

// 대화 메시지
export interface Message {
  role: MessageRole;
  content: string;
}

// SSE 스트림 메시지 타입
export type StreamMessageType = "status" | "answer" | "mcp_result" | "error" | "action";

// 기본 스트림 메시지
interface BaseStreamMessage {
  type: StreamMessageType;
  timestamp?: string;
}

// 상태 메시지 (로딩, 도구 실행 등)
export interface StatusMessage extends BaseStreamMessage {
  type: "status";
  title?: string;
  title_key?: string;
  content?: string;
  metadata?: {
    statusKey?: string;
    sessionID?: string;
    tool?: string;
    errorKey?: string;
  };
}

// 답변 메시지 (스트리밍)
export interface AnswerMessage extends BaseStreamMessage {
  type: "answer";
  content: string;
}

// MCP 결과 메시지
export interface MCPResultMessage extends BaseStreamMessage {
  type: "mcp_result";
  tool?: string;
  result?: unknown;
  render_type?: "raw" | "json" | "table" | "list";
}

// 에러 메시지
export interface ErrorMessage extends BaseStreamMessage {
  type: "error";
  title?: string;
  title_key?: string;
  content?: string;
  metadata?: {
    errorKey?: string;
  };
}

// 액션 메시지 (사용자 확인 필요)
export interface ActionMessage extends BaseStreamMessage {
  type: "action";
  action?: string;
  payload?: Record<string, unknown>;
  require_confirmation?: boolean;
}

// 통합 스트림 메시지 타입
export type StreamMessage =
  | StatusMessage
  | AnswerMessage
  | MCPResultMessage
  | ErrorMessage
  | ActionMessage;

// AI Search 요청 body
export interface AISearchRequest {
  question: string;
  language: "ko";
  fixed_service_id: "batorment";
  messages?: Message[];
  additional_system_prompt?: string;
}

// 채팅 상태
export interface ChatState {
  isLoading: boolean;
  messages: Message[];
  currentAnswer: string;
  currentStatus: string;
  error: string | null;
}
