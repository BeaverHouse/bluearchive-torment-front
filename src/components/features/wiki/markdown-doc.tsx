"use client";

import { Children, isValidElement, type ReactNode } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import type { Components } from "react-markdown";
import { CharacterImage } from "@/components/common/character-image";
import { VideoEmbed } from "@/components/features/video/video-embed";
import { useStudentMaps } from "@/hooks/use-student-maps";
import { parseVideoReference } from "@/types/video";

interface MarkdownLinkProps {
  href?: string;
  children?: ReactNode;
}

function nodeText(node: ReactNode): string {
  if (typeof node === "string" || typeof node === "number") return String(node);
  if (Array.isArray(node)) return node.map(nodeText).join("");
  if (isValidElement<{ children?: ReactNode }>(node)) return nodeText(node.props.children);
  return "";
}

function singleVideo(children: ReactNode) {
  const nodes = Children.toArray(children);
  if (nodes.length !== 1 || !isValidElement<MarkdownLinkProps>(nodes[0])) return null;

  const href = nodes[0].props.href;
  if (!href) return null;
  const video = parseVideoReference(href);
  if (!video) return null;

  return {
    link: nodes[0],
    title: nodeText(nodes[0].props.children) || "Video",
    ...video,
  };
}

function normalizedStudentName(name: string): string {
  return name
    .replace(/\\?\*/g, "＊")
    .replace(/\s+/g, "")
    .trim();
}

function PartyBlockquote({ children }: { children?: ReactNode }) {
  const { studentSearchMap, isLoaded } = useStudentMaps();
  const text = nodeText(children).trim();
  const partyLines = text.split(/\n+/).map((line) =>
    line
      .split(/[·/]/)
      .map((name) => name.trim())
      .filter(Boolean),
  );

  const studentIdByName = new Map(
    Object.entries(studentSearchMap).map(([id, student]) => [
      normalizedStudentName(student.nameKo),
      id,
    ]),
  );
  const parties = partyLines.map((names) =>
    names.map((name) => ({
      id: studentIdByName.get(normalizedStudentName(name)),
      name,
    })),
  );
  const isParty =
    isLoaded &&
    parties.length > 0 &&
    parties.every(
      (students) =>
        students.length === 6 &&
        students.every((student) => student.id !== undefined),
    );

  if (!isParty) {
    return (
      <blockquote className="my-4 whitespace-normal break-words rounded-r-lg border-l-4 border-primary/50 bg-muted/50 px-4 py-2 text-[15px] text-muted-foreground [&>p]:my-1">
        {children}
      </blockquote>
    );
  }

  return (
    <blockquote className="my-4 space-y-2 rounded-xl border border-primary/15 bg-muted/35 p-2 sm:p-3">
      {parties.map((students, partyIndex) => (
        <div key={partyIndex} className="grid grid-cols-6 gap-1.5 sm:gap-2">
          {students.map((student, index) => (
            <div
              key={`${student.id}-${index}`}
              className="min-w-0 text-center"
            >
              <div className="relative mx-auto aspect-square w-full max-w-14 overflow-hidden rounded-lg bg-background">
                <CharacterImage
                  studentId={student.id!}
                  alt={student.name}
                  fill
                  className="object-cover"
                />
              </div>
              <span className="mt-1 block break-keep text-[10px] leading-tight text-foreground/80 sm:text-xs">
                {student.name}
              </span>
            </div>
          ))}
        </div>
      ))}
    </blockquote>
  );
}

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
  p: ({ children }) => {
    const video = singleVideo(children);
    if (video) {
      return (
        <figure className="my-5 overflow-hidden rounded-2xl border bg-card shadow-sm">
          <VideoEmbed
            videoId={video.video_id}
            platform={video.platform}
            title={video.title}
          />
          <figcaption className="border-t bg-muted/25 px-4 py-3 text-sm font-medium leading-6">
            {video.link}
          </figcaption>
        </figure>
      );
    }
    return <p className="my-3 text-[15px] leading-7 text-foreground/85">{children}</p>;
  },
  strong: ({ children }) => <strong className="font-semibold text-foreground">{children}</strong>,
  ul: ({ children }) => <ul className="my-3 space-y-1.5 pl-1">{children}</ul>,
  ol: ({ children }) => <ol className="my-3 list-decimal space-y-1.5 pl-5">{children}</ol>,
  li: ({ children }) => (
    <li className="relative pl-5 text-[15px] leading-7 text-foreground/85 marker:text-primary before:absolute before:left-1 before:top-[0.7em] before:h-1.5 before:w-1.5 before:-translate-y-1/2 before:rounded-full before:bg-primary/40 [ol>&]:pl-1 [ol>&]:before:hidden">
      {children}
    </li>
  ),
  blockquote: ({ children }) => <PartyBlockquote>{children}</PartyBlockquote>,
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
