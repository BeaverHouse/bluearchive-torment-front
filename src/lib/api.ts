import { VideoListResponse, VideoDetailResponse, AnalysisResult } from '@/types/video'

const BASE_URL = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8085'}/ba-analyzer/v1`

class APIError extends Error {
  constructor(message: string, public status?: number) {
    super(message)
    this.name = 'APIError'
  }
}

interface FetchAPIOptions {
  method?: string
  body?: unknown
  rawResponse?: boolean
}

async function fetchAPI<T>(endpoint: string, options?: FetchAPIOptions): Promise<T> {
  const url = `${BASE_URL}${endpoint}`
  const { method = 'GET', body, rawResponse } = options || {}

  try {
    const headers: Record<string, string> = {
      'Accept': 'application/json',
      'X-Access-Token': process.env.NEXT_PUBLIC_SERVICE_TOKEN || '',
    }
    if (body) headers['Content-Type'] = 'application/json'

    const response = await fetch(url, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    })

    if (rawResponse) return response as unknown as T

    if (!response.ok) {
      throw new APIError(`API 요청 실패: ${response.status} ${response.statusText}`, response.status)
    }

    return response.json()
  } catch (error) {
    if (error instanceof APIError) {
      throw error
    }
    throw new APIError(`API 연결 실패: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

export async function getVideoList(raidId?: string, page: number = 1, limit: number = 10): Promise<VideoListResponse> {
  const params = new URLSearchParams()
  if (raidId) params.append('raid_id', raidId)
  params.append('page', page.toString())
  params.append('limit', limit.toString())
  
  const queryString = params.toString()
  return fetchAPI<VideoListResponse>(`/video/analysis?${queryString}`)
}

export async function getVideoDetail(videoId: string, raidId?: string): Promise<VideoDetailResponse> {
  const params = new URLSearchParams()
  if (raidId) params.append('raid_id', raidId)

  const queryString = params.toString()
  const endpoint = queryString ? `/video/analysis/${videoId}?${queryString}` : `/video/analysis/${videoId}`
  return fetchAPI<VideoDetailResponse>(endpoint)
}

export async function updateVideoAnalysis(videoId: string, analysisResult: AnalysisResult, raidId?: string): Promise<VideoDetailResponse> {
  return fetchAPI<VideoDetailResponse>(`/video/analysis/${videoId}`, {
    method: 'PUT',
    body: { analysis_result: analysisResult, raid_id: raidId },
  })
}

// Result type for addVideoToQueue
interface AddVideoToQueueResult {
  success: boolean
  existingVideo?: {
    videoId: string
    raidId: string
  }
}

export async function addVideoToQueue(raidId: string, youtubeUrl: string): Promise<AddVideoToQueueResult> {
  const response = await fetchAPI<Response>('/video/analysis/queue', {
    method: 'POST',
    body: { raid_id: raidId, youtube_url: youtubeUrl },
    rawResponse: true,
  })

  if (response.status === 409) {
    const data = await response.json()
    if (data.data?.video_id && data.data?.raid_id) {
      return {
        success: false,
        existingVideo: {
          videoId: data.data.video_id,
          raidId: data.data.raid_id,
        },
      }
    }
    throw new APIError('영상이 이미 처리되었습니다.', 409)
  }

  if (!response.ok) {
    throw new APIError(`API 요청 실패: ${response.status} ${response.statusText}`, response.status)
  }

  return { success: true }
}

export interface QueueItem {
  id: number
  youtube_url: string
  raid_id: string
  status: 'pending' | 'failed'
  created_at: string
}

export interface QueueResponse {
  status_code: number
  message: string
  data: {
    data: QueueItem[]
  }
}

export async function getQueueStatus(): Promise<QueueResponse> {
  return fetchAPI<QueueResponse>('/video/analysis/queue')
}