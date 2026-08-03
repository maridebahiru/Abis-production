/**
 * Rate Limiting & Lockout Protection Utility
 * Prevents brute-force attacks on PIN verification, Admin Login, and Booking forms.
 */

interface RateLimitRecord {
  attempts: number;
  firstAttemptTime: number;
  lockoutUntil: number | null;
}

const attemptStore = new Map<string, RateLimitRecord>();

const MAX_ATTEMPTS = 5;
const WINDOW_MS = 15 * 60 * 1000; // 15 minutes
const LOCKOUT_MS = 15 * 60 * 1000; // 15 minutes lockout

export function checkRateLimit(identifier: string): { allowed: boolean; remainingAttempts: number; retryAfterSeconds: number } {
  const now = Date.now();
  const record = attemptStore.get(identifier);

  if (!record) {
    return { allowed: true, remainingAttempts: MAX_ATTEMPTS, retryAfterSeconds: 0 };
  }

  if (record.lockoutUntil && record.lockoutUntil > now) {
    const retryAfterSeconds = Math.ceil((record.lockoutUntil - now) / 1000);
    return { allowed: false, remainingAttempts: 0, retryAfterSeconds };
  }

  if (now - record.firstAttemptTime > WINDOW_MS) {
    attemptStore.delete(identifier);
    return { allowed: true, remainingAttempts: MAX_ATTEMPTS, retryAfterSeconds: 0 };
  }

  if (record.attempts >= MAX_ATTEMPTS) {
    record.lockoutUntil = now + LOCKOUT_MS;
    const retryAfterSeconds = Math.ceil(LOCKOUT_MS / 1000);
    return { allowed: false, remainingAttempts: 0, retryAfterSeconds };
  }

  return {
    allowed: true,
    remainingAttempts: MAX_ATTEMPTS - record.attempts,
    retryAfterSeconds: 0,
  };
}

export function recordFailedAttempt(identifier: string): { remainingAttempts: number; lockedOut: boolean } {
  const now = Date.now();
  let record = attemptStore.get(identifier);

  if (!record || now - record.firstAttemptTime > WINDOW_MS) {
    record = { attempts: 1, firstAttemptTime: now, lockoutUntil: null };
  } else {
    record.attempts += 1;
    if (record.attempts >= MAX_ATTEMPTS) {
      record.lockoutUntil = now + LOCKOUT_MS;
    }
  }

  attemptStore.set(identifier, record);
  const lockedOut = Boolean(record.lockoutUntil && record.lockoutUntil > now);
  const remainingAttempts = Math.max(0, MAX_ATTEMPTS - record.attempts);

  return { remainingAttempts, lockedOut };
}

export function resetRateLimit(identifier: string): void {
  attemptStore.delete(identifier);
}
