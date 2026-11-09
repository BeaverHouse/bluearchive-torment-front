import {
  VideoListResponse,
  VideoDetailResponse,
  AnalysisResult,
  VideoPlatform,
  ReviewListResponse,
  ReviewProposal,
  ReviewWorkspaceResponse,
  AnalysisUploadResponse,
} from "@/types/video";

const BASE_URL = `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8085"}/ba-analyzer/v1`;

class APIError extends Error {
  constructor(
    message: string,
    public status?: number,
  ) {
    super(message);
    this.name = "APIError";
  }
}

interface FetchAPIOptions {
  method?: string;
  body?: unknown;
  rawResponse?: boolean;
}

function requestInit({ method = "GET", body }: FetchAPIOptions): RequestInit {
  const headers: Record<string, string> = {
    Accept: "application/json",
    "X-Access-Token": process.env.NEXT_PUBLIC_SERVICE_TOKEN || "",
  };
  if (body) headers["Content-Type"] = "application/json";
  return { method, headers, body: body ? JSON.stringify(body) : undefined };
}

async function fetchAPI<T>(
  endpoint: string,
  options: FetchAPIOptions = {},
): Promise<T> {
  try {
    const response = await fetch(
      `${BASE_URL}${endpoint}`,
      requestInit(options),
    );

    if (options.rawResponse) return response as unknown as T;

    if (!response.ok) {
      throw new APIError(
        `API 요청 실패: ${response.status} ${response.statusText}`,
        response.status,
      );
    }

    return response.json();
  } catch (error) {
    if (error instanceof APIError) {
      throw error;
    }
    throw new APIError(
      `API 연결 실패: ${error instanceof Error ? error.message : "Unknown error"}`,
    );
  }
}

export async function getVideoList(
  raidId?: string,
  page: number = 1,
  limit: number = 10,
): Promise<VideoListResponse> {
  const params = new URLSearchParams();
  if (raidId) params.append("raid_id", raidId);
  params.append("page", page.toString());
  params.append("limit", limit.toString());

  const queryString = params.toString();
  return fetchAPI<VideoListResponse>(`/video/analysis?${queryString}`);
}

export async function getVideoDetail(
  videoId: string,
  raidId?: string,
): Promise<VideoDetailResponse> {
  const params = new URLSearchParams();
  if (raidId) params.append("raid_id", raidId);

  const queryString = params.toString();
  const endpoint = queryString
    ? `/video/analysis/${videoId}?${queryString}`
    : `/video/analysis/${videoId}`;
  return fetchAPI<VideoDetailResponse>(endpoint);
}

// Result type for addVideoToQueue
interface AddVideoToQueueResult {
  success: boolean;
  existingVideo?: {
    videoId: string;
    raidId: string;
  };
}

export async function addVideoToQueue(
  raidId: string,
  videoId: string,
  platform: VideoPlatform,
): Promise<AddVideoToQueueResult> {
  const response = await fetchAPI<Response>("/video/analysis/queue", {
    method: "POST",
    body: { raid_id: raidId, video_id: videoId, platform },
    rawResponse: true,
  });

  if (response.status === 409) {
    const data = await response.json();
    if (data.data?.video_id && data.data?.raid_id) {
      return {
        success: false,
        existingVideo: {
          videoId: data.data.video_id,
          raidId: data.data.raid_id,
        },
      };
    }
    throw new APIError("영상이 이미 처리되었습니다.", 409);
  }

  if (!response.ok) {
    throw new APIError(
      `API 요청 실패: ${response.status} ${response.statusText}`,
      response.status,
    );
  }

  return { success: true };
}

export interface QueueItem {
  id: number;
  video_id: string;
  platform: VideoPlatform;
  raid_id: string;
  status: "pending" | "failed";
  created_at: string;
}

export interface QueueResponse {
  status_code: number;
  message: string;
  data: {
    data: QueueItem[];
  };
}

export async function getQueueStatus(): Promise<QueueResponse> {
  return fetchAPI<QueueResponse>("/video/analysis/queue");
}

export async function submitVideoFeedback(
  videoId: string,
  raidId: string,
  input: { comment: string; trap: string },
): Promise<boolean> {
  try {
    await fetchAPI(`/video/analysis/${videoId}/feedback`, {
      method: "POST",
      body: { raid_id: raidId, ...input },
    });
    return true;
  } catch {
    return false;
  }
}

// The editor's calls, served only by a local API. A save keeps the video's verified state; a
// confirmation verifies the party and ends the review; withdrawing puts the reading back for review.
export async function getVideoReview(): Promise<ReviewListResponse> {
  return fetchAPI<ReviewListResponse>("/video/review?limit=1000");
}

export async function getReviewWorkspace(
  videoId: string,
  raidId: string,
): Promise<ReviewWorkspaceResponse> {
  return fetchAPI<ReviewWorkspaceResponse>(
    `/video/review/${videoId}?raid_id=${encodeURIComponent(raidId)}`,
  );
}

export async function saveReviewAnalysis(
  videoId: string,
  raidId: string,
  analysisResult: AnalysisResult,
): Promise<AnalysisUploadResponse> {
  return fetchAPI<AnalysisUploadResponse>(`/video/review/${videoId}`, {
    method: "PUT",
    body: { raid_id: raidId, analysis_result: analysisResult },
  });
}

export async function confirmReview(
  videoId: string,
  raidId: string,
  analysisResult: AnalysisResult,
): Promise<AnalysisUploadResponse> {
  return fetchAPI<AnalysisUploadResponse>(
    `/video/review/${videoId}/confirmation`,
    {
      method: "PUT",
      body: { raid_id: raidId, analysis_result: analysisResult },
    },
  );
}

export async function moveReviewRaid(
  videoId: string,
  raidId: string,
  newRaidId: string,
): Promise<void> {
  await fetchAPI(`/video/review/${videoId}/raid`, {
    method: "PUT",
    body: { raid_id: raidId, new_raid_id: newRaidId },
  });
}

export async function withdrawReview(proposal: ReviewProposal): Promise<void> {
  await fetchAPI(`/video/review/${proposal.video_id}/confirmation`, {
    method: "DELETE",
    body: { raid_id: proposal.raid_id, proposal },
  });
}

export async function resolveReviewFeedback(feedbackId: number): Promise<void> {
  await fetchAPI(`/video/review/feedback/${feedbackId}/resolve`, {
    method: "PATCH",
  });
}
