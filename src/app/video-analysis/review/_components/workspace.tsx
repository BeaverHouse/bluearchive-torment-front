"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import Swal from "sweetalert2";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { SingleSelect } from "@/components/ui/custom/single-select";
import { getRaidName, useRaids } from "@/hooks/use-raids";
import {
  confirmReview,
  getReviewWorkspace,
  moveReviewRaid,
  resolveReviewFeedback,
  saveReviewAnalysis,
  withdrawReview,
} from "@/lib/api";
import { useTranslations } from "@/lib/i18n";
import {
  AnalysisResult,
  ReviewEntry,
  ReviewProposal,
  ReviewWorkspace,
  buildVideoUrl,
  platformFromVideoId,
} from "@/types/video";
import { Evidence } from "./evidence";
import { Candidates, Feedback, PartyPanel, RankLoader } from "./party-panel";
import {
  entryResult,
  isVerified,
  message,
  readingOf,
  startingResult,
  statedScores,
} from "./workspace-state";

// What the review list does when one video's state changes on the server.
export interface WorkspaceCallbacks {
  onConfirmed: (videoId: string) => void;
  onWithdrawn: (reading: ReviewProposal) => void;
  onMoved: (videoId: string, raidId: string) => void;
}

// A short notice in the corner; with an action, it carries the one button that takes the change back.
function notify(text: string, action?: { label: string; run: () => void }) {
  Swal.fire({
    toast: true,
    position: "bottom-end",
    timer: action ? 8000 : 2000,
    timerProgressBar: Boolean(action),
    text,
    showConfirmButton: Boolean(action),
    confirmButtonText: action?.label,
  }).then((answer) => {
    if (answer.isConfirmed) action?.run();
  });
}

// The raid the video is filed under; picking another one moves the video there.
function RaidPicker({
  raidId,
  onMove,
}: {
  raidId: string;
  onMove: (raidId: string) => void;
}) {
  const { locale } = useTranslations();
  const { raids } = useRaids();
  return (
    <SingleSelect
      options={raids.map((raid) => ({
        value: raid.id,
        label: getRaidName(raid, locale),
      }))}
      value={raidId}
      onChange={onMove}
    />
  );
}

function Header({
  ws,
  verified,
  dirty,
  onMove,
}: {
  ws: ReviewWorkspace;
  verified: boolean;
  dirty: boolean;
  onMove: (raidId: string) => void;
}) {
  const { t } = useTranslations();
  const platform = ws.video.platform ?? platformFromVideoId(ws.video.video_id);
  return (
    <header className="flex flex-wrap items-center gap-2">
      <Badge
        variant={verified ? "secondary" : "default"}
        className={verified ? "" : "bg-amber-500"}
      >
        {t(
          verified
            ? "videoAnalysis.edit.verified"
            : "videoAnalysis.edit.unverified",
        )}
      </Badge>
      {ws.proposal && !verified && (
        <Badge variant="outline">
          {t(`videoAnalysis.review.decision.${ws.proposal.decision}`)}
        </Badge>
      )}
      <RaidPicker raidId={ws.video.raid_id ?? ""} onMove={onMove} />
      <a
        className="font-medium underline-offset-2 hover:underline"
        href={buildVideoUrl(platform, ws.video.video_id)}
        target="_blank"
        rel="noreferrer"
      >
        {ws.video.title}
      </a>
      <Link
        className="text-sm text-muted-foreground underline-offset-2 hover:underline"
        href={`/video-analysis/${ws.video.video_id}?raid_id=${ws.video.raid_id}`}
      >
        {t("videoAnalysis.review.detail")}
      </Link>
      {dirty && (
        <span className="ml-auto text-sm text-amber-600">
          {t("videoAnalysis.review.unsaved")}
        </span>
      )}
    </header>
  );
}

// Save, confirm, withdraw and move to another raid for one video, each reporting back through a notice.
function useActions(
  ws: ReviewWorkspace,
  result: AnalysisResult,
  dirty: boolean,
  reload: () => void,
  callbacks: WorkspaceCallbacks,
) {
  const { t } = useTranslations();
  const [busy, setBusy] = useState(false);
  const { video_id: videoId, raid_id: raidId } = ws.video;
  const run = async (work: () => Promise<void>) => {
    setBusy(true);
    try {
      await work();
    } catch (err) {
      notify(message(err));
    } finally {
      setBusy(false);
    }
  };
  const withdraw = (reading: ReviewProposal) =>
    run(async () => {
      await withdrawReview(reading);
      reload();
      callbacks.onWithdrawn(reading);
      notify(t("videoAnalysis.review.withdrawn"));
    });
  const move = (from: string, to: string) =>
    run(async () => {
      await moveReviewRaid(videoId, from, to);
      callbacks.onMoved(videoId, to);
      notify(t("videoAnalysis.review.moved"), {
        label: t("videoAnalysis.review.undo"),
        run: () => move(to, from),
      });
    });
  return {
    busy,
    move: (to: string) =>
      dirty
        ? notify(t("videoAnalysis.review.saveFirst"))
        : move(raidId ?? "", to),
    save: () =>
      run(async () => {
        await saveReviewAnalysis(videoId, raidId ?? "", result);
        reload();
        notify(t("videoAnalysis.review.saved"));
      }),
    confirm: () =>
      run(async () => {
        const reading = readingOf(ws);
        await confirmReview(videoId, raidId ?? "", result);
        reload();
        callbacks.onConfirmed(videoId);
        notify(t("videoAnalysis.review.confirmed"), {
          label: t("videoAnalysis.review.undo"),
          run: () => withdraw(reading),
        });
      }),
    withdraw: () => withdraw(readingOf(ws)),
  };
}

