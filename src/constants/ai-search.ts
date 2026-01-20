import type { StatusKey, ToolName } from "@/types/ai-search";

/**
 * 기본 상태별 메시지
 */
export const STATUS_KEY_MESSAGES: Record<StatusKey, string> = {
  thinking: "아로나가 생각하는 중...",
  searching: "아로나가 수소문 하는 중...",
  tool_execution: "아로나가 도구 사용 중...", // toolName 없을 때 fallback
  answer_complete: "",
};

/**
 * MCP 도구별 메시지
 */
export const TOOL_NAME_MESSAGES: Record<ToolName, string> = {
  search_students: "아로나가 학생 명부 찾는 중...",
  get_student_detail: "아로나가 학생 상세 정보 확인 중...",
  calculate_field_status: "아로나가 계산하는 중...",
  get_stat_guide: "아로나가 가이드 확인 중...",
  search_boss_guides: "아로나가 보스 기록 찾는 중...",
};

/**
 * 빈 응답에 대한 fallback 메시지
 */
export const AI_SEARCH_FALLBACK_MESSAGE =
  "선생님, 죄송해요! 아로나가 답변을 준비하지 못했어요. 다시 질문해 주시겠어요?";

/**
 * status key와 tool name에서 표시할 메시지를 반환
 */
export function getStatusMessage(
  statusKey?: StatusKey,
  toolName?: ToolName
): string {
  // tool_execution이고 toolName이 있으면 도구별 메시지
  if (statusKey === "tool_execution" && toolName) {
    return TOOL_NAME_MESSAGES[toolName];
  }

  // statusKey로 찾기
  if (statusKey) {
    return STATUS_KEY_MESSAGES[statusKey];
  }

  // 기본 메시지
  return STATUS_KEY_MESSAGES.thinking;
}
