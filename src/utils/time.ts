/**
 * 시간 문자열을 초 단위로 변환합니다.
 * @param timeStr - "mm:ss.SSS" 또는 "mm:ss" 형식의 시간 문자열
 * @returns 초 단위 숫자, 파싱 실패 시 null
 */
export function parseTimeToSeconds(timeStr: string): number | null {
  // mm:ss.SSS 형식
  let match = timeStr.match(/^(\d+):(\d{2})\.(\d{3})$/);
  if (match) {
    const minutes = parseInt(match[1]);
    const seconds = parseInt(match[2]);
    const milliseconds = parseInt(match[3]);
    return minutes * 60 + seconds + milliseconds / 1000;
  }

  // mm:ss 형식 (소수점 없음)
  match = timeStr.match(/^(\d+):(\d{2})$/);
  if (match) {
    const minutes = parseInt(match[1]);
    const seconds = parseInt(match[2]);
    return minutes * 60 + seconds;
  }

  return null;
}

/**
 * 초를 시간 문자열(mm:ss.SSS)로 변환합니다.
 * @param seconds - 초 단위 숫자
 * @returns "mm:ss.SSS" 형식의 시간 문자열
 */
export function formatSecondsToTime(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  const ms = Math.round((seconds % 1) * 1000);

  return `${minutes}:${secs.toString().padStart(2, "0")}.${ms.toString().padStart(3, "0")}`;
}
