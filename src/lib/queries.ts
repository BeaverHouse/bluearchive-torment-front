import { getRaidDataUrl } from "./cdn";

interface CDNQueryOptions {
  staleTime?: number;
  gcTime?: number;
}

const DEFAULT_OPTIONS: CDNQueryOptions = {
  staleTime: 1000 * 60 * 5,  // 5분
  gcTime: 1000 * 60 * 10,    // 10분
};

/**
 * CDN에서 JSON 데이터를 가져오는 useQuery 옵션 생성
 * @param type - 데이터 타입 (예: "party", "filter", "summary")
 * @param id - 시즌/레이드 ID
 * @param options - 추가 옵션 (staleTime, gcTime)
 */
export function createCDNQueryOptions<T>(
  type: string,
  id: string,
  options?: CDNQueryOptions
) {
  const { staleTime, gcTime } = { ...DEFAULT_OPTIONS, ...options };

  return {
    queryKey: [`get${type.charAt(0).toUpperCase() + type.slice(1)}Data`, id],
    queryFn: async (): Promise<T> => {
      const response = await fetch(getRaidDataUrl(type, id));
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.json();
    },
    throwOnError: true as const,
    staleTime,
    gcTime,
  };
}
