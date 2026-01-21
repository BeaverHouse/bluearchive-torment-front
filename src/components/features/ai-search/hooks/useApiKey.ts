import { useState, useEffect } from "react";

const API_KEY_STORAGE_KEY = "batorment_gemini_api_key";
const API_KEY_EXPIRY_KEY = "batorment_gemini_api_key_expiry";
const API_KEY_TTL_MS = 30 * 60 * 1000; // 30분

export function useApiKey() {
  const [apiKey, setApiKey] = useState<string | null>(null);
  const [showApiKeyModal, setShowApiKeyModal] = useState(false);

  // 세션스토리지에서 API 키 로드 (30분 만료)
  useEffect(() => {
    const savedKey = sessionStorage.getItem(API_KEY_STORAGE_KEY);
    const expiry = sessionStorage.getItem(API_KEY_EXPIRY_KEY);

    if (savedKey && expiry) {
      const expiryTime = parseInt(expiry, 10);
      if (Date.now() < expiryTime) {
        setApiKey(savedKey);
      } else {
        sessionStorage.removeItem(API_KEY_STORAGE_KEY);
        sessionStorage.removeItem(API_KEY_EXPIRY_KEY);
      }
    }
  }, []);

  // API 키 저장 핸들러 (30분 후 만료)
  const saveApiKey = (key: string) => {
    setApiKey(key);
    const expiryTime = Date.now() + API_KEY_TTL_MS;
    sessionStorage.setItem(API_KEY_STORAGE_KEY, key);
    sessionStorage.setItem(API_KEY_EXPIRY_KEY, expiryTime.toString());
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
