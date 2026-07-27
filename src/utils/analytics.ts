type Difficulty = 'normal' | 'hard' | 'veryHard' | 'hardcore' | 'extreme' | 'insane' | 'torment' | 'lunatic';
type TimeLimit = '3min' | '4min' | '4min30s';

type SummarySection =
  | 'platinum_stats'
  | 'key_characters'
  | 'top_5_party'
  | 'party_composition'
  | 'special_clears'
  | 'character_details';

type TotalAnalysisSection = 'character_analysis' | 'lunatic_clear_chart' | 'raid_usage_carousel';

type VideoSource = 'party_card' | 'video_list' | 'video_detail' | 'guide' | 'home';

type HomeFeature = 'calculator' | 'party_search' | 'video' | 'arona' | 'guide' | 'total_analysis';

export type AnalyticsEvent =
  | { name: 'home_feature_click'; params: { feature: HomeFeature } }
  | { name: 'calculator_use'; params: { type: 'raid_score' | 'tactical_challenge'; difficulty?: Difficulty; timeLimit?: TimeLimit } }
  | { name: 'party_search_mode'; params: { mode: 'filter' | 'pool' | 'single' } }
  | { name: 'party_search_pool_open'; params?: undefined }
  | { name: 'party_search_pool_save'; params?: undefined }
  | { name: 'summary_view'; params: { season: string; difficulty: 'torment' | 'lunatic' } }
  | { name: 'summary_section_view'; params: { section: SummarySection } }
  | { name: 'total_analysis_section_view'; params: { section: TotalAnalysisSection } }
  // GA가 자동 수집하는 트래픽 소스 파라미터 `source`와 충돌하므로 `video_source` 사용
  | { name: 'video_open'; params: { video_source: VideoSource; video_id: string; raid_id?: string; score?: number } }
  | { name: 'video_filter_apply'; params: { raid_filter: string } }
  | { name: 'video_edit'; params: { video_id: string } }
  | { name: 'arona_query_send'; params: { has_api_key: boolean } }
  | { name: 'arona_apikey_set'; params?: undefined }
  | { name: 'guide_video_click'; params: { video_id: string } }
  | { name: 'wiki_note_view'; params: { context: 'party' | 'student'; slug: string } }
  | { name: 'wiki_note_expand'; params: { context: 'party' | 'student'; slug: string } }
  | { name: 'wiki_doc_view'; params: { slug: string } }
  | { name: 'student_page_view'; params: { student_id: number } };

export function trackEvent<E extends AnalyticsEvent>(name: E['name'], params?: E['params']) {
  if (typeof window !== 'undefined' && typeof window.gtag === 'function') {
    window.gtag('event', name, params ?? {});
  }
}
