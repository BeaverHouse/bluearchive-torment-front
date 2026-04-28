import { useState, useEffect, useRef } from "react";
import { encryptString, decryptString } from "@/lib/crypto-storage";

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

  // 마운트 시 sessionStorage에서 복원 (암호화된 blob을 복호화)
  useEffect(() => {
    const stored = sessionStorage.getItem(STORAGE_KEY);
    const expiry = sessionStorage.getItem(STORAGE_EXPIRY_KEY);

    if (!stored || !expiry) return;

    const remaining = Number(expiry) - Date.now();
    if (remaining <= 0) {
      clearStorage();
      return;
    }

    let cancelled = false;
    decryptString(stored)
      .then((plain) => {
        if (cancelled) return;
        setApiKey(plain);
        expiryTimerRef.current = setTimeout(() => {
          clearStorage();
          setApiKey(null);
        }, remaining);
      })
      .catch(() => {
        // 복호화 실패(키 변경, 데이터 손상, 기존 평문 잔재 등)는 클리어로 회복
        clearStorage();
      });

    return () => {
      cancelled = true;
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
    const expiresAt = Date.now() + API_KEY_TTL_MS;

    encryptString(key)
      .then((blob) => {
        sessionStorage.setItem(STORAGE_KEY, blob);
        sessionStorage.setItem(STORAGE_EXPIRY_KEY, String(expiresAt));
      })
      .catch(() => {
        // 암호화 실패 시 저장 생략 — 메모리 내 apiKey는 유지
        clearStorage();
      });

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
