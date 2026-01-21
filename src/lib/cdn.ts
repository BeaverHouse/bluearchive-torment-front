// CDN에서 정적 파일 가져오기
let studentSearchMapCache: Record<string, { nameJa: string; nameKo: string; searchKeywords: string[] | null }> | null = null

// CDN URL 헬퍼 함수
export function getCdnUrl(path: string): string {
  return `${process.env.NEXT_PUBLIC_CDN_URL || ""}${path}`;
}

export function getCharacterImageUrl(code: number | string): string {
  return getCdnUrl(`/batorment/character/${code}.webp`);
}

export function getRaidDataUrl(type: string, raidId: string): string {
  return getCdnUrl(`/batorment/v3/${type}/${raidId}.json`);
}

export async function getStudentSearchMap(): Promise<Record<string, { nameJa: string; nameKo: string; searchKeywords: string[] | null }>> {
  if (studentSearchMapCache) {
    return studentSearchMapCache
  }

  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_CDN_URL}/batorment/v3/student-search-map.json`,
      {
        headers: {
          'Accept': 'application/json',
        },
      }
    )

    if (!response.ok) {
      throw new Error(`Failed to fetch student search map: ${response.status}`)
    }

    const data: Record<string, { nameJa: string; nameKo: string; searchKeywords: string[] | null }> = await response.json()
    studentSearchMapCache = data
    return data
  } catch (error) {
    console.error('Failed to load student search map from CDN:', error)
    return {}
  }
}
