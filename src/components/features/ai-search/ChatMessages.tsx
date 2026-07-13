"use client";

import Image from "next/image";
import { Check, ChevronDown, ChevronRight, Loader2, ExternalLink } from "lucide-react";
import { useId, useState, type ReactNode } from "react";
import ReactMarkdown, { type Components } from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import { LinkCard } from "@/components/common/inline/link-card";
import { CopyTextCard } from "@/components/common/inline/copy-text-card";
import { CopyAnswerButton } from "@/components/common/copy-answer-button";
import {
  resolveItemCard,
  resolveItemSummary,
} from "@/components/features/ai-search/item-cards/registry";
import { useTranslations } from "@/lib/i18n";
import type { ChatMessage, ItemCardData, SourceData } from "@/types/ai-search";

// <item-ref id="..."/> (데이터 카드) 와 <source-ref id="..."/> (웹 출처, B3).
const REF_TAG = /<(item|source)-ref\s+id="([^"]*)"\s*(?:\/>|><\/(?:item|source)-ref>)/g;

// 근거 항목이 이 수 이상이면 풀 카드 대신 한 줄 요약 리스트로 렌더한다.
const COMPACT_REFS_THRESHOLD = 5;

// B2: 근거 카드의 종류 라벨 (도구명 → i18n 키).
const ITEM_TOOL_LABEL_KEYS: Record<string, string> = {
  search_students: "arona.refs.student",
  search_parties: "arona.refs.party",
};

interface RefLayout {
  processed: string;
  citedItems: string[];
  citedSources: string[];
  sourceOrder: string[];
  sourceNo: Record<string, number>;
}

