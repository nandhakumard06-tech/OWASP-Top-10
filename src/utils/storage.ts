/**
 * Namespaced, failure-tolerant LocalStorage helpers.
 *
 * The platform never stores credentials, tokens or personal data — only
 * anonymous learning progress. Every access is wrapped because storage can be
 * unavailable (private browsing, disabled cookies, quota exceeded).
 */

export const STORAGE_KEYS = {
  progress: 'osa.progress.v1',
} as const;

export function readJson<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;

  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export function writeJson(key: string, value: unknown): boolean {
  if (typeof window === 'undefined') return false;

  try {
    window.localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch {
    return false;
  }
}

export function removeKey(key: string): void {
  if (typeof window === 'undefined') return;

  try {
    window.localStorage.removeItem(key);
  } catch {
    /* Storage unavailable — nothing to clean up. */
  }
}
