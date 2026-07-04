"use client";

import { useState } from "react";
import Swal from "sweetalert2";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus } from "lucide-react";
import { addVideoToQueue } from "@/lib/api";
import { parseVideoReference } from "@/types/video";
import { RaidInfo } from "@/types/raid";
import { getRaidName } from "@/hooks/use-raids";
import { useTranslations } from "@/lib/i18n";

interface AddVideoDialogProps {
  raids: RaidInfo[];
}

export function AddVideoDialog({ raids }: AddVideoDialogProps) {
  const { t, locale } = useTranslations();
  const [isOpen, setIsOpen] = useState(false);
  const [raidId, setRaidId] = useState<string>("");
  const [videoInput, setVideoInput] = useState<string>("");
  const [submitting, setSubmitting] = useState(false);

  const handleAddToQueue = async () => {
    if (!raidId || !videoInput) {
      await Swal.fire({
        title: t("video.add.error.input"),
        text: t("video.add.error.inputBody"),
        icon: "warning",
        confirmButtonText: t("common.confirm"),
      });
      return;
    }

    const videoReference = parseVideoReference(videoInput);
    if (!videoReference) {
      await Swal.fire({
        title: t("video.add.error.url"),
        text: t("video.add.error.urlBody"),
        icon: "warning",
        confirmButtonText: t("common.confirm"),
      });
      return;
    }

    try {
      setSubmitting(true);
      const result = await addVideoToQueue(raidId, videoReference.video_id, videoReference.platform);

      if (result.existingVideo) {
        const { videoId, raidId: existingRaidId } = result.existingVideo;
        setIsOpen(false);
        setRaidId("");
        setVideoInput("");

        const swalResult = await Swal.fire({
          title: t("video.add.existing.title"),
          text: t("video.add.existing.body"),
          icon: "info",
          showCancelButton: true,
          confirmButtonText: t("video.add.existing.go"),
          cancelButtonText: t("video.add.existing.cancel"),
        });
        if (swalResult.isConfirmed) {
          window.location.href = `/video-analysis/${videoId}?raid_id=${existingRaidId}`;
        }
        return;
      }

      setIsOpen(false);
      setRaidId("");
      setVideoInput("");

      await Swal.fire({
        title: t("video.add.success"),
        text: t("video.add.successBody"),
        icon: "success",
        confirmButtonText: t("common.confirm"),
      });
    } catch (error) {
      await Swal.fire({
        title: t("video.add.failure"),
        text: error instanceof Error ? error.message : t("video.add.failure"),
        icon: "error",
        confirmButtonText: t("common.confirm"),
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="bg-sky-500 hover:bg-sky-600 w-full sm:w-auto">
          <Plus className="h-4 w-4 mr-2" />
          {t("video.add.button")}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t("video.add.title")}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 block">{t("video.add.raidLabel")}</label>
            <Select value={raidId} onValueChange={setRaidId}>
              <SelectTrigger>
                <SelectValue placeholder={t("video.add.raidPlaceholder")} />
              </SelectTrigger>
              <SelectContent className="max-h-[300px] overflow-y-auto">
                {raids.map((raid) => (
                  <SelectItem key={raid.id} value={raid.id}>
                    {getRaidName(raid, locale)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-sm font-medium mb-2 block">{t("video.add.urlLabel")}</label>
            <Input
              value={videoInput}
              onChange={(e) => setVideoInput(e.target.value)}
              placeholder={t("video.add.urlPlaceholder")}
            />
          </div>
          <div className="flex gap-2 justify-end">
            <Button
              variant="outline"
              onClick={() => setIsOpen(false)}
              disabled={submitting}
            >
              {t("common.cancel")}
            </Button>
            <Button
              onClick={handleAddToQueue}
              disabled={submitting || !raidId || !videoInput}
            >
              {submitting ? t("video.edit.saving") : t("video.add.submit")}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
