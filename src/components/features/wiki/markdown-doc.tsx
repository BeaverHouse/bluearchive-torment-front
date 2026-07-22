"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import type { Components } from "react-markdown";

// Shared renderer for wiki markdown. Explicit element overrides keep the output
// styled regardless of a typography plugin and match the site's look. HTML
// comments are stripped upstream (lib/wiki), so rehype-raw is intentionally off.
const components: Components = {
  h1: ({ children }) => (
    <h1 className="mt-10 mb-4 text-xl font-bold tracking-tight first:mt-0">{children}</h1>
  ),
  h2: ({ children }) => (
    <h2 className="mt-9 mb-3 flex items-center gap-2 border-b pb-2 text-lg font-bold tracking-tight first:mt-0">
      <span className="h-4 w-1 rounded-full bg-primary" />
      {children}
    </h2>
  ),
  h3: ({ children }) => (
    <h3 className="mt-6 mb-2 text-base font-semibold text-foreground/90">{children}</h3>
  ),
  h4: ({ children }) => <h4 className="mt-4 mb-1.5 text-sm font-semibold">{children}</h4>,
  p: ({ children }) => <p className="my-3 text-[15px] leading-7 text-foreground/85">{children}</p>,
  strong: ({ children }) => <strong className="font-semibold text-foreground">{children}</strong>,
  ul: ({ children }) => <ul className="my-3 space-y-1.5 pl-1">{children}</ul>,
  ol: ({ children }) => <ol className="my-3 list-decimal space-y-1.5 pl-5">{children}</ol>,
  li: ({ children }) => (
    <li className="relative pl-5 text-[15px] leading-7 text-foreground/85 marker:text-primary before:absolute before:left-1 before:top-[0.7em] before:h-1.5 before:w-1.5 before:-translate-y-1/2 before:rounded-full before:bg-primary/40 [ol>&]:pl-1 [ol>&]:before:hidden">
      {children}
    </li>
  ),
  blockquote: ({ children }) => (
    <blockquote className="my-4 rounded-r-lg border-l-4 border-primary/50 bg-muted/50 px-4 py-2 text-[15px] text-muted-foreground [&>p]:my-1">
      {children}
    </blockquote>
  ),
  a: ({ href, children }) => (
    <a
      href={href}
      target={href?.startsWith("http") ? "_blank" : undefined}
      rel={href?.startsWith("http") ? "noopener noreferrer" : undefined}
      className="font-medium text-primary underline underline-offset-2 hover:opacity-80"
    >
      {children}
    </a>
  ),
  code: ({ children }) => (
    <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-[0.85em] text-foreground">
      {children}
    </code>
  ),
  hr: () => <hr className="my-8 border-dashed" />,
  table: ({ children }) => (
    <div className="my-5 overflow-x-auto rounded-xl border">
      <table className="w-full border-collapse text-sm">{children}</table>
    </div>
  ),
  thead: ({ children }) => <thead className="bg-muted/70">{children}</thead>,
  tbody: ({ children }) => <tbody className="divide-y">{children}</tbody>,
  tr: ({ children }) => <tr className="even:bg-muted/25">{children}</tr>,
  th: ({ children }) => (
    <th className="whitespace-nowrap px-3 py-2.5 text-left text-xs font-semibold text-muted-foreground">
      {children}
    </th>
  ),
  td: ({ children }) => <td className="px-3 py-2.5 align-top text-foreground/85">{children}</td>,
};

export function MarkdownDoc({ body }: { body: string }) {
  return (
    <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
      {body}
    </ReactMarkdown>
  );
}
