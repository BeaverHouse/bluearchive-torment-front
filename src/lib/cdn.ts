// CDN에서 정적 파일 가져오기
let studentSearchMapCache: Record<string, { nameJa: string; nameKo: string; searchKeywords: string[] | null }> | null = null

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

/**
 * student-search-map에서 간단한 이름 맵을 추출
 * @deprecated getStudentSearchMap을 사용하고 nameKo를 직접 추출하세요
 */
export async function getStudentMap(): Promise<Record<string, string>> {
  const searchMap = await getStudentSearchMap()
  const nameMap: Record<string, string> = {}

  for (const [id, data] of Object.entries(searchMap)) {
    nameMap[id] = data.nameKo
  }

  return nameMap
}
