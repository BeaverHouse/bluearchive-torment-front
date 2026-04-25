import { useState, useEffect, useRef } from "react";

const API_KEY_TTL_MS = 10 * 60 * 1000; // 10분 (활동 시 갱신)
const STORAGE_KEY = "batorment_gemini_api_key";
const STORAGE_EXPIRY_KEY = "batorment_gemini_api_key_expiry";

function clearStorage() {
  sessionStorage.removeItem(STORAGE_KEY);
  sessionStorage.removeItem(STORAGE_EXPIRY_KEY);
}

export function useApiKey() {
  const [apiKey, setApiKey] = useState<string | null>(null);
  const [showApiKeyModal, setShowApiKeyModal] = useState(false);
  const expiryTimerRef = useRef<NodeJS.Timeout | null>(null);

  // 마운트 시 sessionStorage에서 복원
  useEffect(() => {
    const stored = sessionStorage.getItem(STORAGE_KEY);
    const expiry = sessionStorage.getItem(STORAGE_EXPIRY_KEY);

    if (stored && expiry) {
      const remaining = Number(expiry) - Date.now();
      if (remaining > 0) {
        setApiKey(stored);
        expiryTimerRef.current = setTimeout(() => {
          clearStorage();
          setApiKey(null);
        }, remaining);
      } else {
        clearStorage();
      }
    }

    return () => {
      if (expiryTimerRef.current) {
        clearTimeout(expiryTimerRef.current);
      }
    };
  }, []);

  const saveApiKey = (key: string) => {
    if (expiryTimerRef.current) {
      clearTimeout(expiryTimerRef.current);
    }

    setApiKey(key);
    sessionStorage.setItem(STORAGE_KEY, key);
    sessionStorage.setItem(STORAGE_EXPIRY_KEY, String(Date.now() + API_KEY_TTL_MS));

    expiryTimerRef.current = setTimeout(() => {
      clearStorage();
      setApiKey(null);
    }, API_KEY_TTL_MS);
  };

  const refreshApiKey = () => {
    if (!apiKey) return;
    saveApiKey(apiKey);
  };

  const openApiKeyModal = () => setShowApiKeyModal(true);
  const closeApiKeyModal = () => setShowApiKeyModal(false);

  return {
    apiKey,
    showApiKeyModal,
    saveApiKey,
    refreshApiKey,
    openApiKeyModal,
    closeApiKeyModal,
    setShowApiKeyModal,
  };
}
