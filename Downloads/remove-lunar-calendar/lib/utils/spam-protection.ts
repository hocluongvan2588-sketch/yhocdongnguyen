/**
 * SPAM PROTECTION UTILITIES
 * ═══════════════════════════════════════════════════════════
 * Honeypot + Rate Limiting để chống spam form
 * Không cần service bên ngoài, hoạt động hoàn toàn server-side
 * ═══════════════════════════════════════════════════════════
 */

// Rate limit store - trong production nên dùng Redis
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

// Honeypot field names - sử dụng tên trông như thật để đánh lừa bot
export const HONEYPOT_FIELD_NAMES = {
  email: 'email_confirm_address', // Bot sẽ điền vì nghĩ đây là email
  website: 'website_url', // Bot hay điền URL
  phone: 'phone_number_backup', // Bot hay điền phone
} as const;

// Timing threshold - form submit quá nhanh (< 2 giây) có thể là bot
export const MIN_FORM_SUBMIT_TIME_MS = 2000;

/**
 * Rate Limiting Configuration
 */
export interface RateLimitConfig {
  maxRequests: number; // Số request tối đa
  windowMs: number; // Thời gian window (ms)
}

export const RATE_LIMIT_CONFIGS: Record<string, RateLimitConfig> = {
  login: { maxRequests: 5, windowMs: 60 * 1000 }, // 5 lần/phút
  signup: { maxRequests: 3, windowMs: 60 * 1000 }, // 3 lần/phút
  contact: { maxRequests: 2, windowMs: 60 * 1000 }, // 2 lần/phút
  default: { maxRequests: 10, windowMs: 60 * 1000 }, // 10 lần/phút
};

/**
 * Check rate limit cho một identifier (IP, user ID, etc.)
 */
export function checkRateLimit(
  identifier: string,
  configKey: keyof typeof RATE_LIMIT_CONFIGS = 'default'
): { allowed: boolean; remaining: number; resetIn: number } {
  const config = RATE_LIMIT_CONFIGS[configKey];
  const now = Date.now();
  const key = `${configKey}:${identifier}`;

  const existing = rateLimitStore.get(key);

  // Reset nếu đã hết window
  if (!existing || now > existing.resetTime) {
    rateLimitStore.set(key, {
      count: 1,
      resetTime: now + config.windowMs,
    });
    return {
      allowed: true,
      remaining: config.maxRequests - 1,
      resetIn: config.windowMs,
    };
  }

  // Check limit
  if (existing.count >= config.maxRequests) {
    return {
      allowed: false,
      remaining: 0,
      resetIn: existing.resetTime - now,
    };
  }

  // Increment count
  existing.count++;
  rateLimitStore.set(key, existing);

  return {
    allowed: true,
    remaining: config.maxRequests - existing.count,
    resetIn: existing.resetTime - now,
  };
}

/**
 * Validate honeypot fields - nếu có giá trị = bot
 */
export function validateHoneypot(formData: FormData | Record<string, unknown>): boolean {
  const honeypotFields = Object.values(HONEYPOT_FIELD_NAMES);

  for (const fieldName of honeypotFields) {
    let value: unknown;

    if (formData instanceof FormData) {
      value = formData.get(fieldName);
    } else {
      value = formData[fieldName];
    }

    // Nếu honeypot field có giá trị -> là bot
    if (value && String(value).trim() !== '') {
      console.log(`[v0] Honeypot triggered: ${fieldName} = ${value}`);
      return false;
    }
  }

  return true;
}

/**
 * Validate timing - form submit quá nhanh = bot
 */
export function validateTiming(startTime: number): boolean {
  const elapsed = Date.now() - startTime;
  if (elapsed < MIN_FORM_SUBMIT_TIME_MS) {
    console.log(`[v0] Timing check failed: ${elapsed}ms < ${MIN_FORM_SUBMIT_TIME_MS}ms`);
    return false;
  }
  return true;
}

/**
 * Get client IP from request headers
 */
export function getClientIP(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  
  const realIP = request.headers.get('x-real-ip');
  if (realIP) {
    return realIP;
  }

  // Fallback
  return 'unknown';
}

/**
 * Combined spam check - sử dụng trong API route
 */
export interface SpamCheckResult {
  isSpam: boolean;
  reason?: string;
  rateLimitInfo?: {
    remaining: number;
    resetIn: number;
  };
}

export function performSpamCheck(
  request: Request,
  formData: FormData | Record<string, unknown>,
  configKey: keyof typeof RATE_LIMIT_CONFIGS = 'default',
  formStartTime?: number
): SpamCheckResult {
  const clientIP = getClientIP(request);

  // 1. Check rate limit
  const rateLimit = checkRateLimit(clientIP, configKey);
  if (!rateLimit.allowed) {
    return {
      isSpam: true,
      reason: 'rate_limit_exceeded',
      rateLimitInfo: {
        remaining: rateLimit.remaining,
        resetIn: rateLimit.resetIn,
      },
    };
  }

  // 2. Check honeypot
  if (!validateHoneypot(formData)) {
    return {
      isSpam: true,
      reason: 'honeypot_triggered',
      rateLimitInfo: {
        remaining: rateLimit.remaining,
        resetIn: rateLimit.resetIn,
      },
    };
  }

  // 3. Check timing (nếu có)
  if (formStartTime && !validateTiming(formStartTime)) {
    return {
      isSpam: true,
      reason: 'too_fast',
      rateLimitInfo: {
        remaining: rateLimit.remaining,
        resetIn: rateLimit.resetIn,
      },
    };
  }

  return {
    isSpam: false,
    rateLimitInfo: {
      remaining: rateLimit.remaining,
      resetIn: rateLimit.resetIn,
    },
  };
}

/**
 * Clean up expired rate limit entries (call periodically)
 */
export function cleanupRateLimitStore(): void {
  const now = Date.now();
  for (const [key, value] of rateLimitStore.entries()) {
    if (now > value.resetTime) {
      rateLimitStore.delete(key);
    }
  }
}

// Auto cleanup every 5 minutes
if (typeof setInterval !== 'undefined') {
  setInterval(cleanupRateLimitStore, 5 * 60 * 1000);
}
