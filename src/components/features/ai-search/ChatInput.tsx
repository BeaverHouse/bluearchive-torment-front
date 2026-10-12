"use client";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send, StopCircle } from "lucide-react";

interface ChatInputProps {
  input: string;
  onInputChange: (value: string) => void;
  onSubmit: (e?: React.FormEvent) => void;
  onStop: () => void;
  isLoading: boolean;
  placeholder: string;
  submitLabel: string;
}

export function ChatInput({
  input,
  onInputChange,
  onSubmit,
  onStop,
  isLoading,
  placeholder,
  submitLabel,
}: ChatInputProps) {
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Enter that ends a Korean or Chinese IME composition only commits the
    // character; sending then would leave that character behind in the box.
    if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
      e.preventDefault();
      onSubmit();
    }
  };

  return (
    <form onSubmit={onSubmit} className="relative">
      <Textarea
        value={input}
        onChange={(e) => onInputChange(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        disabled={isLoading}
        className="min-h-[80px] max-h-[200px] resize-none border-sky-200 pr-14 pb-12 dark:border-sky-800"
        rows={3}
      />
      <div className="absolute right-3 bottom-3">
        {isLoading ? (
          <Button
            type="button"
            variant="destructive"
            size="icon"
            onClick={onStop}
            className="h-9 w-9 rounded-full"
          >
            <StopCircle className="h-4 w-4" />
          </Button>
        ) : (
          <Button
            type="submit"
            size="icon"
            disabled={!input.trim()}
            aria-label={submitLabel}
            className="h-9 w-9 rounded-full"
          >
            <Send className="h-4 w-4" />
          </Button>
        )}
      </div>
    </form>
  );
}
