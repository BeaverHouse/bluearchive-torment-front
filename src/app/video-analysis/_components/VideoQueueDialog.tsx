"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Clock, RefreshCw } from "lucide-react";
import { getQueueStatus, QueueItem } from "@/lib/api";
import { RaidInfo } from "@/types/raid";

interface VideoQueueDialogProps {
  raids: RaidInfo[];
}

export function VideoQueueDialog({ raids }: VideoQueueDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [queueItems, setQueueItems] = useState<QueueItem[]>([]);
  const [loading, setLoading] = useState(false);

  const handleFetchQueueStatus = async () => {
    try {
      setLoading(true);
      const response = await getQueueStatus();
      setQueueItems(response.data.data);
    } catch (error) {
      alert(error instanceof Error ? error.message : "큐 상태 조회에 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  const getRaidName = (raidId: string) => {
    const raid = raids.find((r) => r.id === raidId);
    return raid?.name || raidId;
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return (
          <Badge
            variant="outline"
            className="bg-yellow-50 text-yellow-700 border-yellow-200"
          >
            대기중
          </Badge>
        );
      case "failed":
        return (
          <Badge
            variant="outline"
            className="bg-red-50 text-red-700 border-red-200"
          >
            실패
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          onClick={handleFetchQueueStatus}
          className="w-full sm:w-auto"
        >
          <Clock className="h-4 w-4 mr-2" />
          분석 큐 상태
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>분석 큐 상태</DialogTitle>
        </DialogHeader>
        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-800">
            영상 분석은 AI로 1차 처리된 다음 수동으로 2차 확인을 하고 있어요.
          </p>
        </div>
        <div className="flex justify-end mb-4">
          <Button
            variant="outline"
            size="sm"
            onClick={handleFetchQueueStatus}
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
            새로고침
          </Button>
        </div>
        <div className="space-y-4">
          {loading ? (
            <div className="text-center py-8 text-muted-foreground">로딩 중...</div>
          ) : queueItems.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">큐가 비어있습니다.</div>
          ) : (
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {queueItems.map((item) => (
                <div key={item.id} className="border rounded-lg p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-medium">#{item.id}</span>
                        {getStatusBadge(item.status)}
                      </div>
                      <div className="text-sm text-muted-foreground mb-1">
                        레이드: {getRaidName(item.raid_id)}
                      </div>
                      <div className="text-xs text-muted-foreground truncate">
                        URL: {item.youtube_url}
                      </div>
                    </div>
                    <div className="text-xs text-muted-foreground ml-4">
                      {new Date(item.created_at).toLocaleString("ko-KR")}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
