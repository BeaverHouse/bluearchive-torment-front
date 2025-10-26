import { sendGAEvent } from '@next/third-parties/google';

/**
 * Google Analytics 이벤트를 전송합니다
 * @param eventName 이벤트 이름
 * @param params 이벤트 파라미터
 */
export function trackEvent(eventName: string, params?: Record<string, string | number>) {
  if (params) {
    sendGAEvent('event', eventName, params);
  } else {
    sendGAEvent('event', eventName, {});
  }
}

/**
 * 요약 탭 클릭 이벤트
 */
export function trackSummaryTabClick(tabType: 'summary' | 'summary-lunatic') {
  trackEvent('summary_tab_click', {
    tab_type: tabType,
  });
}

/**
 * YouTube 영상 카드 클릭 이벤트
 */
export function trackVideoCardClick(videoId: string, raidId: string, score: number) {
  trackEvent('video_card_click', {
    video_id: videoId,
    raid_id: raidId,
    score: score,
  });
}
