import { VideoListResponse, VideoDetailResponse } from '@/types/video'

const BASE_URL = '/api'

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
  return fetchAPI<VideoListResponse>(`/v1/video-analysis/summary${queryParam}`)
}

export async function getVideoDetail(videoId: string): Promise<VideoDetailResponse> {
  return fetchAPI<VideoDetailResponse>(`/v1/video-analysis/${videoId}`)
}

export async function updateVideoAnalysis(videoId: string, analysisResult: any): Promise<VideoDetailResponse> {
  const url = `/api/v1/video-analysis/${videoId}`
  
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