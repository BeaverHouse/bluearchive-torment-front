/**
 * sessionStorage에 보관할 민감 문자열을 AES-GCM으로 암호화/복호화.
 * 암호화 키(CryptoKey)는 IndexedDB에 non-extractable 형태로 영구 저장.
 * 키 자체는 브라우저 보안 영역에 있어 JS가 바이트를 읽을 수 없음.
 */

const DB_NAME = "batorment_crypto";
const DB_VERSION = 1;
const STORE_NAME = "keys";
const KEY_ID = "session_cipher";
const IV_LENGTH = 12;

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

function idbGet(db: IDBDatabase): Promise<CryptoKey | null> {
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readonly");
    const req = tx.objectStore(STORE_NAME).get(KEY_ID);
    req.onsuccess = () => resolve((req.result as CryptoKey | undefined) ?? null);
    req.onerror = () => reject(req.error);
  });
}

function idbPut(db: IDBDatabase, key: CryptoKey): Promise<void> {
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readwrite");
    const req = tx.objectStore(STORE_NAME).put(key, KEY_ID);
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
}

function idbDelete(db: IDBDatabase): Promise<void> {
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readwrite");
    const req = tx.objectStore(STORE_NAME).delete(KEY_ID);
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
}

let cachedKey: Promise<CryptoKey> | null = null;

async function getOrCreateKey(): Promise<CryptoKey> {
  if (cachedKey) return cachedKey;
  cachedKey = (async () => {
    const db = await openDb();
    try {
      const existing = await idbGet(db);
      if (existing) return existing;
      const fresh = await crypto.subtle.generateKey(
        { name: "AES-GCM", length: 256 },
        false,
        ["encrypt", "decrypt"]
      );
      await idbPut(db, fresh);
      return fresh;
    } finally {
      db.close();
    }
  })();
  return cachedKey;
}

function bytesToBase64(bytes: Uint8Array): string {
  let bin = "";
  for (let i = 0; i < bytes.length; i += 1) bin += String.fromCharCode(bytes[i]);
  return btoa(bin);
}

function base64ToBytes(b64: string): Uint8Array {
  const bin = atob(b64);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i += 1) out[i] = bin.charCodeAt(i);
  return out;
}

export async function encryptString(plaintext: string): Promise<string> {
  const key = await getOrCreateKey();
  const iv = crypto.getRandomValues(new Uint8Array(IV_LENGTH));
  const ct = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv },
    key,
    new TextEncoder().encode(plaintext)
  );
  const combined = new Uint8Array(IV_LENGTH + ct.byteLength);
  combined.set(iv, 0);
  combined.set(new Uint8Array(ct), IV_LENGTH);
  return bytesToBase64(combined);
}

export async function decryptString(blob: string): Promise<string> {
  const key = await getOrCreateKey();
  const combined = base64ToBytes(blob);
  const iv = combined.slice(0, IV_LENGTH);
  const ct = combined.slice(IV_LENGTH);
  const pt = await crypto.subtle.decrypt({ name: "AES-GCM", iv }, key, ct);
  return new TextDecoder().decode(pt);
}

export async function deleteEncryptionKey(): Promise<void> {
  cachedKey = null;
  const db = await openDb();
  try {
    await idbDelete(db);
  } finally {
    db.close();
  }
}
