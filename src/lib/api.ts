import { VideoListResponse, VideoDetailResponse, AnalysisResult } from '@/types/video'

const BASE_URL = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8085'}/ba-analyzer/v1`

class APIError extends Error {
  constructor(message: string, public status?: number) {
    super(message)
    this.name = 'APIError'
  }
}

async function fetchAPI<T>(endpoint: string): Promise<T> {
  const url = `${BASE_URL}${endpoint}`

  try {
    const response = await fetch(url, {
      headers: {
        'Accept': 'application/json',
        'X-Access-Token': process.env.NEXT_PUBLIC_SERVICE_TOKEN || '',
      },
    })

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
  const params = new URLSearchParams()

  const queryString = params.toString()
  const url = queryString ? `${BASE_URL}/video/analysis/${videoId}?${queryString}` : `${BASE_URL}/video/analysis/${videoId}`

  try {
    const response = await fetch(url, {
      method: 'PUT',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'X-Access-Token': process.env.NEXT_PUBLIC_SERVICE_TOKEN || '',
      },
      body: JSON.stringify({ analysis_result: analysisResult, raid_id: raidId }),
    })

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

export async function addVideoToQueue(raidId: string, youtubeUrl: string): Promise<void> {
  const url = `${BASE_URL}/video/analysis/queue`

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'X-Access-Token': process.env.NEXT_PUBLIC_SERVICE_TOKEN || '',
      },
      body: JSON.stringify({
        raid_id: raidId,
        youtube_url: youtubeUrl
      }),
    })

    if (!response.ok) {
      throw new APIError(`API 요청 실패: ${response.status} ${response.statusText}`, response.status)
    }
  } catch (error) {
    if (error instanceof APIError) {
      throw error
    }
    throw new APIError(`API 연결 실패: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
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