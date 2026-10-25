/**
 * GreenClaim Lens - In-Memory Sliding Window Rate Limiter Middleware
 */

import type { Context, Next } from 'hono';

interface RateLimitRecord {
  timestamps: number[];
}

export interface RateLimiterOptions {
  windowMs?: number | undefined; // Window duration (default 60,000ms = 1m)
  maxRequests?: number | undefined; // Max requests per window (default 60)
  keyGenerator?: ((c: Context) => string) | undefined;
}

export class RateLimiter {
  private cache = new Map<string, RateLimitRecord>();
  private windowMs: number;
  private maxRequests: number;
  private keyGenerator: (c: Context) => string;

  constructor(options: RateLimiterOptions = {}) {
    this.windowMs = options.windowMs ?? 60_000;
    this.maxRequests = options.maxRequests ?? 60;
    this.keyGenerator =
      options.keyGenerator ??
      ((c: Context) => {
        // Fallback to IP or Authorization header
        const apiKey = c.req.header('x-api-key') ?? c.req.header('authorization');
        if (apiKey) return `key:${apiKey}`;
        const ip =
          c.req.header('cf-connecting-ip') ??
          c.req.header('x-forwarded-for') ??
          c.req.header('x-real-ip') ??
          'anonymous';
        return `ip:${ip}`;
      });
  }

  middleware() {
    return async (c: Context, next: Next) => {
      const now = Date.now();
      const clientKey = this.keyGenerator(c);
      const isApiKey = clientKey.startsWith('key:');
      const limit = isApiKey ? this.maxRequests * 5 : this.maxRequests; // 5x higher limit for API key holders

      let record = this.cache.get(clientKey);
      if (!record) {
        record = { timestamps: [] };
        this.cache.set(clientKey, record);
      }

      // Filter out timestamps outside the sliding window
      const windowStart = now - this.windowMs;
      record.timestamps = record.timestamps.filter((ts) => ts > windowStart);

      const remaining = Math.max(0, limit - record.timestamps.length);
      const resetTime = Math.ceil((now + this.windowMs) / 1000);

      c.header('X-RateLimit-Limit', limit.toString());
      c.header('X-RateLimit-Remaining', remaining.toString());
      c.header('X-RateLimit-Reset', resetTime.toString());

      if (record.timestamps.length >= limit) {
        return c.json(
          {
            error: 'Rate limit exceeded',
            message: 'Too many requests. Please wait before retrying or provide a valid x-api-key.',
            retryAfterSeconds: Math.ceil(this.windowMs / 1000),
          },
          429,
        );
      }

      record.timestamps.push(now);
      return await next();
    };
  }

  clear() {
    this.cache.clear();
  }
}
