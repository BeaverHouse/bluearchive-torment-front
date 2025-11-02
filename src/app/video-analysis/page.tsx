"use client";

import { VideoList } from "@/components/video-list";
import {
  getVideoList,
  addVideoToQueue,
  getQueueStatus,
  QueueItem,
} from "@/lib/api";
import { VideoListItem } from "@/types/video";
import { RaidInfo } from "@/types/raid";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SingleSelect } from "@/components/ui/custom/single-select";
import { Pagination } from "@/components/custom/pagination";
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
import { Plus, Clock, RefreshCw, Copy, CheckCircle } from "lucide-react";
import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import raidsData from "../../../data/raids.json";
import studentsData from "../../../data/students.json";
import ErrorPage from "@/components/error-page";
import { translations } from "@/constants/assault";
import { filteredPartys, getFilters } from "@/lib/party-filters";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { ChevronDownIcon } from "@radix-ui/react-icons";
import { Cascader } from "@/components/custom/cascader";
import { MultiSelect } from "@/components/custom/multi-select";
import { Checkbox } from "@/components/ui/checkbox";
import Swal from "sweetalert2";
import Loading from "@/components/common/loading";

const raids: RaidInfo[] = raidsData as RaidInfo[];

function VideoAnalysisContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const raidFromUrl = searchParams.get("raid");

  const [videos, setVideos] = useState<VideoListItem[]>([]);
  const [allVideos, setAllVideos] = useState<VideoListItem[]>([]);
  const [filteredVideos, setFilteredVideos] = useState<VideoListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedRaid, setSelectedRaid] = useState<string>("all");
  const [isFilterMode, setIsFilterMode] = useState(false);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 15,
    total: 0,
    total_pages: 0,
    has_next: false,
    has_prev: false,
  });

  // 필터 상태
  const [pageSize, setPageSize] = useState(15);
  const [currentPage, setCurrentPage] = useState(1);

  // 파티 필터 상태
  const [scoreRange, setScoreRange] = useState([0, 100000000]);
  const [includeList, setIncludeList] = useState<Array<number[]>>([]);
  const [excludeList, setExcludeList] = useState<number[]>([]);
  const [assist, setAssist] = useState<number[] | undefined>(undefined);
  const [partyCountRange, setPartyCountRange] = useState([0, 99]);
  const [hardExclude, setHardExclude] = useState(false);
  const [allowDuplicate, setAllowDuplicate] = useState(false);

  const studentsMap = studentsData as Record<string, string>;

  // 필터 데이터 상태
  const [filterData, setFilterData] = useState<{
    filters: Record<string, Record<string, number>>;
    assistFilters: Record<string, Record<string, number>>;
  } | null>(null);

  // 팝업 상태
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [queueRaidId, setQueueRaidId] = useState<string>("");
  const [youtubeUrl, setYoutubeUrl] = useState<string>("");
  const [submitting, setSubmitting] = useState(false);

  // 큐 상태 팝업
  const [isQueueDialogOpen, setIsQueueDialogOpen] = useState(false);
  const [queueItems, setQueueItems] = useState<QueueItem[]>([]);
  const [queueLoading, setQueueLoading] = useState(false);

  // 검색어 복사
  const [copiedSearchTerm, setCopiedSearchTerm] = useState(false);

  // URL에서 raid 파라미터를 항상 읽어서 selectedRaid 설정 (없으면 "all")
  useEffect(() => {
    const raidValue = raidFromUrl || "all";
    setSelectedRaid(raidValue);
    setIsFilterMode(raidValue !== "all");

    // 필터 모드가 아니면 상태 초기화
    if (raidValue === "all") {
      setPagination((prev) => ({ ...prev, page: 1, limit: 15 }));
      setCurrentPage(1);
      setScoreRange([0, 100000000]);
      setIncludeList([]);
      setExcludeList([]);
      setAssist(undefined);
      setPartyCountRange([0, 99]);
    }
  }, [raidFromUrl]);

  // 필터 데이터 로드
  useEffect(() => {
    const loadFilterData = async () => {
      if (!isFilterMode || !selectedRaid || selectedRaid === "all") {
        setFilterData(null);
        return;
      }

      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_CDN_URL}/batorment/v3/video-filter/${selectedRaid}.json`
        );
        if (response.ok) {
          const data = await response.json();
          setFilterData(data);
        }
      } catch (error) {
        console.error("Failed to load filter data:", error);
      }
    };

    loadFilterData();
  }, [isFilterMode, selectedRaid]);

  // 비디오 데이터 로드
  useEffect(() => {
    const fetchVideos = async () => {
      try {
        setLoading(true);
        setError(null);

        if (isFilterMode && selectedRaid !== "all") {
          // 필터 모드: limit 1000으로 전체 데이터 가져오기
          const response = await getVideoList(selectedRaid, 1, 1000);
          setAllVideos(response.data.data);
          setFilteredVideos(response.data.data);
        } else {
          // 일반 모드: 기존 페이지네이션 방식
          const response = await getVideoList(undefined, pagination.page, 15);
          setVideos(response.data.data);
          setPagination(response.data.pagination);
        }
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
  }, [selectedRaid, pagination.page, isFilterMode]);

  const handleRaidChange = (value: string) => {
    setSelectedRaid(value);
    setPagination((prev) => ({ ...prev, page: 1 }));

    // URL query param 업데이트
    const params = new URLSearchParams(searchParams.toString());
    if (value === "all") {
      params.delete("raid");
    } else {
      params.set("raid", value);
    }

    const newUrl = params.toString()
      ? `${pathname}?${params.toString()}`
      : pathname;
    router.replace(newUrl);
  };

  const handlePageChange = (newPage: number) => {
    if (isFilterMode) {
      setCurrentPage(newPage);
    } else {
      setPagination((prev) => ({ ...prev, page: newPage }));
    }
  };

  // 필터 초기화 함수
  const removeFilters = () => {
    setScoreRange([0, 100000000]);
    setIncludeList([]);
    setExcludeList([]);
    setAssist(undefined);
    setPartyCountRange([0, 99]);
    setHardExclude(false);
    setAllowDuplicate(false);
    setCurrentPage(1);
  };

  // 비디오 데이터를 파티 데이터로 변환
  const convertVideosToPartyData = (videoList: VideoListItem[]) => {
    return videoList.map((video) => ({
      rank: 1,
      score: video.score,
      partyData: video.party_data || [],
    }));
  };

  // 필터링된 파티 계산
  const getFilteredParties = () => {
    if (!isFilterMode || !filterData) {
      return filteredVideos;
    }

    const partyData = convertVideosToPartyData(allVideos);
    const raidData = {
      parties: partyData,
      minPartys: Math.min(...partyData.map((p) => p.partyData.length)) || 1,
      maxPartys: Math.max(...partyData.map((p) => p.partyData.length)) || 10,
    };

    const filtered = filteredPartys(
      raidData,
      [],
      ["I", "T", "L"],
      includeList,
      excludeList,
      assist,
      partyCountRange,
      hardExclude,
      allowDuplicate,
      false
    );

    const filteredScores = new Set(filtered.map((p) => p.score));
    return allVideos.filter(
      (video) =>
        filteredScores.has(video.score) &&
        video.score >= scoreRange[0] &&
        video.score <= scoreRange[1]
    );
  };

  // 표시할 비디오 계산
  const getDisplayVideos = () => {
    if (!isFilterMode) {
      return videos;
    }

    const filtered = getFilteredParties();
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    return filtered.slice(startIndex, endIndex);
  };

  // 페이지네이션 정보 계산
  const getFilterModePagination = () => {
    if (!isFilterMode) {
      return pagination;
    }

    const filtered = getFilteredParties();
    const totalPages = Math.ceil(filtered.length / pageSize);
    return {
      page: currentPage,
      limit: pageSize,
      total: filtered.length,
      total_pages: totalPages,
      has_next: currentPage < totalPages,
      has_prev: currentPage > 1,
    };
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

  // 검색어 생성 및 복사 함수
  const generateSearchKeyword = (raidId: string) => {
    const raid = raids.find((r) => r.id === raidId);
    if (!raid) return "";

    const keywords = Object.keys(translations)
      .filter((key) => raid.name.includes(key))
      .map((key) => translations[key]);

    const level = raid.top_level;
    const levelText =
      level === "T" ? "TORMENT" : level === "L" ? "LUNATIC" : "";

    return (keywords.join(" ") + " " + levelText).trim();
  };

  const copySearchTerm = async () => {
    if (selectedRaid === "all") {
      Swal.fire("총력전을 선택해주세요!");
      return;
    }

    const searchKeyword = generateSearchKeyword(selectedRaid);
    if (!searchKeyword) {
      Swal.fire("검색어를 생성할 수 없습니다!");
      return;
    }

    try {
      await navigator.clipboard.writeText(searchKeyword);
      setCopiedSearchTerm(true);
      setTimeout(() => setCopiedSearchTerm(false), 2000);
      Swal.fire("검색어가 복사되었습니다!");
    } catch (err) {
      console.error("Failed to copy search term:", err);
      Swal.fire("복사에 실패했습니다!");
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
        <Loading />
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
      {/* 선택된 총력전의 검색어 표시 */}
      {selectedRaid !== "all" && (
        <div className="mb-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 mb-4">
            <span className="text-sm text-muted-foreground shrink-0">
              검색어:
            </span>
            <code className="px-2 py-1 bg-muted rounded text-xs sm:text-sm break-all">
              {generateSearchKeyword(selectedRaid)}
            </code>
            <Button
              variant="outline"
              size="sm"
              onClick={copySearchTerm}
              className="flex items-center gap-1 shrink-0"
            >
              {copiedSearchTerm ? (
                <>
                  <CheckCircle className="h-3 w-3" />
                  <span className="hidden sm:inline">Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="h-3 w-3" />
                  <span className="hidden sm:inline">Copy</span>
                </>
              )}
            </Button>
          </div>
        </div>
      )}

      {/* RaidSearch와 동일한 필터 UI */}
      {isFilterMode && filterData && (
        <div className="mx-auto mb-5 w-full">
          <Collapsible defaultOpen>
            <CollapsibleTrigger className="flex w-full items-center justify-between rounded-lg border border-gray-200 p-4 hover:bg-gray-50 dark:hover:bg-gray-800 dark:border-gray-700 dark:hover:bg-gray-800">
              <span className="text-sm font-medium">파티 Filter</span>
              <ChevronDownIcon className="h-4 w-4 transition-transform" />
            </CollapsibleTrigger>
            <CollapsibleContent className="border-l border-r border-b border-gray-200 p-4 dark:border-gray-700">
              <Button
                className="w-60 mb-5"
                onClick={() => {
                  const confirm =
                    window.confirm("모든 캐릭터 필터가 리셋됩니다.");
                  if (confirm) removeFilters();
                }}
                variant="destructive"
              >
                필터 Reset
              </Button>
              <br />
              {/* 점수 & 파티 수 Filter */}
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-center gap-6 mb-6">
                {/* 점수 Filter */}
                <div className="flex flex-col items-center">
                  <label className="text-sm font-medium mb-2">점수 범위</label>
                  <div className="flex items-center gap-2">
                    <Input
                      type="number"
                      value={scoreRange[0]}
                      onChange={(e) => {
                        const min = parseInt(e.target.value) || 0;
                        setScoreRange([min, Math.max(min, scoreRange[1])]);
                      }}
                      placeholder="최소 점수"
                      className="w-32 text-center"
                    />
                    <span className="text-sm text-muted-foreground">~</span>
                    <Input
                      type="number"
                      value={scoreRange[1]}
                      onChange={(e) => {
                        const max = parseInt(e.target.value) || 100000000;
                        setScoreRange([Math.min(scoreRange[0], max), max]);
                      }}
                      placeholder="최대 점수"
                      className="w-32 text-center"
                    />
                  </div>
                </div>

                {/* 파티 수 Filter */}
                <div className="flex flex-col items-center">
                  <label className="text-sm font-medium mb-2">파티 수</label>
                  <div className="flex items-center gap-2">
                    <Select
                      value={partyCountRange[0].toString()}
                      onValueChange={(value) => {
                        const min = parseInt(value);
                        setPartyCountRange([
                          min,
                          Math.max(min, partyCountRange[1]),
                        ]);
                      }}
                    >
                      <SelectTrigger className="w-20">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="0">전체</SelectItem>
                        {Array.from({ length: 20 }, (_, i) => {
                          const value = i + 1;
                          return (
                            <SelectItem key={value} value={value.toString()}>
                              {value}
                            </SelectItem>
                          );
                        })}
                      </SelectContent>
                    </Select>
                    <span className="text-sm text-muted-foreground">~</span>
                    <Select
                      value={partyCountRange[1].toString()}
                      onValueChange={(value) => {
                        const max = parseInt(value);
                        setPartyCountRange([
                          Math.min(partyCountRange[0], max),
                          max,
                        ]);
                      }}
                    >
                      <SelectTrigger className="w-20">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Array.from({ length: 20 }, (_, i) => {
                          const value = i + 1;
                          return (
                            <SelectItem key={value} value={value.toString()}>
                              {value}
                            </SelectItem>
                          );
                        })}
                        <SelectItem value="99">전체</SelectItem>
                      </SelectContent>
                    </Select>
                    <span className="text-sm text-muted-foreground">파티</span>
                  </div>
                </div>
              </div>
              {/* 포함 캐릭터 Filter */}
              <div className="mb-4">
                <label className="text-sm font-medium mb-2 block">
                  포함할 <strong>내 캐릭터</strong>
                </label>
                <Cascader
                  multiple
                  options={getFilters(filterData.filters, studentsMap)}
                  value={includeList}
                  onChange={setIncludeList}
                  placeholder="캐릭터를 선택하세요"
                  className="w-full"
                  allowClear
                  showSearch
                />
              </div>
              {/* 제외 캐릭터 Filter */}
              <div className="mb-4">
                <label className="text-sm font-medium mb-2 block">
                  제외할 <strong>내 캐릭터</strong>
                </label>
                <MultiSelect
                  options={Object.keys(filterData.filters).map((key) => ({
                    value: parseInt(key),
                    label: studentsMap[key],
                  }))}
                  value={excludeList}
                  onChange={(value) => setExcludeList(value as number[])}
                  placeholder="제외할 캐릭터를 선택하세요"
                  className="w-full"
                  allowClear
                  showSearch
                />
              </div>
              <div className="flex items-center space-x-2 mb-4">
                <Checkbox
                  id="hardExclude"
                  checked={hardExclude}
                  onCheckedChange={(checked) => setHardExclude(!!checked)}
                />
                <label htmlFor="hardExclude" className="text-sm">
                  조력자에서도 제외
                </label>
              </div>
              {/* 조력자 Filter */}
              <div className="mb-4">
                <label className="text-sm font-medium mb-2 block">조력자</label>
                <Cascader
                  options={getFilters(filterData.assistFilters, studentsMap)}
                  value={assist ? [assist] : []}
                  onChange={(value) =>
                    setAssist(value.length > 0 ? value[0] : undefined)
                  }
                  placeholder="조력자를 선택하세요"
                  className="w-full"
                  allowClear
                  showSearch
                />
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="allowDuplicate"
                  checked={allowDuplicate}
                  onCheckedChange={(checked) => setAllowDuplicate(!!checked)}
                />
                <label htmlFor="allowDuplicate" className="text-sm">
                  조력자 포함 중복 허용
                </label>
              </div>
            </CollapsibleContent>
          </Collapsible>
        </div>
      )}

      <div className="mx-auto mb-5 w-full">
        검색 결과: 총 {getFilterModePagination().total}개
      </div>

      {/* 페이지네이션 */}
      {(isFilterMode
        ? getFilterModePagination().total_pages > 1
        : pagination.total_pages > 1) && (
        <div className="mb-5">
          <Pagination
            currentPage={isFilterMode ? currentPage : pagination.page}
            totalItems={
              isFilterMode ? getFilterModePagination().total : pagination.total
            }
            pageSize={isFilterMode ? pageSize : pagination.limit}
            onPageChange={handlePageChange}
            onPageSizeChange={(newPageSize) => {
              setPageSize(newPageSize);
              setCurrentPage(1);
            }}
            pageSizeOptions={[15, 30]}
          />
        </div>
      )}

      <div className="mb-6 flex flex-col sm:flex-row gap-4 sm:items-center sm:justify-between">
        <SingleSelect
          options={[
            { value: "all", label: "전체" },
            ...raids.map((raid) => ({
              value: raid.id,
              label: raid.name,
            })),
          ]}
          value={selectedRaid}
          onChange={handleRaidChange}
          placeholder="총력전/대결전 선택"
        />

        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          {/* 큐 상태 조회 버튼 */}
          <Dialog open={isQueueDialogOpen} onOpenChange={setIsQueueDialogOpen}>
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
      <VideoList videos={getDisplayVideos()} />
    </div>
  );
}

export default function VideoAnalysisPage() {
  return (
    <Suspense
      fallback={
        <div className="container mx-auto px-2 sm:px-4 py-4 sm:py-6">
          <div className="mb-8">
            <p className="text-muted-foreground">
              총력전 영상을 분석하여 파티 구성과 스킬 순서를 확인하세요.
            </p>
          </div>
          <Loading />
        </div>
      }
    >
      <VideoAnalysisContent />
    </Suspense>
  );
}
