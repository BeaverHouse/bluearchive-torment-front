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
import { PyroxeneBadge } from "./PyroxeneBadge";
import { useApiKey } from "./hooks/useApiKey";
import { useChat } from "./hooks/useChat";
import { useTranslations, DEFAULT_LOCALE } from "@/lib/i18n";
import { stripHtmlComments } from "@/lib/wiki";

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
    return stripHtmlComments(text).trim();
  };
  const localized = await tryFetch(locale);
  if (localized) return localized;
  if (locale !== DEFAULT_LOCALE) {
    const fallback = await tryFetch(DEFAULT_LOCALE);
    if (fallback) return fallback;
  }
  return "";
}

interface AISearchChatProps {
  embedded?: boolean;
  /** A question asked elsewhere (the home page), sent once the prompts load. */
  initialQuestion?: string;
  /** Called after initialQuestion was sent, so the caller can drop it. */
  onInitialQuestionSent?: () => void;
}

export function AISearchChat({ embedded = false, initialQuestion, onInitialQuestionSent }: AISearchChatProps = {}) {
  const { t, locale } = useTranslations();
  const [personaPrompt, setPersonaPrompt] = useState<string>("");
  const [instructionPrompt, setInstructionPrompt] = useState<string>("");
  const [promptsLoaded, setPromptsLoaded] = useState(false);
  const initialQuestionSentRef = useRef(false);
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
    creditExhausted,
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
      .catch((err) => console.error("Failed to load prompts:", err))
      .finally(() => setPromptsLoaded(true));
  }, [locale]);

  // The question arrives through the URL, outside this component, and must
  // wait for the prompts so it is answered in Arona's voice.
  useEffect(() => {
    if (!initialQuestion || !promptsLoaded || initialQuestionSentRef.current) return;
    initialQuestionSentRef.current = true;
    sendMessage(undefined, initialQuestion);
    onInitialQuestionSent?.();
  }, [initialQuestion, promptsLoaded, sendMessage, onInitialQuestionSent]);

  const scrollToBottom = useCallback(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, []);

  useEffect(() => {
    if (messages.length > 0 || currentAnswer) scrollToBottom();
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
      {!embedded && <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
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
      </div>}

      <Card className="flex-1 mb-4 overflow-hidden border-sky-200 dark:border-sky-800">
        <CardContent className="p-0 h-full">
          <div className="h-full overflow-y-auto p-4" ref={scrollAreaRef}>
            {isEmpty ? (
              <EmptyState
                hasApiKey={!!apiKey}
                onSetupApiKey={openApiKeyModal}
                showSetupAction={!embedded}
              />
            ) : (
              <ChatMessages
                messages={messages}
                currentAnswer={currentAnswer}
                currentItemResults={currentItemResults}
                currentSourceResults={currentSourceResults}
                currentStatus={currentStatus}
                error={error}
                creditExhausted={creditExhausted}
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
        placeholder={t("arona.placeholder.ready")}
        submitLabel={t("home.ask.submit")}
      />

      <div className="mt-2 flex min-h-8 items-center justify-between gap-3 text-xs text-muted-foreground">
        {embedded ? (
          <div className="flex items-center gap-2">
            <PyroxeneBadge />
            <Button variant="ghost" size="sm" onClick={openApiKeyModal}>
              <Key className="mr-1 h-4 w-4" />
              {apiKey ? t("arona.keyChange") : t("arona.keySet")}
            </Button>
            {messages.length > 0 && (
              <Button variant="ghost" size="sm" onClick={clearChat}>
                <Trash2 className="mr-1 h-4 w-4" />
                {t("arona.reset")}
              </Button>
            )}
          </div>
        ) : <PyroxeneBadge />}
        <span>
          Powered by{" "}
          <a
            href="https://tinyclover.com"
            target="_blank"
            rel="noopener noreferrer"
            className="underline underline-offset-2 transition-colors hover:text-foreground"
          >
            🍀 Tiny Clover
          </a>
        </span>
      </div>

      <ApiKeyModal
        open={showApiKeyModal}
        onOpenChange={setShowApiKeyModal}
        onSubmit={saveApiKey}
      />
    </div>
  );
}
