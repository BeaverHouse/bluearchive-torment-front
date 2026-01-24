import { VideoAnalysisContent } from "./_components/video-analysis-content";
import Loading from "@/components/common/loading";
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
    <VideoAnalysisContent
      initialVideos={initialVideos}
      initialPagination={initialPagination}
      initialRaid={raid || "all"}
    />
  );
}
