import { VideoAnalysisContent } from "./_components/video-analysis-content";
import { ServerVideoList } from "./_components/server-video-list";
import { VideoListResponse } from "@/types/video";

async function getInitialVideos(): Promise<VideoListResponse | null> {
  try {
    let baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8085";

    // 서버 사이드에서 상대 경로는 사용할 수 없으므로 실제 API URL 사용
    if (baseUrl.startsWith("/")) {
      baseUrl = "https://api.tinyclover.com";
    }

    const response = await fetch(
      `${baseUrl}/ba-analyzer/v1/video/analysis?page=1&limit=15`,
      {
        headers: {
          Accept: "application/json",
          "X-Access-Token": process.env.NEXT_PUBLIC_SERVICE_TOKEN || "",
        },
      }
    );

    if (!response.ok) {
      console.error("Failed to fetch initial videos:", response.status);
      return null;
    }

    return response.json();
  } catch (error) {
    console.error("Error fetching initial videos:", error);
    return null;
  }
}

export default async function VideoAnalysisPage({
  searchParams,
}: {
  searchParams: Promise<{ raid?: string }>;
}) {
  const { raid } = await searchParams;
  const initialData = await getInitialVideos();

  const initialVideos = initialData?.data.data || [];
  const initialPagination = initialData?.data.pagination || {
    page: 1,
    limit: 15,
    total: 0,
    total_pages: 0,
    has_next: false,
    has_prev: false,
  };

  return (
    <>
      {/* 서버 컴포넌트: HTML로 렌더링됨 (Adsense 크롤러용) */}
      {/* 클라이언트 JS 로드 후 VideoAnalysisContent가 이를 숨김 */}
      <div id="server-video-list" className="container mx-auto px-2 sm:px-4 py-4 sm:py-6">
        <div className="mb-8">
          <p className="text-muted-foreground">
            1000개 이상의 총력전 영상이 준비되어 있어요.
          </p>
        </div>
        <div className="mx-auto mb-5 w-full">
          검색 결과: 총 {initialPagination.total}개
        </div>
        <ServerVideoList videos={initialVideos} />
      </div>

      {/* 클라이언트 컴포넌트: 상호작용 가능한 전체 UI */}
      <VideoAnalysisContent
        initialVideos={initialVideos}
        initialPagination={initialPagination}
        initialRaid={raid || "all"}
      />
    </>
  );
}
