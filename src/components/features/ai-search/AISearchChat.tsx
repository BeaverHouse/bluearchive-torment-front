"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trash2, Key } from "lucide-react";
import { ApiKeyModal } from "./ApiKeyModal";
import { ChatMessages } from "./ChatMessages";
import { ChatInput } from "./ChatInput";
import { EmptyState } from "./EmptyState";
import { useApiKey } from "./hooks/useApiKey";
import { useChat } from "./hooks/useChat";
import { useTranslations, DEFAULT_LOCALE } from "@/lib/i18n";

// Persona/instruction MDs are only authored in Korean for now. en/zh prompts
// will be added later — until then we fall back so non-ko sessions still work.
//
// HTML comments in those files are authoring notes (design rationale, source
// links, which phase the file is injected into). They are for maintainers, not
// the model, so they are stripped before the prompt is sent — otherwise they
// burn tokens and feed the model instructions meant for us.
async function fetchPrompt(kind: "persona" | "instruction", locale: string): Promise<string> {
  const tryFetch = async (lang: string) => {
    const res = await fetch(`/data/${kind}_${lang}.md`);
    if (!res.ok) return null;
    const text = await res.text();
    return text.replace(/<!--[\s\S]*?-->\s*/g, "").trim();
  };
  const localized = await tryFetch(locale);
  if (localized) return localized;
  if (locale !== DEFAULT_LOCALE) {
    const fallback = await tryFetch(DEFAULT_LOCALE);
    if (fallback) return fallback;
  }
  return "";
}

export function AISearchChat({ embedded = false }: { embedded?: boolean } = {}) {
  const { t, locale } = useTranslations();
  const [personaPrompt, setPersonaPrompt] = useState<string>("");
  const [instructionPrompt, setInstructionPrompt] = useState<string>("");
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  const {
    apiKey,
    showApiKeyModal,
    saveApiKey,
    refreshApiKey,
    openApiKeyModal,
    setShowApiKeyModal,
  } = useApiKey();

  const {
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
  } = useChat({
    apiKey,
    personaPrompt,
    instructionPrompt,
    language: locale,
    onApiKeyRequired: openApiKeyModal,
  });

  useEffect(() => {
    Promise.all([fetchPrompt("persona", locale), fetchPrompt("instruction", locale)])
      .then(([persona, instruction]) => {
        setPersonaPrompt(persona);
        setInstructionPrompt(instruction);
      })
      .catch((err) => console.error("Failed to load prompts:", err));
  }, [locale]);

  const scrollToBottom = useCallback(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, currentAnswer, scrollToBottom]);

  const handleSendMessage = useCallback((e?: React.FormEvent) => {
    refreshApiKey();
    sendMessage(e);
  }, [refreshApiKey, sendMessage]);

  const isEmpty = messages.length === 0 && !currentAnswer && !isLoading;

  return (
    <div
      className={
        embedded
          ? "flex flex-col h-[calc(100dvh-330px)] min-h-[420px]"
          : "flex flex-col h-[calc(100vh-200px)] max-w-4xl mx-auto"
      }
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          {embedded ? (
            <div className="flex items-center gap-2">
              <span className="flex items-center gap-1.5 text-sm font-semibold text-sky-600 dark:text-sky-400">
                <Image
                  src="/arona.webp"
                  alt="ARONA"
                  width={22}
                  height={22}
                  className="rounded-full object-cover"
                />
                {t("arona.embedded.title")}
              </span>
              <Badge variant="secondary" className="text-xs">
                Beta
              </Badge>
            </div>
          ) : (
            <>
              <Image
                src="/arona.webp"
                alt="ARONA"
                width={48}
                height={48}
                className="rounded-full object-cover"
              />
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl font-bold text-sky-600 dark:text-sky-400">
                    A.R.O.N.A
                  </h1>
                  <Badge variant="secondary" className="text-xs">
                    Beta
                  </Badge>
                </div>
              </div>
            </>
          )}
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={openApiKeyModal}>
            <Key className="h-4 w-4 mr-1" />
            {apiKey ? t("arona.keyChange") : t("arona.keySet")}
          </Button>
          {messages.length > 0 && (
            <Button variant="outline" size="sm" onClick={clearChat}>
              <Trash2 className="h-4 w-4 mr-1" />
              {t("arona.reset")}
            </Button>
          )}
        </div>
      </div>

      <Card className="flex-1 mb-4 overflow-hidden">
        <CardContent className="p-0 h-full">
          <div className="h-full overflow-y-auto p-4" ref={scrollAreaRef}>
            {isEmpty ? (
              <EmptyState hasApiKey={!!apiKey} onSetupApiKey={openApiKeyModal} />
            ) : (
              <ChatMessages
                messages={messages}
                currentAnswer={currentAnswer}
                currentItemResults={currentItemResults}
                currentSourceResults={currentSourceResults}
                currentStatus={currentStatus}
                error={error}
              />
            )}
          </div>
        </CardContent>
      </Card>

      <ChatInput
        input={input}
        onInputChange={setInput}
        onSubmit={handleSendMessage}
        onStop={stopGeneration}
        isLoading={isLoading}
        disabled={!apiKey}
        placeholder={apiKey ? t("arona.placeholder.ready") : t("arona.placeholder.noKey")}
      />

      <div className="mt-2 text-center text-xs text-muted-foreground">
        Powered by{" "}
        <a
          href="https://tinyclover.com"
          target="_blank"
          rel="noopener noreferrer"
          className="underline underline-offset-2 hover:text-foreground transition-colors"
        >
          🍀 Tiny Clover
        </a>
      </div>

      <ApiKeyModal
        open={showApiKeyModal}
        onOpenChange={setShowApiKeyModal}
        onSubmit={saveApiKey}
      />
    </div>
  );
}
