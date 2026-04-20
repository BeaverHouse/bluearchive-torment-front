"use client";

import Image from "next/image";
import { Loader2, ExternalLink } from "lucide-react";
import { type ReactNode } from "react";
import ReactMarkdown, { type Components } from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import { LinkCard } from "@/components/common/inline/link-card";
import { CopyTextCard } from "@/components/common/inline/copy-text-card";
import { CopyAnswerButton } from "@/components/common/copy-answer-button";
import { resolveItemCard } from "@/components/features/ai-search/item-cards/registry";
import type { ChatMessage, ItemCardData } from "@/types/ai-search";

const ITEM_REF_TAG = /<item-ref\s+id="([^"]*)"\s*(?:\/>|><\/item-ref>)/g;

type Segment =
  | { kind: "text"; text: string }
  | { kind: "itemRef"; id: string };

// <item-ref> 태그를 기준으로 본문을 분할. 같은 문단 중간에 인라인으로 박혀 있어도
// 각 세그먼트를 독립 렌더하면 앞뒤 텍스트가 마크다운으로 온전히 해석된다.
function splitSegments(input: string): Segment[] {
  const segments: Segment[] = [];
  let lastEnd = 0;
  const re = new RegExp(ITEM_REF_TAG.source, "g");
  let match: RegExpExecArray | null;
  while ((match = re.exec(input)) !== null) {
    if (match.index > lastEnd) {
      segments.push({ kind: "text", text: input.slice(lastEnd, match.index) });
    }
    segments.push({ kind: "itemRef", id: match[1] });
    lastEnd = re.lastIndex;
  }
  if (lastEnd < input.length) {
    segments.push({ kind: "text", text: input.slice(lastEnd) });
  }
  return segments;
}

function nodeToText(node: ReactNode): string {
  if (node === null || node === undefined || typeof node === "boolean") return "";
  if (typeof node === "string" || typeof node === "number") return String(node);
  if (Array.isArray(node)) return node.map(nodeToText).join("");
  if (typeof node === "object" && "props" in node) {
    return nodeToText((node as { props: { children?: ReactNode } }).props.children);
  }
  return "";
}

function buildTextComponents(): Components {
  const extended = {
    a: ({ href, children }: { href?: string; children?: ReactNode }) => (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1 text-blue-600 dark:text-blue-400 underline underline-offset-2 hover:text-blue-800 dark:hover:text-blue-300 font-medium"
      >
        {children}
        <ExternalLink className="h-3 w-3 flex-shrink-0" />
      </a>
    ),
    "open-link": ({ children }: { children?: ReactNode }) => {
      const url = nodeToText(children).trim();
      if (!url) return null;
      return <LinkCard url={url} />;
    },
    "copy-text": ({ children }: { children?: ReactNode }) => {
      const text = nodeToText(children);
      if (!text.trim()) return null;
      return <CopyTextCard text={text} />;
    },
  } as unknown as Components;
  return extended;
}

function renderAssistant(content: string, itemResults?: Record<string, ItemCardData>) {
  const segments = splitSegments(content);
  const components = buildTextComponents();
  return (
    <div className="prose prose-sm dark:prose-invert max-w-none">
      {segments.map((seg, i) => {
        if (seg.kind === "text") {
          if (!seg.text.trim()) return null;
          return (
            <ReactMarkdown
              key={i}
              remarkPlugins={[remarkGfm]}
              rehypePlugins={[rehypeRaw]}
              components={components}
            >
              {seg.text}
            </ReactMarkdown>
          );
        }
        const data = itemResults?.[seg.id];
        if (!data) return null;
        const render = resolveItemCard(data.tool);
        if (!render) return null;
        return (
          <div key={i} className="not-prose my-3">
            {render(data.item)}
          </div>
        );
      })}
    </div>
  );
}

interface ChatMessagesProps {
  messages: ChatMessage[];
  currentAnswer: string;
  currentItemResults: Record<string, ItemCardData>;
  currentStatus: string;
  error: string | null;
}

export function ChatMessages({
  messages,
  currentAnswer,
  currentItemResults,
  currentStatus,
  error,
}: ChatMessagesProps) {
  return (
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
              className="w-8 h-8 rounded-full flex-shrink-0 mt-1 object-cover"
            />
          )}
          <div
            className={`max-w-[80%] rounded-lg px-4 py-2 ${
              msg.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted"
            }`}
          >
            {msg.role === "assistant" ? (
              <>
                {renderAssistant(msg.content, msg.itemResults)}
                {msg.content && (
                  <div className="flex items-center gap-1 mt-2">
                    <CopyAnswerButton text={msg.content} />
                  </div>
                )}
              </>
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
            className="w-8 h-8 rounded-full flex-shrink-0 mt-1 object-cover"
          />
          <div className="max-w-[80%] rounded-lg px-4 py-2 bg-muted">
            {currentStatus && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                {currentStatus}
              </div>
            )}
            {currentAnswer && renderAssistant(currentAnswer, currentItemResults)}
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
  );
}
