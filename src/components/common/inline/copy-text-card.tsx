"use client";

import { Check, Copy } from "lucide-react";
import { useState } from "react";

interface CopyTextCardProps {
  text: string;
}

export function CopyTextCard({ text }: CopyTextCardProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // Clipboard API may be unavailable (e.g., non-secure context). Silently ignore.
    }
  };

  return (
    <button
      type="button"
      onClick={handleCopy}
      className="not-prose mx-0.5 inline-flex max-w-full items-center gap-1.5 rounded-md bg-muted px-2 py-0.5 text-sm font-mono align-middle hover:bg-muted/80 transition-colors"
    >
      <span className="truncate">{text}</span>
      {copied ? (
        <Check className="h-3.5 w-3.5 flex-shrink-0 text-green-600" />
      ) : (
        <Copy className="h-3.5 w-3.5 flex-shrink-0 text-muted-foreground" />
      )}
    </button>
  );
}
