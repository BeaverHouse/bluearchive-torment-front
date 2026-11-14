"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import PartyCard from "@/components/features/raid/party-card";
import SingleParty from "@/components/features/raid/single-party";
import { useStudentMaps } from "@/hooks/use-student-maps";
import { useTranslations } from "@/lib/i18n";
import { createCDNQueryOptions } from "@/lib/queries";
import { RaidData } from "@/types/raid";
import { AnalysisResult, ReviewEntry, VideoFeedbackItem } from "@/types/video";
import { BasicInfoEditor } from "../../_components/party-editor/BasicInfoEditor";
import { PartyEditor } from "../../_components/party-editor/PartyEditor";
import { usePartyEditor } from "../../_components/party-editor/usePartyEditor";

type SetResult = React.Dispatch<React.SetStateAction<AnalysisResult>>;

// The party as a card, or in the editor; the toolbar switches between them.
export function PartyPanel({
  result,
  setResult,
  editing,
}: {
  result: AnalysisResult;
  setResult: SetResult;
  editing: boolean;
}) {
  const { t } = useTranslations();
  const { studentsMap, studentSearchMap } = useStudentMaps();
  const editor = usePartyEditor({
    analysisResult: result,
    setAnalysisResult: setResult,
    studentsMap,
    t,
  });
  if (!editing) {
    return (
      <PartyCard
        rank={-1}
        value={result.score}
        valueSuffix={t("common.points")}
        parties={result.partyData}
        showModeBadge={false}
      />
    );
  }
  return (
    <div className="space-y-4">
      <BasicInfoEditor
        score={result.score}
        description={result.description ?? ""}
        onUpdateScore={(score) => setResult((prev) => ({ ...prev, score }))}
        onUpdateDescription={(description) =>
          setResult((prev) => ({ ...prev, description }))
        }
      />
      <PartyEditor
        partyData={result.partyData}
        getCharacterOptions={editor.getCharacterOptions}
        onUpdateParty={editor.updatePartyData}
        onUpdateCharacterDetails={editor.updateCharacterDetails}
        onAddParty={editor.addParty}
        onRemoveParty={editor.removeParty}
        onReorderParty={editor.reorderParty}
        onSwapCharacter={editor.swapCharacter}
        studentSearchMap={studentSearchMap}
      />
    </div>
  );
}

// The ranking entries the worker matched, with their ranks; picking one loads it into the party.
export function Candidates({
  candidates,
  chosen,
  onChoose,
}: {
  candidates: ReviewEntry[];
  chosen: AnalysisResult;
  onChoose: (entry: ReviewEntry) => void;
}) {
  const { t } = useTranslations();
  if (candidates.length === 0) return null;
  const isChosen = (entry: ReviewEntry) =>
    JSON.stringify(entry.partyData) === JSON.stringify(chosen.partyData);
  return (
    <section
      aria-label={t("videoAnalysis.review.candidates")}
      className="space-y-1"
    >
      <h3 className="text-sm font-medium">
        {t("videoAnalysis.review.candidates")}
      </h3>
      {candidates.map((candidate) => (
        <button
          key={candidate.rank}
          type="button"
          className="w-full text-left"
          aria-pressed={isChosen(candidate)}
          onClick={() => onChoose(candidate)}
        >
          <span className="text-xs text-muted-foreground">
            {candidate.rank} · {candidate.score.toLocaleString()}
          </span>
          {candidate.partyData.map((party, index) => (
            <SingleParty
              key={index}
              party={party}
              highlighted={isChosen(candidate)}
              showModeBadge={false}
            />
          ))}
        </button>
      ))}
    </section>
  );
}

// Loads the published ranking entry of a typed rank into the party, for a video the worker matched to
// the wrong entry or to none.
export function RankLoader({
  raidId,
  onLoad,
}: {
  raidId: string;
  onLoad: (entry: ReviewEntry) => void;
}) {
  const { t } = useTranslations();
  const [rank, setRank] = useState("");
  const ranking = useQuery(createCDNQueryOptions<RaidData>("party", raidId));
  const entry = ranking.data?.parties.find((p) => p.rank === Number(rank));
  return (
    <form
      className="flex items-center gap-2"
      onSubmit={(event) => {
        event.preventDefault();
        if (entry) onLoad(entry);
      }}
    >
      <Input
        type="number"
        min={1}
        className="w-32"
        aria-label={t("videoAnalysis.review.rank")}
        placeholder={t("videoAnalysis.review.rank")}
        value={rank}
        onChange={(event) => setRank(event.target.value)}
      />
      <Button type="submit" variant="outline" disabled={!entry}>
        {t("videoAnalysis.review.loadRank")}
      </Button>
      {rank && ranking.isSuccess && !entry && (
        <span className="text-sm text-muted-foreground">
          {t("videoAnalysis.review.rankMissing")}
        </span>
      )}
    </form>
  );
}

// Visitors' pending correction suggestions, each marked done once handled.
export function Feedback({
  items,
  onResolve,
}: {
  items: VideoFeedbackItem[];
  onResolve: (feedbackId: number) => void;
}) {
  const { t } = useTranslations();
  if (items.length === 0) return null;
  return (
    <section className="space-y-2 rounded-lg border p-3">
      <h3 className="text-sm font-semibold">
        {t("videoAnalysis.edit.feedbackTitle")}
      </h3>
      <ul className="space-y-2">
        {items.map((item) => (
          <li
            key={item.id}
            className="flex items-start justify-between gap-3 rounded-md bg-muted/40 p-3"
          >
            <div className="min-w-0 space-y-1">
              <p className="whitespace-pre-wrap break-words text-sm">
                {item.comment}
              </p>
              <p className="text-xs text-muted-foreground">
                {new Date(item.created_at).toLocaleString("ko-KR")}
              </p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onResolve(item.id)}
            >
              <Check className="mr-1 h-4 w-4" />
              {t("videoAnalysis.edit.feedbackResolve")}
            </Button>
          </li>
        ))}
      </ul>
    </section>
  );
}
