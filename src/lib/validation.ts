import { AnalysisResult } from '@/types/video'

export interface ValidationError {
  field: string
  message: string
  partyNumber?: number
}

export function validateAnalysisResult(analysisResult: AnalysisResult): ValidationError[] {
  const errors: ValidationError[] = []

  // 기본 필드 검증
  if (!analysisResult.url || !analysisResult.url.includes('youtube.com')) {
    errors.push({
      field: 'url',
      message: 'YouTube URL이 필요합니다'
    })
  }

  if (!analysisResult.score || analysisResult.score < 0) {
    errors.push({
      field: 'score',
      message: '점수는 0 이상이어야 합니다'
    })
  }

  // 파티 구성 검증
  if (!analysisResult.partyData || analysisResult.partyData.length === 0) {
    errors.push({
      field: 'partyData',
      message: '최소 1개의 파티가 필요합니다'
    })
  } else {
    analysisResult.partyData.forEach((party, index) => {
      if (!Array.isArray(party) || party.length !== 6) {
        errors.push({
          field: 'partyData',
          message: `파티 ${index + 1}은 6개의 슬롯이 필요합니다`,
          partyNumber: index + 1
        })
      }
    })
  }

  return errors
}