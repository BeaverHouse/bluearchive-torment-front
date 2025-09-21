import { VideoListResponse, VideoDetailResponse, AnalysisResult } from '@/types/video'

const BASE_URL = '/ba-analyzer/v1'

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

export async function getVideoList(raidId?: string): Promise<VideoListResponse> {
  const queryParam = raidId ? `?raid_id=${encodeURIComponent(raidId)}` : ''
  return fetchAPI<VideoListResponse>(`/video/analysis${queryParam}`)
}

export async function getVideoDetail(videoId: string): Promise<VideoDetailResponse> {
  return fetchAPI<VideoDetailResponse>(`/video/analysis/${videoId}`)
}

export async function updateVideoAnalysis(videoId: string, analysisResult: AnalysisResult): Promise<VideoDetailResponse> {
  const url = `${BASE_URL}/video/analysis/${videoId}`
  
  try {
    const response = await fetch(url, {
      method: 'PUT',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ analysis_result: analysisResult }),
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