// CDN에서 정적 파일 가져오기
let studentMapCache: Record<string, string> | null = null

export async function getStudentMap(): Promise<Record<string, string>> {
  if (studentMapCache) {
    return studentMapCache
  }

  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_CDN_URL}/batorment/v3/student-map.json`,
      {
        headers: {
          'Accept': 'application/json',
        },
      }
    )

    if (!response.ok) {
      throw new Error(`Failed to fetch student map: ${response.status}`)
    }

    studentMapCache = await response.json()
    return studentMapCache
  } catch (error) {
    console.error('Failed to load student map from CDN:', error)
    return {}
  }
}
