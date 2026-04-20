"use client";

import { ExternalLink } from "lucide-react";

interface LinkCardProps {
  url: string;
}

export function LinkCard({ url }: LinkCardProps) {
  let display = url;
  try {
    display = new URL(url).hostname.replace(/^www\./, "");
  } catch {
    // Not a valid absolute URL — fall back to raw value.
  }

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="not-prose mx-0.5 inline-flex max-w-full items-center gap-1.5 rounded-md bg-blue-50 dark:bg-blue-900/20 px-2 py-0.5 text-sm align-middle text-blue-700 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-colors no-underline"
    >
      <ExternalLink className="h-3.5 w-3.5 flex-shrink-0" />
      <span className="truncate">{display}</span>
    </a>
  );
}
