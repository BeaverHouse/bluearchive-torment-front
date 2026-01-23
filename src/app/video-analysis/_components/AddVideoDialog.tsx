"use client";

import { useState } from "react";
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
import { RaidInfo } from "@/types/raid";

interface AddVideoDialogProps {
  raids: RaidInfo[];
}

export function AddVideoDialog({ raids }: AddVideoDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [raidId, setRaidId] = useState<string>("");
  const [youtubeUrl, setYoutubeUrl] = useState<string>("");
  const [submitting, setSubmitting] = useState(false);

  const handleAddToQueue = async () => {
    if (!raidId || !youtubeUrl) {
      alert("레이드와 YouTube URL을 모두 입력해주세요.");
      return;
    }

    try {
      setSubmitting(true);
      await addVideoToQueue(raidId, youtubeUrl);
      alert("영상이 분석 큐에 추가되었습니다.");
      setIsOpen(false);
      setRaidId("");
      setYoutubeUrl("");
    } catch (error) {
      alert(error instanceof Error ? error.message : "큐 추가에 실패했습니다.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="bg-sky-500 hover:bg-sky-600 w-full sm:w-auto">
          <Plus className="h-4 w-4 mr-2" />
          영상 분석 추가
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>영상 분석 큐에 추가</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 block">레이드</label>
            <Select value={raidId} onValueChange={setRaidId}>
              <SelectTrigger>
                <SelectValue placeholder="레이드를 선택하세요" />
              </SelectTrigger>
              <SelectContent className="max-h-[300px] overflow-y-auto">
                {raids.map((raid) => (
                  <SelectItem key={raid.id} value={raid.id}>
                    {raid.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-sm font-medium mb-2 block">YouTube URL</label>
            <Input
              value={youtubeUrl}
              onChange={(e) => setYoutubeUrl(e.target.value)}
              placeholder="https://www.youtube.com/watch?v=..."
            />
          </div>
          <div className="flex gap-2 justify-end">
            <Button
              variant="outline"
              onClick={() => setIsOpen(false)}
              disabled={submitting}
            >
              취소
            </Button>
            <Button
              onClick={handleAddToQueue}
              disabled={submitting || !raidId || !youtubeUrl}
            >
              {submitting ? "추가 중..." : "큐에 추가"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
