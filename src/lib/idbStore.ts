/**
 * Browser-native IndexedDB storage helper for Abis Production Studio
 * Solves LocalStorage 5MB QuotaExceededError by storing high-capacity
 * photo portfolios, client galleries, and site settings directly in IndexedDB.
 */

const DB_NAME = 'abis_studio_idb_v1';
const DB_VERSION = 1;
const STORE_NAME = 'studio_kv';

let dbPromise: Promise<IDBDatabase> | null = null;

export function getIDB(): Promise<IDBDatabase> | null {
  if (typeof window === 'undefined' || !window.indexedDB) {
    return null;
  }

  if (!dbPromise) {
    dbPromise = new Promise((resolve, reject) => {
      const request = window.indexedDB.open(DB_NAME, DB_VERSION);

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME);
        }
      };

      request.onsuccess = () => {
        resolve(request.result);
      };

      request.onerror = () => {
        console.error('IndexedDB open error:', request.error);
        reject(request.error);
      };
    });
  }

  return dbPromise;
}

export async function getIDBData<T>(key: string, defaultValue: T): Promise<T> {
  const db = await getIDB();
  if (!db) return defaultValue;

  return new Promise((resolve) => {
    try {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const request = store.get(key);

      request.onsuccess = () => {
        if (request.result !== undefined) {
          resolve(request.result as T);
        } else {
          // Check for legacy localStorage migration fallback
          if (typeof window !== 'undefined') {
            try {
              const legacyItem = localStorage.getItem(key);
              if (legacyItem) {
                const parsed = JSON.parse(legacyItem);
                // Migrate to IndexedDB async
                setIDBData(key, parsed).then(() => {
                  try {
                    localStorage.removeItem(key);
                  } catch (e) {
                    console.warn('Could not clear legacy localStorage key', e);
                  }
                });
                resolve(parsed as T);
                return;
              }
            } catch (e) {
              console.warn('Legacy localStorage read failed', e);
            }
          }
          resolve(defaultValue);
        }
      };

      request.onerror = () => {
        console.error(`IndexedDB read error for key: ${key}`, request.error);
        resolve(defaultValue);
      };
    } catch (e) {
      console.error('Transaction error in getIDBData', e);
      resolve(defaultValue);
    }
  });
}

const SENSITIVE_KEY_PATTERNS = [
  'booking',
  'admin_user',
  'admin_auth',
  'customer',
  'pin',
  'credential',
];

export function isAllowedOfflineKey(key: string): boolean {
  const lowerKey = key.toLowerCase();
  for (const pattern of SENSITIVE_KEY_PATTERNS) {
    if (lowerKey.includes(pattern)) {
      return false;
    }
  }
  return true;
}

export async function setIDBData<T>(key: string, data: T): Promise<void> {
  if (!isAllowedOfflineKey(key)) {
    // Security Guard: Prevent caching sensitive customer PII, PINs, or admin credentials offline
    return;
  }

  const db = await getIDB();
  if (!db) return;

  return new Promise((resolve, reject) => {
    try {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const request = store.put(data, key);

      request.onsuccess = () => resolve();
      request.onerror = () => {
        console.error(`IndexedDB write error for key: ${key}`, request.error);
        reject(request.error);
      };
    } catch (e) {
      console.error('Transaction error in setIDBData', e);
      reject(e);
    }
  });
}

/**
 * Compress and resize images client-side before storage
 * Reduces raw 5-15MB camera photos down to optimized web sizes (~100KB-300KB)
 */
export function compressImage(
  input: File | string,
  maxWidth = 1920,
  maxHeight = 1920,
  quality = 0.82
): Promise<string> {
  if (typeof window === 'undefined') {
    return Promise.resolve(typeof input === 'string' ? input : '');
  }

  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'Anonymous';

    img.onload = () => {
      let width = img.width;
      let height = img.height;

      if (width > maxWidth) {
        height = Math.round((height * maxWidth) / width);
        width = maxWidth;
      }
      if (height > maxHeight) {
        width = Math.round((width * maxHeight) / height);
        height = maxHeight;
      }

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        resolve(typeof input === 'string' ? input : '');
        return;
      }

      ctx.drawImage(img, 0, 0, width, height);
      const dataUrl = canvas.toDataURL('image/jpeg', quality);
      resolve(dataUrl);
    };

    img.onerror = (err) => {
      console.warn('Canvas image compression warning, returning original input', err);
      if (typeof input === 'string') {
        resolve(input);
      } else {
        const reader = new FileReader();
        reader.onload = (e) => resolve((e.target?.result as string) || '');
        reader.onerror = () => resolve('');
        reader.readAsDataURL(input);
      }
    };

    if (typeof input === 'string') {
      img.src = input;
    } else {
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) {
          img.src = e.target.result as string;
        } else {
          resolve('');
        }
      };
      reader.onerror = () => resolve('');
      reader.readAsDataURL(input);
    }
  });
}
