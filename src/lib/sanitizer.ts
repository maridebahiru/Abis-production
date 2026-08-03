/**
 * Input sanitization helper to prevent Stored & Reflected Cross-Site Scripting (XSS)
 */

export function sanitizeText(input: string | undefined | null): string {
  if (!input) return '';
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;')
    .trim();
}

export function sanitizeObject<T extends Record<string, any>>(obj: T): T {
  if (!obj || typeof obj !== 'object') return obj;
  const sanitized = { ...obj } as any;

  for (const key of Object.keys(sanitized)) {
    const val = sanitized[key];
    if (typeof val === 'string') {
      sanitized[key] = sanitizeText(val);
    } else if (Array.isArray(val)) {
      sanitized[key] = val.map((item) => (typeof item === 'string' ? sanitizeText(item) : item));
    } else if (val && typeof val === 'object') {
      sanitized[key] = sanitizeObject(val);
    }
  }

  return sanitized as T;
}
