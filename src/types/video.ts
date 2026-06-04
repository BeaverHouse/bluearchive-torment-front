export interface Character {
  code: number
  star_rank?: string
  star?: number
  weapon_star?: number
  is_assist?: boolean
  coordinate?: number[]
}

export interface PartyComposition {
  partyNumber: number
  strikers: Character[]
  specials: Character[]
}

export interface SkillOrder {
  partyNumber: number
  cost: number
  remainingTime: string
  type: string
  order: number
  description?: string
  character_code?: number
}

export interface AnalysisResult {
  partyData: number[][]
  score: number
  skillOrders: SkillOrder[]
  url: string
  description?: string
  validation_errors?: string[]
}

export interface VideoAnalysisData {
  id: number
  video_id: string
  analysis_result: AnalysisResult
  analysis_type: string
  version: number
  created_at: string
  updated_at: string
}

// Video platform. Empty/absent is treated as "youtube" for backward compat.
export type VideoPlatform = "youtube" | "bilibili"

// Bilibili video ids are BV-prefixed (e.g. BV1xx411c7mD); YouTube ids are not.
// Lets components infer the platform from an id when the API field isn't at
// hand (e.g. the edit page, which only has the id).
export function platformFromVideoId(videoId: string): VideoPlatform {
  return videoId.startsWith("BV") ? "bilibili" : "youtube"
}

// API 응답 타입
export interface VideoListItem {
  video_id: string
  score: number
  title: string
  raid_id: string | null
  created_at: string
  party_data: number[][]
  verify_level: number
  // platform/thumbnail_url come from the backend; thumbnail_url is only set for
  // Bilibili (YouTube derives it from video_id). Optional so legacy/cached
  // responses without them still parse.
  platform?: VideoPlatform
  thumbnail_url?: string
}

export interface VideoListResponse {
  status_code: number
  message: string
  data: {
    data: VideoListItem[]
    pagination: {
      page: number
      limit: number
      total: number
      total_pages: number
      has_next: boolean
      has_prev: boolean
    }
  }
}

export interface VideoDetailResponse {
  status_code: number
  message: string
  data: {
    video_id: string
    title: string
    raid_id: string | null
    data: VideoAnalysisData[]
    platform?: VideoPlatform
    thumbnail_url?: string
  }
}

