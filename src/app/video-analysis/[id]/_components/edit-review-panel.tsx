"use client";

import { useEffect, useState } from "react";
import { BadgeCheck, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  getPendingVideoFeedback,
  resolveVideoFeedback,
  setAnalysisVerified,
  VideoFeedbackItem,
} from "@/lib/api";
import { VideoAnalysisData } from "@/types/video";
import { useTranslations } from "@/lib/i18n";

interface EditReviewPanelProps {
  analysis: VideoAnalysisData;
  raidId: string;
}

// Local-only review tools beside the editor: the verification flag of the analysis being edited
// and the visitors' pending correction suggestions for this video.
export function EditReviewPanel({ analysis, raidId }: EditReviewPanelProps) {
  const { t } = useTranslations();
  const [isVerified, setIsVerified] = useState(analysis.is_verified ?? false);
  const [feedback, setFeedback] = useState<VideoFeedbackItem[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getPendingVideoFeedback(analysis.video_id, raidId)
      .then(setFeedback)
      .catch((err) => setError(err instanceof Error ? err.message : String(err)));
  }, [analysis.video_id, raidId]);

  const toggleVerified = async () => {
    try {
      await setAnalysisVerified(analysis.id, !isVerified);
      setIsVerified(!isVerified);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    }
  };

  const resolve = async (feedbackId: number) => {
    try {
      await resolveVideoFeedback(feedbackId);
      setFeedback((items) => items.filter((item) => item.id !== feedbackId));
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    }
  };

  return (
    <section className="space-y-4 rounded-lg border p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="inline-flex items-center gap-1.5 text-sm font-medium">
          <BadgeCheck className={`h-4 w-4 ${isVerified ? "text-emerald-600" : "text-muted-foreground"}`} />
          {t(isVerified ? "videoAnalysis.edit.verified" : "videoAnalysis.edit.unverified")}
          <span className="text-muted-foreground">({analysis.analysis_type})</span>
        </span>
        <Button variant="outline" size="sm" onClick={toggleVerified}>
          {t(isVerified ? "videoAnalysis.edit.unverify" : "videoAnalysis.edit.verify")}
        </Button>
      </div>

      <div className="space-y-2">
        <h2 className="text-sm font-semibold">{t("videoAnalysis.edit.feedbackTitle")}</h2>
        {feedback.length === 0 ? (
          <p className="text-sm text-muted-foreground">{t("videoAnalysis.edit.feedbackEmpty")}</p>
        ) : (
          <ul className="space-y-2">
            {feedback.map((item) => (
              <li key={item.id} className="flex items-start justify-between gap-3 rounded-md bg-muted/40 p-3">
                <div className="min-w-0 space-y-1">
                  <p className="whitespace-pre-wrap break-words text-sm">{item.comment}</p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(item.created_at).toLocaleString("ko-KR")}
                  </p>
                </div>
                <Button variant="ghost" size="sm" onClick={() => resolve(item.id)}>
                  <Check className="h-4 w-4 mr-1" />
                  {t("videoAnalysis.edit.feedbackResolve")}
                </Button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}
    </section>
  );
}
