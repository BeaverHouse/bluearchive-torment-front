"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { VideoEmbed } from "@/components/features/video/video-embed";
import { useTranslations } from "@/lib/i18n";
import { VideoPlatform } from "@/types/video";

// The video's evidence, pinned beside the party while it is edited: one lineup screen at a time at the
// size it was sampled, the others as thumbnails to switch to, or the video itself.
export function Evidence({
  frames,
  videoId,
  title,
  platform,
}: {
  frames: string[];
  videoId: string;
  title: string;
  platform: VideoPlatform;
}) {
  const { t } = useTranslations();
  const [shown, setShown] = useState(0);
  const [playing, setPlaying] = useState(frames.length === 0);
  return (
    <section
      aria-label={t("videoAnalysis.review.frames")}
      className="space-y-2 lg:sticky lg:top-16 lg:self-start"
    >
      <div className="flex gap-2">
        {frames.length > 0 && (
          <Button
            size="sm"
            variant={playing ? "outline" : "secondary"}
            onClick={() => setPlaying(false)}
          >
            {t("videoAnalysis.review.frames")}
          </Button>
        )}
        <Button
          size="sm"
          variant={playing ? "secondary" : "outline"}
          onClick={() => setPlaying(true)}
        >
          {t("videoAnalysis.review.openVideo")}
        </Button>
      </div>
      {playing ? (
        <VideoEmbed videoId={videoId} title={title} platform={platform} />
      ) : (
        // eslint-disable-next-line @next/next/no-img-element -- frames are published as sampled
        <img
          src={frames[shown]}
          alt={t("videoAnalysis.review.frames")}
          className="max-h-[calc(100vh-12rem)] w-full rounded border object-contain"
        />
      )}
      {!playing && frames.length > 1 && (
        <div className="flex gap-2 overflow-x-auto">
          {frames.map((url, index) => (
            <button
              key={url}
              type="button"
              aria-pressed={index === shown}
              onClick={() => setShown(index)}
              className={`shrink-0 rounded border-2 ${index === shown ? "border-primary" : "border-transparent"}`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element -- thumbnails of the published frames */}
              <img src={url} alt="" loading="lazy" className="h-16 w-auto" />
            </button>
          ))}
        </div>
      )}
    </section>
  );
}
