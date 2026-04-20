// AI Search 관련 타입 정의

// 메시지 역할
export type MessageRole = "user" | "assistant" | "system" | "tool";

// 대화 메시지
export interface Message {
  role: MessageRole;
  content: string;
}

// SSE 스트림 메시지 타입
export type StreamMessageType = "status" | "answer" | "item_result" | "error";

// 기본 스트림 메시지
interface BaseStreamMessage {
  type: StreamMessageType;
  timestamp?: string;
}

// 상태 키 타입
export type StatusKey = "thinking" | "searching" | "tool_execution" | "answering" | "answer_complete";

// 도구 이름 타입
export type ToolName =
  | "search_students"
  | "get_student_detail"
  | "calculate_field_status"
  | "get_stat_guide"
  | "search_boss_guides"
  | "get_raid_list"
  | "search_parties"
  | "get_raid_summary"
  | "get_character_analysis";

// 상태 메시지 (로딩, 도구 실행 등)
export interface StatusMessage extends BaseStreamMessage {
  type: "status";
  title?: string;
  title_key?: string;
  content?: string;
  metadata?: {
    statusKey?: StatusKey;
    toolName?: ToolName;
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

// Item 결과 메시지 (개별 아이템 단위 카드)
export interface ItemResultMessage extends BaseStreamMessage {
  type: "item_result";
  content?: string;
  metadata?: {
    id?: string;
    tool?: string;
    item?: unknown;
  };
}

// Item 결과 카드 데이터 (답변 본문의 <item-ref id=".."/> 태그가 참조하는 원본)
export interface ItemCardData {
  tool: string;
  item: unknown;
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

// 통합 스트림 메시지 타입
export type StreamMessage =
  | StatusMessage
  | AnswerMessage
  | ItemResultMessage
  | ErrorMessage;

// AI Search 요청 body
export interface AISearchRequest {
  question: string;
  language: "ko";
  fixed_service_ids: string[];
  messages?: Message[];
  persona_prompt?: string;
  instruction_prompt?: string;
}

// 채팅 UI용 메시지 (user/assistant만 사용)
export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  itemResults?: Record<string, ItemCardData>;
}

// 채팅 상태
export interface ChatState {
  isLoading: boolean;
  messages: Message[];
  currentAnswer: string;
  currentStatus: string;
  error: string | null;
}
