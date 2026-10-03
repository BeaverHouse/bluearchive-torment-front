"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ArrowLeft, BadgeCheck, Edit3, Copy, Check, Flag } from "lucide-react";
import Swal from "sweetalert2";
import { VideoEmbed } from "@/components/features/video/video-embed";
import { VideoAnalysisData, VideoPlatform } from "@/types/video";
import Link from "next/link";
import { useStudentMaps } from "@/hooks/use-student-maps";
import { VideoAnalysisContent } from "./VideoAnalysisContent";
import { generateHTML } from "./utils/generateHTML";
import { useTranslations } from "@/lib/i18n";
import { FeedbackPanel } from "@/components/shared/feedback-form";
import { submitVideoFeedback } from "@/lib/api";
import { LOCAL_EDIT_ENABLED } from "@/constants/video-edit";
import { EditReviewPanel } from "../edit-review-panel";

interface VideoDetailProps {
  videos: VideoAnalysisData[];
  currentVideo: VideoAnalysisData;
  onVideoChange: (video: VideoAnalysisData) => void;
  raidId: string | null;
  platform?: VideoPlatform;
  /** Called after verifying, which removes the other analyses of this video on the server. */
  onAnalysesChanged?: () => void;
}

export function VideoDetail({
  videos,
  currentVideo,
  onVideoChange,
  raidId,
  platform,
  onAnalysesChanged,
}: VideoDetailProps) {
  const [copiedId, setCopiedId] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState(currentVideo.id.toString());
  const [feedbackOpen, setFeedbackOpen] = useState(false);
  // Verified flags changed on this page, by analysis id, so switching tabs does not show stale values.
  const [verifiedChanges, setVerifiedChanges] = useState<Record<number, boolean>>({});
  const { studentsMap } = useStudentMaps();
  const { t } = useTranslations();

  const sortedVideos = [...videos].sort((a, b) => {
    if (a.analysis_type !== "ai" && b.analysis_type === "ai") return -1;
    if (a.analysis_type === "ai" && b.analysis_type !== "ai") return 1;
    return 0;
  });

  const router = useRouter();

  const handleStartEdit = () => {
    if (window.innerWidth < 1024) {
      Swal.fire({
        icon: "warning",
        title: t("videoAnalysis.detail.editPcOnlyTitle"),
        text: t("videoAnalysis.detail.editPcOnlyText"),
        confirmButtonText: t("videoAnalysis.detail.confirm"),
      });
      return;
    }

    const editPath = `/video-analysis/${currentVideo.video_id}/edit`;
    router.push(raidId ? `${editPath}?raid_id=${raidId}` : editPath);
  };

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    const selectedVideo = videos.find((v) => v.id.toString() === value);
    if (selectedVideo) {
      onVideoChange(selectedVideo);
    }
  };

  const copyToClipboard = async (video: VideoAnalysisData) => {
    try {
      const html = generateHTML(video, studentsMap, t, platform);
      await navigator.clipboard.writeText(html);
      setCopiedId(video.id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (error) {
      console.error("복사 실패:", error);
      alert(t("videoAnalysis.detail.copyFailed"));
    }
  };

  const renderActionButtons = (video: VideoAnalysisData) => (
    <div className="flex gap-2">
      {raidId && (
        <Button
          variant="outline"
          size="sm"
          onClick={() => setFeedbackOpen((open) => !open)}
          aria-expanded={feedbackOpen}
        >
          <Flag className="h-4 w-4 mr-2" />
          {t("videoAnalysis.detail.report")}
        </Button>
      )}
      <Button
        variant="outline"
        size="sm"
        onClick={() => copyToClipboard(video)}
        disabled={copiedId === video.id}
      >
        {copiedId === video.id ? (
          <Check className="h-4 w-4 mr-2" />
        ) : (
          <Copy className="h-4 w-4 mr-2" />
        )}
        {copiedId === video.id ? t("common.copied") : t("videoAnalysis.detail.htmlCopy")}
      </Button>
      {LOCAL_EDIT_ENABLED && (
        <Button onClick={handleStartEdit} size="sm">
          <Edit3 className="h-4 w-4 mr-2" />
          {t("videoAnalysis.detail.edit")}
        </Button>
      )}
    </div>
  );

  const analysisLabel = (video: VideoAnalysisData) =>
    t(video.analysis_type === "ai" ? "videoAnalysis.detail.tabAi" : "videoAnalysis.detail.tabUser");

  const isVerified = (video: VideoAnalysisData) => verifiedChanges[video.id] ?? video.is_verified ?? false;

  const verifiedIcon = (
    <BadgeCheck className="h-4 w-4 text-emerald-600" aria-label={t("videoAnalysis.detail.verified")} />
  );

  const feedbackPanel = feedbackOpen && raidId && (
    <div className="rounded-lg border bg-card p-4">
      <FeedbackPanel
        placeholder={t("feedback.videoPlaceholder")}
        onSubmit={(input) => submitVideoFeedback(currentVideo.video_id, raidId, input)}
        onCancel={() => setFeedbackOpen(false)}
      />
    </div>
  );

  return (
    <div className="space-y-6 min-w-0">
      <div className="flex items-center">
        <Link href="/video-analysis">
          <Button variant="ghost">
            <ArrowLeft className="h-4 w-4 mr-2" />
            {t("videoAnalysis.detail.back")}
          </Button>
        </Link>
      </div>

      <VideoEmbed
        videoId={currentVideo.video_id}
        title={`Video ${currentVideo.id}`}
        platform={platform}
      />

      {/* keyed by analysis so the verified flag follows the selected tab */}
      {LOCAL_EDIT_ENABLED && raidId && (
        <EditReviewPanel
          key={currentVideo.id}
          analysis={{
            ...currentVideo,
            is_verified: verifiedChanges[currentVideo.id] ?? currentVideo.is_verified,
          }}
          raidId={raidId}
          onVerifiedChange={(isVerified) => {
            setVerifiedChanges((changes) => ({ ...changes, [currentVideo.id]: isVerified }));
            if (isVerified) onAnalysesChanged?.();
          }}
        />
      )}

      {videos.length > 1 ? (
        <Tabs value={activeTab} onValueChange={handleTabChange}>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
            <TabsList>
              {sortedVideos.map((video) => (
                <TabsTrigger key={video.id} value={video.id.toString()} className="gap-1.5">
                  {analysisLabel(video)}
                  {isVerified(video) && verifiedIcon}
                </TabsTrigger>
              ))}
            </TabsList>
            {renderActionButtons(currentVideo)}
          </div>
          {feedbackPanel && <div className="mb-4">{feedbackPanel}</div>}

          {sortedVideos.map((video) => (
            <TabsContent key={video.id} value={video.id.toString()}>
              <VideoAnalysisContent video={video} />
            </TabsContent>
          ))}
        </Tabs>
      ) : (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <span className="inline-flex w-fit items-center gap-1.5 rounded-md bg-muted px-3 py-1.5 text-sm font-medium">
              {analysisLabel(currentVideo)}
              {isVerified(currentVideo) && (
                <>
                  {verifiedIcon}
                  <span className="text-emerald-700 dark:text-emerald-400">{t("videoAnalysis.detail.verified")}</span>
                </>
              )}
            </span>
            {renderActionButtons(currentVideo)}
          </div>
          {feedbackPanel}
          <VideoAnalysisContent video={currentVideo} />
        </div>
      )}
    </div>
  );
}
