"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getVideoList } from "@/lib/api";
import { useTranslations } from "@/lib/i18n";
import { ReviewProposal, VideoListItem } from "@/types/video";
import { DECISIONS } from "./workspace-state";

export interface Selection {
  videoId: string;
  raidId: string;
}

const PAGE_SIZE = 100;

function matches(query: string, title: string, videoId: string): boolean {
  const q = query.trim().toLowerCase();
  return (
    q === "" ||
    title.toLowerCase().includes(q) ||
    videoId.toLowerCase().includes(q)
  );
}

function Row({
  raidId,
  title,
  current,
  unverified,
  onClick,
}: {
  raidId: string;
  title: string;
  current: boolean;
  unverified: boolean;
  onClick: () => void;
}) {
  return (
    <li>
      <button
        type="button"
        onClick={onClick}
        aria-current={current}
        className={`flex w-full items-center gap-1.5 truncate rounded px-2 py-1 text-left text-sm ${
          current ? "bg-primary text-primary-foreground" : "hover:bg-muted"
        } ${unverified ? "font-semibold" : "text-muted-foreground"}`}
      >
        {unverified && (
          <span
            aria-hidden
            className="h-2 w-2 shrink-0 rounded-full bg-amber-500"
          />
        )}
        <span className="shrink-0 text-xs opacity-70">{raidId}</span>
        <span className="truncate">{title}</span>
      </button>
    </li>
  );
}

// The unverified videos by the worker's verdict, surest first.
function PendingList({
  pending,
  query,
  selected,
  onSelect,
}: {
  pending: ReviewProposal[];
  query: string;
  selected: Selection | null;
  onSelect: (s: Selection) => void;
}) {
  const { t } = useTranslations();
  const shown = pending.filter((p) => matches(query, p.title, p.video_id));
  if (shown.length === 0)
    return (
      <p className="px-2 text-sm text-muted-foreground">
        {t("videoAnalysis.review.empty")}
      </p>
    );
  return (
    <div className="space-y-4">
      {DECISIONS.map((decision) => {
        const group = shown.filter((p) => p.decision === decision);
        if (group.length === 0) return null;
        return (
          <section key={decision}>
            <h2 className="mb-1 px-2 text-sm font-semibold">
              {t(`videoAnalysis.review.decision.${decision}`)}{" "}
              <span className="text-muted-foreground">{group.length}</span>
            </h2>
            <ul className="space-y-0.5">
              {group.map((p) => (
                <Row
                  key={p.video_id}
                  raidId={p.raid_id}
                  title={p.title}
                  unverified
                  current={p.video_id === selected?.videoId}
                  onClick={() =>
                    onSelect({ videoId: p.video_id, raidId: p.raid_id })
                  }
                />
              ))}
            </ul>
          </section>
        );
      })}
    </div>
  );
}

// Every analysed video, newest first, a page at a time; the unverified ones stand out.
function AllList({
  query,
  selected,
  onSelect,
}: {
  query: string;
  selected: Selection | null;
  onSelect: (s: Selection) => void;
}) {
  const { t } = useTranslations();
  const [videos, setVideos] = useState<VideoListItem[]>([]);
  const [page, setPage] = useState(1);
  const [hasNext, setHasNext] = useState(false);
  useEffect(() => {
    getVideoList(undefined, page, PAGE_SIZE).then((response) => {
      setVideos((loaded) =>
        page === 1 ? response.data.data : [...loaded, ...response.data.data],
      );
      setHasNext(response.data.pagination.has_next);
    });
  }, [page]);
  return (
    <div className="space-y-2">
      <ul className="space-y-0.5">
        {videos
          .filter((v) => matches(query, v.title, v.video_id))
          .map((v) => (
            <Row
              key={`${v.video_id}-${v.raid_id}`}
              raidId={v.raid_id ?? ""}
              title={v.title}
              unverified={v.verify_level === 0}
              current={v.video_id === selected?.videoId}
              onClick={() =>
                onSelect({ videoId: v.video_id, raidId: v.raid_id ?? "" })
              }
            />
          ))}
      </ul>
      {hasNext && (
        <Button
          size="sm"
          variant="outline"
          className="w-full"
          onClick={() => setPage((p) => p + 1)}
        >
          {t("videoAnalysis.review.loadMore")}
        </Button>
      )}
    </div>
  );
}

export function VideoNav({
  pending,
  selected,
  onSelect,
}: {
  pending: ReviewProposal[];
  selected: Selection | null;
  onSelect: (s: Selection) => void;
}) {
  const { t } = useTranslations();
  const [query, setQuery] = useState("");
  return (
    <nav className="space-y-3 lg:sticky lg:top-4 lg:max-h-[calc(100vh-2rem)] lg:overflow-y-auto">
      <Input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder={t("videoAnalysis.review.search")}
      />
      <Tabs defaultValue="pending">
        <TabsList className="w-full">
          <TabsTrigger value="pending" className="flex-1">
            {t("videoAnalysis.edit.unverified")} {pending.length}
          </TabsTrigger>
          <TabsTrigger value="all" className="flex-1">
            {t("videoAnalysis.review.allVideos")}
          </TabsTrigger>
        </TabsList>
        <TabsContent value="pending">
          <PendingList
            pending={pending}
            query={query}
            selected={selected}
            onSelect={onSelect}
          />
        </TabsContent>
        <TabsContent value="all">
          <AllList query={query} selected={selected} onSelect={onSelect} />
        </TabsContent>
      </Tabs>
    </nav>
  );
}
