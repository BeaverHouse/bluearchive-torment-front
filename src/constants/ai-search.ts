import type { StatusKey, ToolName } from "@/types/ai-search";

// Translation keys for ARONA chat status / tool messages. The actual
// rendering happens through useTranslations in the consumer (useChat).

const STATUS_KEY_TO_TKEY: Record<StatusKey, string | null> = {
  thinking: "arona.status.thinking",
  searching: "arona.status.searching",
  tool_execution: "arona.status.tool",
  answering: "arona.status.answering",
  answer_complete: null,
};

const TOOL_NAME_TO_TKEY: Record<ToolName, string> = {
  search_students: "arona.tool.search_students",
  get_student_detail: "arona.tool.get_student_detail",
  calculate_field_status: "arona.tool.calculate_field_status",
  wiki_index: "arona.tool.wiki_index",
  wiki_search: "arona.tool.wiki_search",
  wiki_read: "arona.tool.wiki_read",
  get_raid_list: "arona.tool.get_raid_list",
  search_parties: "arona.tool.search_parties",
  get_raid_summary: "arona.tool.get_raid_summary",
  get_character_analysis: "arona.tool.get_character_analysis",
};

const TOOL_RESULT_TO_TKEY: Partial<Record<ToolName, string>> = {
  search_students: "arona.toolDone.search_students",
  get_student_detail: "arona.toolDone.get_student_detail",
  calculate_field_status: "arona.toolDone.calculate_field_status",
  wiki_index: "arona.toolDone.wiki_index",
  wiki_search: "arona.toolDone.wiki_search",
  wiki_read: "arona.toolDone.wiki_read",
  get_raid_list: "arona.toolDone.get_raid_list",
  search_parties: "arona.toolDone.search_parties",
  get_raid_summary: "arona.toolDone.get_raid_summary",
  get_character_analysis: "arona.toolDone.get_character_analysis",
};

export const AI_SEARCH_FALLBACK_KEY = "arona.fallback";

export function getStatusMessageKey(
  statusKey?: StatusKey,
  toolName?: ToolName
): string | null {
  if (statusKey === "tool_execution" && toolName) {
    return TOOL_NAME_TO_TKEY[toolName] ?? null;
  }
  if (statusKey) return STATUS_KEY_TO_TKEY[statusKey];
  return STATUS_KEY_TO_TKEY.thinking;
}

export function getToolResultMessageKey(toolName?: string): string {
  if (toolName && toolName in TOOL_RESULT_TO_TKEY) {
    return TOOL_RESULT_TO_TKEY[toolName as ToolName]!;
  }
  return "arona.toolDone.generic";
}
