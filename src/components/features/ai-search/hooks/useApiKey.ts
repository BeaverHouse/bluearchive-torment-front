import { useState, useEffect, useRef } from "react";

const API_KEY_TTL_MS = 30 * 60 * 1000; // 30분

// 레거시 스토리지 키 (보안 이슈로 제거됨 - 평문 저장 문제)
const LEGACY_STORAGE_KEYS = [
  "batorment_gemini_api_key",
  "batorment_gemini_api_key_expiry",
];

export function useApiKey() {
  const [apiKey, setApiKey] = useState<string | null>(null);
  const [showApiKeyModal, setShowApiKeyModal] = useState(false);
  const expiryTimerRef = useRef<NodeJS.Timeout | null>(null);

  // 마운트 시 레거시 스토리지 데이터 정리 & 언마운트 시 타이머 정리
  useEffect(() => {
    // 기존 sessionStorage에 저장된 민감 데이터 삭제
    LEGACY_STORAGE_KEYS.forEach((key) => {
      sessionStorage.removeItem(key);
    });

    return () => {
      if (expiryTimerRef.current) {
        clearTimeout(expiryTimerRef.current);
      }
    };
  }, []);

  // API 키 저장 핸들러 (30분 후 만료, 메모리에만 저장)
  const saveApiKey = (key: string) => {
    // 기존 타이머 정리
    if (expiryTimerRef.current) {
      clearTimeout(expiryTimerRef.current);
    }

    setApiKey(key);

    // 30분 후 자동 만료
    expiryTimerRef.current = setTimeout(() => {
      setApiKey(null);
    }, API_KEY_TTL_MS);
  };

  const openApiKeyModal = () => setShowApiKeyModal(true);
  const closeApiKeyModal = () => setShowApiKeyModal(false);

  return {
    apiKey,
    showApiKeyModal,
    saveApiKey,
    openApiKeyModal,
    closeApiKeyModal,
    setShowApiKeyModal,
  };
}
