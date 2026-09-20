/**
 * KSHETRIKAH (क्षेत्रिकः) - Sliding-Window Rate Limiter
 * Government of Maharashtra MSInS Challenge #26131
 * Developed by TEAM BITHEADS
 *
 * Protects inference APIs and sensitive endpoints against DDoS, runaway loops,
 * and bot scraping while granting high burst tolerance for rural field workers.
 */

interface RateLimitConfig {
  windowMs: number; // e.g. 60_000 (1 minute)
  maxRequests: number; // e.g. 30 requests per minute
  burstAllowance: number; // e.g. 5 extra burst tokens
}

interface ClientBucket {
  tokens: number;
  lastRefill: number;
  requestTimestamps: number[];
}

class SlidingWindowRateLimiter {
  private buckets: Map<string, ClientBucket> = new Map();
  private config: RateLimitConfig;
  private lastCleanup: number = Date.now();

  constructor(config?: Partial<RateLimitConfig>) {
    this.config = {
      windowMs: config?.windowMs ?? 60_000,
      maxRequests: config?.maxRequests ?? 40,
      burstAllowance: config?.burstAllowance ?? 5,
    };
  }

  /**
   * Evaluates if a given identifier (IP, device token, or session ID) is allowed.
   */
  public check(identifier: string): {
    allowed: boolean;
    remaining: number;
    resetMs: number;
    retryAfterSec: number;
  } {
    const now = Date.now();
    this.periodicCleanup(now);

    let bucket = this.buckets.get(identifier);
    if (!bucket) {
      bucket = {
        tokens: this.config.maxRequests + this.config.burstAllowance,
        lastRefill: now,
        requestTimestamps: [],
      };
      this.buckets.set(identifier, bucket);
    }

    // Filter out timestamps outside the sliding window
    const windowStart = now - this.config.windowMs;
    bucket.requestTimestamps = bucket.requestTimestamps.filter((ts) => ts > windowStart);

    const currentCount = bucket.requestTimestamps.length;
    const maxAllowed = this.config.maxRequests + this.config.burstAllowance;

    if (currentCount >= maxAllowed) {
      // Calculate time until the oldest request in the window expires
      const oldestTs = bucket.requestTimestamps[0] || windowStart;
      const resetMs = Math.max(1000, oldestTs + this.config.windowMs - now);
      const retryAfterSec = Math.ceil(resetMs / 1000);

      return {
        allowed: false,
        remaining: 0,
        resetMs,
        retryAfterSec,
      };
    }

    // Record this request
    bucket.requestTimestamps.push(now);
    const remaining = Math.max(0, maxAllowed - bucket.requestTimestamps.length);
    const oldestTs = bucket.requestTimestamps[0] || now;
    const resetMs = Math.max(0, oldestTs + this.config.windowMs - now);

    return {
      allowed: true,
      remaining,
      resetMs,
      retryAfterSec: 0,
    };
  }

  /**
   * Periodically cleans up stale client buckets to prevent memory leaks.
   */
  private periodicCleanup(now: number): void {
    if (now - this.lastCleanup < 120_000) return; // run every 2 minutes
    this.lastCleanup = now;

    const windowStart = now - this.config.windowMs;
    for (const [id, bucket] of this.buckets.entries()) {
      bucket.requestTimestamps = bucket.requestTimestamps.filter((ts) => ts > windowStart);
      if (bucket.requestTimestamps.length === 0) {
        this.buckets.delete(id);
      }
    }
  }

  /**
   * Helper to extract client IP from Next.js / Cloudflare / Vercel request headers.
   */
  public getClientIdentifier(request: Request): string {
    const forwarded = request.headers.get('x-forwarded-for');
    if (forwarded) {
      return forwarded.split(',')[0].trim();
    }
    const realIp = request.headers.get('x-real-ip');
    if (realIp) return realIp.trim();

    const cfConnectingIp = request.headers.get('cf-connecting-ip');
    if (cfConnectingIp) return cfConnectingIp.trim();

    return 'unknown_client';
  }
}

// Global singleton instance
declare global {
  // eslint-disable-next-line no-var
  var __scanRateLimiter: SlidingWindowRateLimiter | undefined;
}

export const scanRateLimiter = global.__scanRateLimiter ?? new SlidingWindowRateLimiter();
if (process.env.NODE_ENV !== 'production') {
  global.__scanRateLimiter = scanRateLimiter;
}
