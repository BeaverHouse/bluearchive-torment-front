import { PartyComposition, SkillOrder, AnalysisResult } from '@/types/video'

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

  if (!analysisResult.total_score || analysisResult.total_score < 0) {
    errors.push({
      field: 'total_score',
      message: '총점은 0 이상이어야 합니다'
    })
  }

  // 파티 구성 검증
  if (!analysisResult.party_compositions || analysisResult.party_compositions.length === 0) {
    errors.push({
      field: 'party_compositions',
      message: '최소 1개의 파티가 필요합니다'
    })
  } else {
    analysisResult.party_compositions.forEach(party => {
      const partyErrors = validatePartyComposition(party)
      errors.push(...partyErrors)
    })
  }

  // 스킬 순서 검증
  if (analysisResult.skill_orders && analysisResult.skill_orders.length > 0) {
    const skillErrors = validateSkillOrders(analysisResult.skill_orders, analysisResult.party_compositions)
    errors.push(...skillErrors)
  }

  return errors
}

export function validatePartyComposition(party: PartyComposition): ValidationError[] {
  const errors: ValidationError[] = []

  // 스트라이커 검증 (최대 4명)
  if (party.strikers.length > 4) {
    errors.push({
      field: 'strikers',
      message: '스트라이커는 최대 4명까지 가능합니다',
      partyNumber: party.party_number
    })
  }

  // 스페셜 검증 (최대 2명)
  if (party.specials.length > 2) {
    errors.push({
      field: 'specials',
      message: '스페셜은 최대 2명까지 가능합니다',
      partyNumber: party.party_number
    })
  }

  // 전체 캐릭터 수 검증 (최대 6명)
  if (party.strikers.length + party.specials.length > 6) {
    errors.push({
      field: 'party_size',
      message: '파티당 최대 6명까지 가능합니다',
      partyNumber: party.party_number
    })
  }

  // 캐릭터 중복 검증
  const allCharacterCodes = [
    ...party.strikers.map(s => s.code),
    ...party.specials.map(s => s.code)
  ]
  const uniqueCodes = new Set(allCharacterCodes)
  if (allCharacterCodes.length !== uniqueCodes.size) {
    errors.push({
      field: 'duplicate_characters',
      message: '파티 내에 중복된 캐릭터가 있습니다',
      partyNumber: party.party_number
    })
  }

  // 캐릭터 필드 검증
  [...party.strikers, ...party.specials].forEach((character, index) => {
    if (!character.code || character.code <= 0) {
      errors.push({
        field: 'character_code',
        message: `캐릭터 코드가 유효하지 않습니다 (${index + 1}번째)`,
        partyNumber: party.party_number
      })
    }

    if (character.star !== undefined && (character.star < 1 || character.star > 5)) {
      errors.push({
        field: 'character_star',
        message: `성급은 1~5 사이여야 합니다 (${index + 1}번째)`,
        partyNumber: party.party_number
      })
    }

    if (character.weapon_star !== undefined && (character.weapon_star < 0 || character.weapon_star > 5)) {
      errors.push({
        field: 'character_weapon_star',
        message: `무기성급은 0~5 사이여야 합니다 (${index + 1}번째)`,
        partyNumber: party.party_number
      })
    }
  })

  return errors
}

export function validateSkillOrders(skillOrders: SkillOrder[], partyCompositions: PartyComposition[]): ValidationError[] {
  const errors: ValidationError[] = []

  // 파티별로 스킬 순서 그룹화
  const skillsByParty = skillOrders.reduce((acc, skill, index) => {
    if (!acc[skill.party_number]) {
      acc[skill.party_number] = []
    }
    acc[skill.party_number].push({ ...skill, originalIndex: index })
    return acc
  }, {} as Record<number, (SkillOrder & { originalIndex: number })[]>)

  // 각 파티별로 시간 순서 검증 (내림차순이어야 함)
  Object.entries(skillsByParty).forEach(([partyNumber, partySkills]) => {
    for (let i = 0; i < partySkills.length - 1; i++) {
      const current = partySkills[i]
      const next = partySkills[i + 1]
      
      if (current.remaining_time < next.remaining_time) {
        errors.push({
          field: 'skill_order_time',
          message: `파티 ${partyNumber}의 스킬 순서 시간이 올바르지 않습니다 (${current.remaining_time} -> ${next.remaining_time})`
        })
      }
    }
  })

  skillOrders.forEach((skill, index) => {
    // 파티 번호 검증
    const party = partyCompositions.find(p => p.party_number === skill.party_number)
    if (!party) {
      errors.push({
        field: 'skill_party_number',
        message: `존재하지 않는 파티 번호입니다: ${skill.party_number} (${index + 1}번째 스킬)`
      })
      return
    }

    // 캐릭터 순서 검증
    const characters = skill.type === 'striker' ? party.strikers : party.specials
    if (skill.order < 1 || skill.order > characters.length) {
      errors.push({
        field: 'skill_character_order',
        message: `파티 ${skill.party_number}의 ${skill.type}에서 ${skill.order}번째 캐릭터가 존재하지 않습니다 (${index + 1}번째 스킬)`
      })
    }

    // 코스트 검증
    if (skill.cost < 0) {
      errors.push({
        field: 'skill_cost',
        message: `스킬 코스트는 0 이상이어야 합니다 (${index + 1}번째 스킬)`
      })
    }

    // 타입 검증
    if (skill.type !== 'striker' && skill.type !== 'special') {
      errors.push({
        field: 'skill_type',
        message: `스킬 타입은 'striker' 또는 'special'이어야 합니다 (${index + 1}번째 스킬)`
      })
    }
  })

  return errors
}