"use client";

import Image from "next/image";
import { Loader2 } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

interface ChatMessagesProps {
  messages: ChatMessage[];
  currentAnswer: string;
  currentStatus: string;
  error: string | null;
}

export function ChatMessages({
  messages,
  currentAnswer,
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
              <div className="prose prose-sm dark:prose-invert max-w-none">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>{msg.content}</ReactMarkdown>
              </div>
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
            {currentAnswer && (
              <div className="prose prose-sm dark:prose-invert max-w-none">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>{currentAnswer}</ReactMarkdown>
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
  );
}