// Ctrl+S saves and Ctrl+Enter confirms, as editors expect.
function useShortcuts(save: () => void, confirm: () => void) {
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (!(event.ctrlKey || event.metaKey)) return;
      if (event.key === "s") {
        event.preventDefault();
        save();
      } else if (event.key === "Enter") {
        event.preventDefault();
        confirm();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [save, confirm]);
}

// The ranking entries the party can be loaded from: the worker's match, or any rank typed in.
function RankingEntries({
  ws,
  result,
  onLoad,
}: {
  ws: ReviewWorkspace;
  result: AnalysisResult;
  onLoad: (entry: ReviewEntry) => void;
}) {
  const proposal = ws.proposal;
  return (
    <>
      {proposal && (
        <Candidates
          candidates={
            proposal.candidates.length > 0 || !proposal.proposed
              ? proposal.candidates
              : [proposal.proposed]
          }
          chosen={result}
          onChoose={onLoad}
        />
      )}
      <RankLoader raidId={ws.video.raid_id ?? ""} onLoad={onLoad} />
    </>
  );
}

function Editor({
  ws,
  reload,
  callbacks,
}: {
  ws: ReviewWorkspace;
  reload: () => void;
  callbacks: WorkspaceCallbacks;
}) {
  const { t } = useTranslations();
  const [saved, setSaved] = useState(() => startingResult(ws));
  const [result, setResult] = useState(saved);
  const [editing, setEditing] = useState(false);
  const verified = isVerified(ws);
  const dirty = JSON.stringify(result) !== JSON.stringify(saved);
  const actions = useActions(
    ws,
    result,
    dirty,
    () => {
      setSaved(result);
      reload();
    },
    callbacks,
  );
  useShortcuts(actions.save, actions.confirm);
  const frames = ws.proposal?.frames ?? [];
  return (
    <div className="space-y-4">
      <Header ws={ws} verified={verified} dirty={dirty} onMove={actions.move} />
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)]">
        <Evidence
          key={ws.video.video_id}
          frames={frames}
          videoId={ws.video.video_id}
          title={ws.video.title}
          platform={ws.video.platform ?? platformFromVideoId(ws.video.video_id)}
        />
        <div className="min-w-0 space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <Button variant="outline" onClick={() => setEditing((on) => !on)}>
              {t(
                editing
                  ? "videoAnalysis.review.showCard"
                  : "videoAnalysis.review.edit",
              )}
            </Button>
            <div className="ml-auto flex gap-2">
              <Button
                variant="outline"
                onClick={actions.save}
                disabled={actions.busy || !dirty}
              >
                {t("videoAnalysis.review.save")}
              </Button>
              {verified ? (
                <Button
                  variant="outline"
                  onClick={actions.withdraw}
                  disabled={actions.busy}
                >
                  {t("videoAnalysis.edit.unverify")}
                </Button>
              ) : (
                <Button onClick={actions.confirm} disabled={actions.busy}>
                  {t("videoAnalysis.review.confirm")}
                </Button>
              )}
            </div>
          </div>
          {ws.proposal && statedScores(ws.proposal) && (
            <p className="text-sm text-muted-foreground">
              {t("videoAnalysis.review.statedScore")}:{" "}
              {statedScores(ws.proposal)}
            </p>
          )}
          <PartyPanel result={result} setResult={setResult} editing={editing} />
          <RankingEntries
            ws={ws}
            result={result}
            onLoad={(entry) => setResult(entryResult(entry))}
          />
          <Feedback
            items={ws.feedback}
            onResolve={(id) =>
              resolveReviewFeedback(id).then(reload, (err) =>
                notify(message(err)),
              )
            }
          />
        </div>
      </div>
    </div>
  );
}

// One video's workspace, loaded fresh whenever it changes on the server.
export function Workspace({
  videoId,
  raidId,
  ...callbacks
}: {
  videoId: string;
  raidId: string;
} & WorkspaceCallbacks) {
  const { t } = useTranslations();
  const [ws, setWs] = useState<ReviewWorkspace | null>(null);
  const [error, setError] = useState<string | null>(null);
  const load = useCallback(() => {
    getReviewWorkspace(videoId, raidId)
      .then((response) => setWs(response.data))
      .catch((err) => setError(message(err)));
  }, [videoId, raidId]);
  useEffect(load, [load]);
  if (error) return <p className="text-sm text-destructive">{error}</p>;
  if (!ws) return <p>{t("videoAnalysis.review.loading")}</p>;
  return <Editor ws={ws} reload={load} callbacks={callbacks} />;
}
