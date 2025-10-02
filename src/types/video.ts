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

export interface VideoData {
  id: string
  video_title: string
  video_description: string
  total_score: number
  youtube_id: string
  thumbnail: string
  party_compositions: PartyComposition[]
  skill_orders: SkillOrder[]
  party_composition_source: string
  analysis_result?: AnalysisResult
  analysis_type?: string
  validation_errors?: string[]
}

// API 응답 타입
export interface VideoListItem {
  video_id: string
  score: number
  title: string
  raid_id: string | null
  updated_at: string
  is_verified: boolean
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
  }
}

