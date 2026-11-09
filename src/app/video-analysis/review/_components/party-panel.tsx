"use client";

import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import PartyCard from "@/components/features/raid/party-card";
import SingleParty from "@/components/features/raid/single-party";
import { useStudentMaps } from "@/hooks/use-student-maps";
import { resolveReviewFeedback } from "@/lib/api";
import { useTranslations } from "@/lib/i18n";
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

// The ranking entries the worker could not choose between; picking one loads it into the party.
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
  if (candidates.length < 2) return null;
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

// Visitors' pending correction suggestions, each marked done once handled.
export function Feedback({
  items,
  onResolved,
}: {
  items: VideoFeedbackItem[];
  onResolved: () => void;
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
              onClick={() => resolveReviewFeedback(item.id).then(onResolved)}
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
