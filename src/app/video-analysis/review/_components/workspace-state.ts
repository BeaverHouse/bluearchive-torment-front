import {
  AnalysisResult,
  ReviewEntry,
  ReviewProposal,
  ReviewWorkspace,
  platformFromVideoId,
} from "@/types/video";

// The worker's verdicts, surest first: the list and the next-video order both follow it.
export const DECISIONS: ReviewProposal["decision"][] = [
  "confirmed",
  "choose",
  "mismatch",
  "unranked",
  "needs_frames",
];

export function entryResult(entry: ReviewEntry): AnalysisResult {
  return {
    score: entry.score,
    partyData: entry.partyData.map((party) => [...party]),
  };
}

// What the editor opens on: the editor's own saved party, else the worker's pick, else any stored
// analysis, else an empty party with the score the title states.
export function startingResult(ws: ReviewWorkspace): AnalysisResult {
  const analyses = ws.video.data;
  const edited = analyses.find((a) => a.analysis_type !== "ai");
  if (edited) return edited.analysis_result;
  if (ws.proposal?.proposed) return entryResult(ws.proposal.proposed);
  if (analyses[0]) return analyses[0].analysis_result;
  return { score: statedScore(ws.proposal), partyData: [[0, 0, 0, 0, 0, 0]] };
}

// The first score the title states, exact or the start of an abbreviated span.
function statedScore(proposal: ReviewProposal | null): number {
  return proposal?.scores?.[0] ?? proposal?.score_spans?.[0]?.[0] ?? 0;
}

export function isVerified(ws: ReviewWorkspace): boolean {
  return ws.video.data.some((a) => a.is_verified);
}

// The reading to put back when a confirmation is withdrawn: the worker's own, or, for a video verified
// before the worker read it, one that only names the video.
export function readingOf(ws: ReviewWorkspace): ReviewProposal {
  if (ws.proposal) return ws.proposal;
  return {
    video_id: ws.video.video_id,
    raid_id: ws.video.raid_id ?? "",
    platform: ws.video.platform ?? platformFromVideoId(ws.video.video_id),
    title: ws.video.title,
    decision: "needs_frames",
    reason: "reopened in the editor",
    scores: [],
    score_spans: [],
    rank: 0,
    seen: [],
    candidates: [],
    frames: [],
  };
}

export function statedScores(proposal: ReviewProposal): string {
  const exact = (proposal.scores ?? []).map((score) => score.toLocaleString());
  const spans = (proposal.score_spans ?? []).map(
    ([low, high]) => `${low.toLocaleString()}~${high.toLocaleString()}`,
  );
  return [...exact, ...spans].join(", ");
}

export function message(err: unknown): string {
  return err instanceof Error ? err.message : String(err);
}
