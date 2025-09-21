"use client";

import { VideoList } from "@/components/VideoList";
import {
  getVideoList,
  addVideoToQueue,
  getQueueStatus,
  QueueItem,
} from "@/lib/api";
import { VideoListItem, RaidData } from "@/types/video";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Plus, Clock, RefreshCw } from "lucide-react";
import { useEffect, useState } from "react";
import raidsData from "../../../data/raids.json";
import ErrorPage from "@/components/ErrorPage";

const raids: RaidData[] = raidsData as RaidData[];

export default function VideoAnalysisPage() {
  const [videos, setVideos] = useState<VideoListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedRaid, setSelectedRaid] = useState<string>("all");
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 15,
    total: 0,
    total_pages: 0,
    has_next: false,
    has_prev: false,
  });

  // 팝업 상태
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [queueRaidId, setQueueRaidId] = useState<string>("");
  const [youtubeUrl, setYoutubeUrl] = useState<string>("");
  const [submitting, setSubmitting] = useState(false);

  // 큐 상태 팝업
  const [isQueueDialogOpen, setIsQueueDialogOpen] = useState(false);
  const [queueItems, setQueueItems] = useState<QueueItem[]>([]);
  const [queueLoading, setQueueLoading] = useState(false);

  useEffect(() => {
    const fetchVideos = async () => {
      try {
        setLoading(true);
        setError(null);
        const raidId = selectedRaid === "all" ? undefined : selectedRaid;
        const response = await getVideoList(
          raidId,
          pagination.page,
          pagination.limit
        );
        setVideos(response.data.data);
        setPagination(response.data.pagination);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "비디오 목록을 불러오는데 실패했습니다"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchVideos();
  }, [selectedRaid, pagination.page]);

  const handleRaidChange = (value: string) => {
    setSelectedRaid(value);
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  const handlePageChange = (newPage: number) => {
    setPagination((prev) => ({ ...prev, page: newPage }));
  };

  const handleAddToQueue = async () => {
    if (!queueRaidId || !youtubeUrl) {
      alert("레이드와 YouTube URL을 모두 입력해주세요.");
      return;
    }

    try {
      setSubmitting(true);
      await addVideoToQueue(queueRaidId, youtubeUrl);
      alert("영상이 분석 큐에 추가되었습니다.");
      setIsDialogOpen(false);
      setQueueRaidId("");
      setYoutubeUrl("");
    } catch (error) {
      alert(error instanceof Error ? error.message : "큐 추가에 실패했습니다.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleFetchQueueStatus = async () => {
    try {
      setQueueLoading(true);
      const response = await getQueueStatus();
      setQueueItems(response.data.data);
    } catch (error) {
      alert(
        error instanceof Error ? error.message : "큐 상태 조회에 실패했습니다."
      );
    } finally {
      setQueueLoading(false);
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

  if (loading) {
    return (
      <div className="container mx-auto px-2 sm:px-4 py-4 sm:py-6">
        <div className="mb-8">
          <p className="text-muted-foreground">
            총력전 영상을 분석하여 파티 구성과 스킬 순서를 확인하세요.
          </p>
        </div>
        <div className="flex justify-center items-center py-12">
          <div className="text-muted-foreground">로딩 중...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return <ErrorPage />;
  }

  return (
    <div className="container mx-auto px-2 sm:px-4 py-4 sm:py-6">
      <div className="mb-8">
        <p className="text-muted-foreground">
          총력전 영상을 분석하여 파티 구성과 스킬 순서를 확인하세요.
        </p>
      </div>
      <div className="mb-6 flex flex-col sm:flex-row gap-4 sm:items-center sm:justify-between">
        <Select value={selectedRaid} onValueChange={handleRaidChange}>
          <SelectTrigger className="w-full sm:w-64">
            <SelectValue placeholder="레이드 선택" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">전체</SelectItem>
            {raids.map((raid) => (
              <SelectItem key={raid.id} value={raid.id}>
                {raid.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          {/* 큐 상태 조회 버튼 */}
          <Dialog open={isQueueDialogOpen} onOpenChange={setIsQueueDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" onClick={handleFetchQueueStatus} className="w-full sm:w-auto">
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
                  ℹ️ 현재 영상 분석은 수동으로 처리되고 있습니다. 추후 자동화
                  시스템으로 업데이트할 예정입니다.
                </p>
              </div>
              <div className="flex justify-end mb-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleFetchQueueStatus}
                  disabled={queueLoading}
                >
                  <RefreshCw
                    className={`h-4 w-4 mr-2 ${
                      queueLoading ? "animate-spin" : ""
                    }`}
                  />
                  새로고침
                </Button>
              </div>
              <div className="space-y-4">
                {queueLoading ? (
                  <div className="text-center py-8 text-muted-foreground">
                    로딩 중...
                  </div>
                ) : queueItems.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    큐가 비어있습니다.
                  </div>
                ) : (
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {queueItems.map((item) => (
                      <div key={item.id} className="border rounded-lg p-4">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-sm font-medium">
                                #{item.id}
                              </span>
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

          {/* 영상 분석 추가 버튼 */}
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-blue-600 hover:bg-blue-700 w-full sm:w-auto">
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
                  <label className="text-sm font-medium mb-2 block">
                    레이드
                  </label>
                  <Select value={queueRaidId} onValueChange={setQueueRaidId}>
                    <SelectTrigger>
                      <SelectValue placeholder="레이드를 선택하세요" />
                    </SelectTrigger>
                    <SelectContent>
                      {raids.map((raid) => (
                        <SelectItem key={raid.id} value={raid.id}>
                          {raid.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">
                    YouTube URL
                  </label>
                  <Input
                    value={youtubeUrl}
                    onChange={(e) => setYoutubeUrl(e.target.value)}
                    placeholder="https://www.youtube.com/watch?v=..."
                  />
                </div>
                <div className="flex gap-2 justify-end">
                  <Button
                    variant="outline"
                    onClick={() => setIsDialogOpen(false)}
                    disabled={submitting}
                  >
                    취소
                  </Button>
                  <Button
                    onClick={handleAddToQueue}
                    disabled={submitting || !queueRaidId || !youtubeUrl}
                  >
                    {submitting ? "추가 중..." : "큐에 추가"}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>
      <VideoList
        videos={videos}
        pagination={pagination}
        onPageChange={handlePageChange}
      />
    </div>
  );
}
