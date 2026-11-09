export interface Character {
  code: number;
  star_rank?: string;
  star?: number;
  weapon_star?: number;
  is_assist?: boolean;
  coordinate?: number[];
}

export interface PartyComposition {
  partyNumber: number;
  strikers: Character[];
  specials: Character[];
}

export interface AnalysisResult {
  partyData: number[][];
  score: number;
  description?: string;
  validation_errors?: string[];
}

export interface VideoAnalysisData {
  id: number;
  video_id: string;
  analysis_result: AnalysisResult;
  analysis_type: string;
  version: number;
  /** Absent from servers deployed before the field was added. */
  is_verified?: boolean;
  created_at: string;
  updated_at: string;
}

// Video platform. Empty/absent is treated as "youtube" for backward compat.
export type VideoPlatform = "youtube" | "bilibili";

// Bilibili video ids are BV-prefixed (e.g. BV1xx411c7mD); YouTube ids are not.
// Lets components infer the platform from an id when the API field isn't at
// hand (e.g. the edit page, which only has the id).
export function platformFromVideoId(videoId: string): VideoPlatform {
  return videoId.startsWith("BV") ? "bilibili" : "youtube";
}

export function buildVideoUrl(
  platform: VideoPlatform,
  videoId: string,
): string {
  if (platform === "bilibili")
    return `https://www.bilibili.com/video/${videoId}`;
  return `https://www.youtube.com/watch?v=${videoId}`;
}

export function buildVideoEmbedUrl(
  platform: VideoPlatform,
  videoId: string,
): string {
  if (platform === "bilibili")
    return `https://player.bilibili.com/player.html?bvid=${videoId}&high_quality=1&autoplay=0`;
  return `https://www.youtube.com/embed/${videoId}`;
}

export interface VideoReference {
  video_id: string;
  platform: VideoPlatform;
}

export function parseVideoReference(input: string): VideoReference | null {
  const trimmed = input.trim();
  const bilibiliMatch = trimmed.match(/BV[a-zA-Z0-9]+/);
  if (bilibiliMatch)
    return { video_id: bilibiliMatch[0], platform: "bilibili" };

  const youtubeId = extractYouTubeVideoId(trimmed);
  if (youtubeId) return { video_id: youtubeId, platform: "youtube" };

  return null;
}

const YOUTUBE_ID = /^[a-zA-Z0-9_-]{11}$/;

function youTubeIdFromUrl(parsed: URL): string | null {
  if (/youtu\.be$/i.test(parsed.hostname)) {
    const id = parsed.pathname.split("/").filter(Boolean)[0];
    return id && YOUTUBE_ID.test(id) ? id : null;
  }
  if (!/youtube(-nocookie)?\.com$/i.test(parsed.hostname)) return null;
  const queryID = parsed.searchParams.get("v");
  if (queryID && YOUTUBE_ID.test(queryID)) return queryID;
  const pathID = parsed.pathname.match(/\/(?:embed|v)\/([a-zA-Z0-9_-]{11})/);
  return pathID ? pathID[1] : null;
}

function extractYouTubeVideoId(input: string): string | null {
  if (YOUTUBE_ID.test(input)) return input;
  try {
    return youTubeIdFromUrl(new URL(input));
  } catch {
    return null;
  }
}

// API 응답 타입
export interface VideoListItem {
  video_id: string;
  score: number;
  title: string;
  raid_id: string | null;
  created_at: string;
  party_data: number[][];
  verify_level: number;
  // platform/thumbnail_url come from the backend; thumbnail_url is only set for
  // Bilibili (YouTube derives it from video_id). Optional so legacy/cached
  // responses without them still parse.
  platform?: VideoPlatform;
  thumbnail_url?: string;
}

export interface VideoListResponse {
  status_code: number;
  message: string;
  data: {
    data: VideoListItem[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      total_pages: number;
      has_next: boolean;
      has_prev: boolean;
    };
  };
}

export interface VideoDetailResponse {
  status_code: number;
  message: string;
  data: {
    video_id: string;
    title: string;
    raid_id: string | null;
    data: VideoAnalysisData[];
    platform?: VideoPlatform;
    thumbnail_url?: string;
  };
}

// A ranking entry the review screen proposes or offers for a video.
export interface ReviewEntry {
  rank: number;
  score: number;
  partyData: number[][];
}

export interface ReviewStudent {
  code: number;
  badge?: string;
}

// One unverified video with the evidence read from it and the ranking entries that evidence selects.
export interface ReviewProposal {
  video_id: string;
  raid_id: string;
  platform: VideoPlatform;
  title: string;
  decision: "confirmed" | "choose" | "mismatch" | "unranked" | "needs_frames";
  reason: string;
  note?: string;
  scores: number[];
  score_spans: [number, number][];
  rank: number;
  seen: ReviewStudent[];
  proposed?: ReviewEntry;
  candidates: ReviewEntry[];
  // Public URLs of the lineup screens, at the size they were sampled.
  frames: string[];
}

export interface ReviewListResponse {
  status_code: number;
  message: string;
  data: ReviewProposal[];
}

export interface AnalysisUploadResponse {
  status_code: number;
  message: string;
  data: { id: number };
}

// A visitor's pending correction suggestion for a video.
export interface VideoFeedbackItem {
  id: number;
  comment: string;
  created_at: string;
}

// Everything the editor needs for one video, verified or not.
export interface ReviewWorkspace {
  video: VideoDetailResponse["data"];
  proposal: ReviewProposal | null;
  feedback: VideoFeedbackItem[];
}

export interface ReviewWorkspaceResponse {
  status_code: number;
  message: string;
  data: ReviewWorkspace;
}
