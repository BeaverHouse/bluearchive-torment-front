"use client";

import { useState } from "react";
import { Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";

interface CopyAnswerButtonProps {
  text: string;
  label?: string;
  copiedLabel?: string;
}

// Encode a URL so unsafe characters (spaces, non-ASCII) survive copy-paste.
// Spaces in path/query become %20; already-encoded tokens are left alone via encodeURI.
function safeEncodeUrl(raw: string): string {
  const trimmed = raw.trim();
  try {
    return new URL(trimmed).toString();
  } catch {
    return encodeURI(trimmed);
  }
}

// Strip inline custom tags so the clipboard gets clean, paste-safe prose:
// - <copy-text>088</copy-text>              → 088
// - <open-link>https://a b</open-link>      → (surrounded by spaces) https://a%20b
// - <item-ref id="a1"/>                     → removed (card data lives outside the text stream)
function stripInlineTags(raw: string): string {
  return raw
    .replace(/<copy-text>([\s\S]*?)<\/copy-text>/g, "$1")
    .replace(/\s*<open-link>([\s\S]*?)<\/open-link>\s*/g, (_m, url) => ` ${safeEncodeUrl(url)} `)
    .replace(/<item-ref\s+id="[^"]*"\s*\/?>(?:\s*<\/item-ref>)?/g, "")
    .replace(/[ \t]{2,}/g, " ")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

const ATTRIBUTION = "🌸 — A.R.O.N.A (https://bluearchive-torment.netlify.app)";

export function CopyAnswerButton({
  text,
  label = "답변 복사",
  copiedLabel = "복사됨!",
}: CopyAnswerButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    const cleaned = stripInlineTags(text);
    const textWithAttribution = `${cleaned}\n\n${ATTRIBUTION}`;
    navigator.clipboard.writeText(textWithAttribution);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      className="h-7 w-7"
      onClick={handleCopy}
      title={copied ? copiedLabel : label}
    >
      {copied ? (
        <Check className="w-4 h-4 text-green-500" />
      ) : (
        <Copy className="w-4 h-4 text-muted-foreground" />
      )}
    </Button>
  );
}
