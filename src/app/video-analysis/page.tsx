import { Suspense } from "react";
import { VideoAnalysisContent } from "./_components/video-analysis-content";
import Loading from "@/components/common/loading";
import { VideoListResponse } from "@/types/video";

async function getInitialVideos(): Promise<VideoListResponse | null> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8085";
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

export default async function VideoAnalysisPage() {
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
    <Suspense
      fallback={
        <div className="container mx-auto px-2 sm:px-4 py-4 sm:py-6">
          <div className="mb-8">
            <p className="text-muted-foreground">
              1000개 이상의 총력전 영상이 준비되어 있어요.
            </p>
          </div>
          <Loading />
        </div>
      }
    >
      <VideoAnalysisContent
        initialVideos={initialVideos}
        initialPagination={initialPagination}
      />
    </Suspense>
  );
}
