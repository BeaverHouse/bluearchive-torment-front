"use client";

import { Suspense, useEffect, useState } from "react";
import { notFound, useRouter, useSearchParams } from "next/navigation";
import { LOCAL_EDIT_ENABLED } from "@/constants/video-edit";
import { getVideoReview } from "@/lib/api";
import { useTranslations } from "@/lib/i18n";
import { ReviewProposal } from "@/types/video";
import { Selection, VideoNav } from "./_components/video-nav";
import { Workspace } from "./_components/workspace";
import { DECISIONS, message } from "./_components/workspace-state";

function surestFirst(proposals: ReviewProposal[]): ReviewProposal[] {
  return DECISIONS.flatMap((d) => proposals.filter((p) => p.decision === d));
}

// The selected video lives in the address, so a reload or a link from the detail page opens it.
function useSelection() {
  const params = useSearchParams();
  const router = useRouter();
  const videoId = params.get("video_id");
  const selected: Selection | null = videoId
    ? { videoId, raidId: params.get("raid_id") ?? "" }
    : null;
  const select = (s: Selection) =>
    router.replace(
      `/video-analysis/review?video_id=${s.videoId}&raid_id=${s.raidId}`,
    );
  return { selected, select };
}

// The editor: every video can be opened and edited at any time; the unverified ones are listed first,
// surest verdict first, and confirming one moves on to the next.
function Desk() {
  const { t } = useTranslations();
  const { selected, select } = useSelection();
  const [pending, setPending] = useState<ReviewProposal[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    getVideoReview()
      .then((response) => setPending(surestFirst(response.data)))
      .catch((err) => setError(message(err)));
  }, []);
  useEffect(() => {
    if (!selected && pending?.[0])
      select({ videoId: pending[0].video_id, raidId: pending[0].raid_id });
  }, [selected, pending, select]);

  const confirmed = (videoId: string) => {
    const list = pending ?? [];
    const at = list.findIndex((p) => p.video_id === videoId);
    const rest = list.filter((p) => p.video_id !== videoId);
    setPending(rest);
    const next = rest[Math.max(at, 0)] ?? rest[at - 1];
    if (next) select({ videoId: next.video_id, raidId: next.raid_id });
  };
  const withdrawn = (reading: ReviewProposal) => {
    setPending((list) =>
      surestFirst([
        reading,
        ...(list ?? []).filter((p) => p.video_id !== reading.video_id),
      ]),
    );
    select({ videoId: reading.video_id, raidId: reading.raid_id });
  };
  const moved = (videoId: string, raidId: string) => {
    setPending((list) =>
      (list ?? []).map((p) =>
        p.video_id === videoId ? { ...p, raid_id: raidId } : p,
      ),
    );
    select({ videoId, raidId });
  };

  return (
    <div className="min-w-0 lg:grid lg:grid-cols-[18rem_minmax(0,1fr)] lg:gap-6">
      <aside className="mb-6 lg:mb-0">
        <h1 className="mb-3 text-xl font-bold">
          {t("videoAnalysis.review.title")}
        </h1>
        {error && <p className="mb-2 text-sm text-destructive">{error}</p>}
        {pending ? (
          <VideoNav pending={pending} selected={selected} onSelect={select} />
        ) : (
          <p>{t("videoAnalysis.review.loading")}</p>
        )}
      </aside>
      <div className="min-w-0">
        {selected && (
          <Workspace
            key={`${selected.videoId}/${selected.raidId}`}
            videoId={selected.videoId}
            raidId={selected.raidId}
            onConfirmed={confirmed}
            onWithdrawn={withdrawn}
            onMoved={moved}
          />
        )}
      </div>
    </div>
  );
}

export default function VideoReviewPage() {
  if (!LOCAL_EDIT_ENABLED) notFound();
  return (
    <Suspense>
      <Desk />
    </Suspense>
  );
}