// 본문을 한 번에 스캔해 마커 치환과 번호 부여를 동시에 한다. 태그를 제거하고
// 단일 마크다운 패스로 렌더하므로 세그먼트 분할로 ordered list 번호가
// 리셋되던 문제가 구조적으로 사라진다 (web-tiny-clover와 동일 계약).
function layoutRefs(
  content: string,
  sourceResults: Record<string, SourceData> | undefined,
): RefLayout {
  const citedItems: string[] = [];
  const itemNo: Record<string, number> = {};
  const citedSources: string[] = [];
  const sourceNo: Record<string, number> = {};

  const processed = content.replace(REF_TAG, (_m, kind: string, id: string) => {
    if (kind === "item") {
      if (!(id in itemNo)) {
        citedItems.push(id);
        itemNo[id] = citedItems.length;
      }
      return `<ref-marker kind="item" refid="${id}" n="${itemNo[id]}"></ref-marker>`;
    }
    if (!(id in sourceNo)) {
      citedSources.push(id);
      sourceNo[id] = citedSources.length;
    }
    return `<ref-marker kind="source" refid="${id}" n="${sourceNo[id]}"></ref-marker>`;
  });

  // 인용되지 않은 출처(그라운딩은 모델이 태그를 넣지 않는다)도 목록에 포함.
  const sourceOrder = [...citedSources];
  if (sourceResults) {
    const uncited = Object.keys(sourceResults)
      .filter((id) => !(id in sourceNo))
      .sort((a, b) => Number(a.replace(/\D/g, "")) - Number(b.replace(/\D/g, "")));
    for (const id of uncited) {
      sourceOrder.push(id);
      sourceNo[id] = sourceOrder.length;
    }
  }

  return { processed, citedItems, citedSources, sourceOrder, sourceNo };
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

// CommonMark의 CJK 인접 강조 버그 우회: 닫는 **가 한글 등 문자 앞에 붙으면
// (예: **'쮸글마리'**라는) 강조가 닫히지 못해 별표가 리터럴로 노출된다.
// 코드 스팬/펜스 밖의 **강조**를 <strong>으로 직접 치환한다 (rehypeRaw가 렌더).
// 한계: 코드 스팬을 품은 강조(**a `b` c**)는 스팬 보존 split에 짝이 갈려
// 미치환 — 원 파서 동작 그대로 남는다(악화 없음).
function fixCjkStrongEmphasis(text: string): string {
  // 경계 비공백 요구: CommonMark가 무효 처리하는 "** 공백 감싼 **"까지
  // 굵게 만들지 않는다.
  return text
    .split(/(```[\s\S]*?```|`[^`\n]*`)/g)
    .map((seg, i) =>
      i % 2 === 1
        ? seg
        : seg.replace(/\*\*(\S(?:[^*\n]*?\S)?)\*\*/g, "<strong>$1</strong>"),
    )
    .join("");
}

function sourceDisplayTitle(src: SourceData): string {
  if (src.title) return src.title;
  try {
    return new URL(src.url).hostname.replace(/^www\./, "");
  } catch {
    return src.url;
  }
}

function AssistantMarkdown({
  content,
  itemResults,
  sourceResults,
}: {
  content: string;
  itemResults?: Record<string, ItemCardData>;
  sourceResults?: Record<string, SourceData>;
}) {
  const { t } = useTranslations();
  const anchor = useId().replace(/[^a-zA-Z0-9_-]/g, "");
  // 미인용 출처는 접힘이 기본 — 검색 잔여물이 출처 목록을 도배하지 않게.
  const [showUncitedSources, setShowUncitedSources] = useState(false);
  const { processed, citedItems, citedSources, sourceOrder, sourceNo } = layoutRefs(
    content,
    sourceResults,
  );

  const refMarker = (props: { kind?: string; refid?: string; n?: string }) => {
    const { kind, refid, n } = props;
    if (!refid || !n) return null;
    // 앵커 대상이 실제로 렌더될 때만 마커를 그린다 (죽은 마커 방지).
    if (kind === "item") {
      const data = itemResults?.[refid];
      if (!data || !resolveItemCard(data.tool)) return null;
    } else if (!sourceResults?.[refid]?.url) {
      return null;
    }
    const target = kind === "item" ? `${anchor}-item-${refid}` : `${anchor}-src-${refid}`;
    const label = kind === "item" ? `[${n}]` : `(${n})`;
    return (
      <a
        href={`#${target}`}
        className="not-prose mx-0.5 inline-flex items-center align-super text-[0.7em] font-medium text-blue-600 dark:text-blue-400 no-underline hover:underline"
      >
        {label}
      </a>
    );
  };

  const components = {
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
    "ref-marker": refMarker,
  } as unknown as Components;

  // B1: 인용된 카드는 본문을 끊지 않고 하단 "근거" 섹션에 1회씩.
  // 항목이 임계값 이상이면 카드 대신 한 줄 요약 리스트 (web과 동일 계약).
  const references = (() => {
    if (!itemResults || citedItems.length === 0) return null;
    const entries = citedItems
      .map((id, i) => ({ id, n: i + 1, data: itemResults[id] }))
      .filter((e) => e.data && resolveItemCard(e.data.tool));
    if (entries.length === 0) return null;
    const compact = entries.length >= COMPACT_REFS_THRESHOLD;
    return (
      <section className="not-prose mt-4 border-t border-border/60 pt-3">
        <h4 className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          {t("arona.refs.title")}
        </h4>
        {compact ? (
          <ol className="space-y-1.5">
            {entries.map(({ id, n, data }) => {
              const labelKey = ITEM_TOOL_LABEL_KEYS[data!.tool];
              const label = labelKey ? t(labelKey) : data!.tool;
              const summary = resolveItemSummary(data!.tool, data!.item);
              return (
                <li key={id} id={`${anchor}-item-${id}`} className="flex items-center gap-2 text-sm">
                  <span className="flex-shrink-0 text-xs font-medium text-blue-600 dark:text-blue-400">
                    [{n}]
                  </span>
                  <span className="min-w-0 truncate">{summary?.title || label}</span>
                  <span className="flex-shrink-0 rounded bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground">
                    {label}
                  </span>
                </li>
              );
            })}
          </ol>
        ) : (
          <div className="space-y-3">
            {entries.map(({ id, n, data }) => {
              const labelKey = ITEM_TOOL_LABEL_KEYS[data!.tool];
              return (
                <div key={id} id={`${anchor}-item-${id}`} className="flex gap-2">
                  <div className="flex flex-col items-center gap-1 pt-1">
                    <span className="text-xs font-medium text-blue-600 dark:text-blue-400">[{n}]</span>
                    <span className="rounded bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground">
                      {labelKey ? t(labelKey) : data!.tool}
                    </span>
                  </div>
                  {/* 카드가 채팅 폭 전체로 늘어지지 않게 상한을 둔다. */}
                  <div className="min-w-0 max-w-xl flex-1">
                    {resolveItemCard(data!.tool)!(data!.item)}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    );
  })();

  // B3: 웹 출처 목록 — 인용된 출처는 항상 표시, 미인용 출처(그라운딩·모델이
  // 태그를 안 단 도구 출처)는 "더 보기" 접힘 뒤에 둔다 (web-tiny-clover와
  // 동일 계약).
  const renderSourceEntry = ({ id, n, src }: { id: string; n: number; src: SourceData }) => (
    <li key={id} id={`${anchor}-src-${id}`} className="flex items-baseline gap-2 text-sm">
      <span className="flex-shrink-0 text-xs font-medium text-blue-600 dark:text-blue-400">({n})</span>
      <div className="min-w-0">
        <a
          href={src.url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex max-w-full items-center gap-1 text-blue-600 dark:text-blue-400 hover:underline"
        >
          <ExternalLink className="h-3 w-3 flex-shrink-0" />
          <span className="truncate">{sourceDisplayTitle(src)}</span>
        </a>
        <span className="ml-2 rounded bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground">
          {src.origin === "grounding" ? t("arona.sources.grounding") : t("arona.sources.web")}
        </span>
        {src.snippet && (
          <p className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">{src.snippet}</p>
        )}
      </div>
    </li>
  );

  const sources = (() => {
    if (!sourceResults || sourceOrder.length === 0) return null;
    const citedSet = new Set(citedSources);
    const entries = sourceOrder
      .map((id) => ({ id, n: sourceNo[id], src: sourceResults[id] }))
      .filter((e): e is { id: string; n: number; src: SourceData } => !!e.src?.url);
    if (entries.length === 0) return null;
    const cited = entries.filter((e) => citedSet.has(e.id));
    const uncited = entries.filter((e) => !citedSet.has(e.id));
    return (
      <section className="not-prose mt-4 border-t border-border/60 pt-3">
        <h4 className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          {t("arona.sources.title")}
        </h4>
        {cited.length > 0 && <ol className="space-y-1.5">{cited.map(renderSourceEntry)}</ol>}
        {uncited.length > 0 && (
          <>
            <button
              type="button"
              onClick={() => setShowUncitedSources((v) => !v)}
              className={`flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors ${cited.length > 0 ? "mt-2" : ""}`}
              aria-expanded={showUncitedSources}
            >
              {showUncitedSources ? (
                <ChevronDown className="h-3.5 w-3.5" />
              ) : (
                <ChevronRight className="h-3.5 w-3.5" />
              )}
              <span>
                {t("arona.sources.more")} · {uncited.length}
              </span>
            </button>
            {showUncitedSources && (
              <ol className="mt-2 space-y-1.5">{uncited.map(renderSourceEntry)}</ol>
            )}
          </>
        )}
      </section>
    );
  })();

  return (
    <div className="prose prose-sm dark:prose-invert max-w-none">
      {processed.trim() && (
        <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]} components={components}>
          {fixCjkStrongEmphasis(processed)}
        </ReactMarkdown>
      )}
      {references}
      {sources}
    </div>
  );
}

// 완료된 답변의 진행 단계를 접힌 상태로 보존한다 — 펼치면 어떤 과정을
// 거쳤는지 보여 신뢰를 준다 (표시됐던 단계 문구만, JSON 입력 원문 없음).
function CollapsedSteps({ titles }: { titles: string[] }) {
  const { t } = useTranslations();
  const [open, setOpen] = useState(false);
  if (titles.length === 0) return null;
  return (
    <div className="mb-2">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
        aria-expanded={open}
      >
        {open ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronRight className="h-3.5 w-3.5" />}
        <span>
          {t("arona.steps.title")} · {titles.length}
        </span>
      </button>
      {open && (
        <div className="mt-2 space-y-1.5 pl-1">
          {titles.map((title, i) => (
            <div key={`step-${i}`} className="flex items-start gap-2 text-xs text-muted-foreground">
              <Check className="h-3.5 w-3.5 text-green-500 mt-0.5 shrink-0" />
              <span>{title}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

interface ChatMessagesProps {
  messages: ChatMessage[];
  currentAnswer: string;
  currentItemResults: Record<string, ItemCardData>;
  currentSourceResults: Record<string, SourceData>;
  currentStatus: string;
  error: string | null;
}

export function ChatMessages({
  messages,
  currentAnswer,
  currentItemResults,
  currentSourceResults,
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
                <CollapsedSteps titles={msg.steps ?? []} />
                <AssistantMarkdown
                  content={msg.content}
                  itemResults={msg.itemResults}
                  sourceResults={msg.sourceResults}
                />
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
            {currentAnswer && (
              <AssistantMarkdown
                content={currentAnswer}
                itemResults={currentItemResults}
                sourceResults={currentSourceResults}
              />
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
