/**
 * KSHETRIKAH (क्षेत्रिकः) - Multi-Key Gemini API Pool & Failover Manager
 * Government of Maharashtra MSInS Challenge #26131
 * Developed by TEAM BITHEADS
 *
 * Provides high-availability LLM pooling:
 * - Reads GEMINI_API_KEYS (comma-separated), GEMINI_API_KEY, GEMINI_API_KEY_2..5, GOOGLE_API_KEY
 * - Deduplicates keys and tracks real-time health (healthy, cooldown, quota_exhausted)
 * - Transparent round-robin load distribution across available quota
 * - Instant failover on 429 (Rate Limit) or 503 (Service Unavailable)
 * - Telemetry metrics for Prometheus/OpenTelemetry health endpoints
 */

export interface KeyState {
  index: number;
  maskedKey: string;
  status: 'healthy' | 'cooldown' | 'exhausted';
  cooldownUntil: number; // Unix ms
  totalRequests: number;
  successfulRequests: number;
  rateLimitHits: number;
  errorHits: number;
  lastUsedAt: number;
}

export interface KeyPoolMetrics {
  totalKeys: number;
  healthyKeys: number;
  cooldownKeys: number;
  exhaustedKeys: number;
  totalInferences: number;
  totalFailovers: number;
  keys: Array<{
    index: number;
    masked: string;
    status: 'healthy' | 'cooldown' | 'exhausted';
    successRate: number;
    lastUsed: string;
  }>;
}

class GeminiKeyPoolManager {
  private rawKeys: string[] = [];
  private keyStates: Map<string, KeyState> = new Map();
  private currentIndex: number = 0;
  private totalFailovers: number = 0;

  constructor() {
    this.refreshKeys();
  }

  /**
   * Refreshes and discovers keys from environment variables.
   */
  public refreshKeys(): void {
    const gathered: string[] = [];

    // 1. GEMINI_API_KEYS (comma or semicolon separated)
    const multiKeys = process.env.GEMINI_API_KEYS;
    if (multiKeys) {
      multiKeys
        .split(/[,;\n]+/)
        .map((k) => k.trim())
        .filter((k) => k.length > 8 && !k.startsWith('your_'))
        .forEach((k) => gathered.push(k));
    }

    // 2. Numbered keys: GEMINI_API_KEY, GEMINI_API_KEY_2, GEMINI_API_KEY_3...
    const numberedKeys = [
      process.env.GEMINI_API_KEY,
      process.env.GEMINI_API_KEY_2,
      process.env.GEMINI_API_KEY_3,
      process.env.GEMINI_API_KEY_4,
      process.env.GEMINI_API_KEY_5,
      process.env.GOOGLE_API_KEY,
      process.env.GOOGLE_AI_API_KEY,
    ];

    for (const key of numberedKeys) {
      if (key && typeof key === 'string') {
        const trimmed = key.trim();
        if (trimmed.length > 8 && !trimmed.startsWith('your_') && !gathered.includes(trimmed)) {
          gathered.push(trimmed);
        }
      }
    }

    this.rawKeys = gathered;

    // Initialize or preserve states
    gathered.forEach((key, idx) => {
      if (!this.keyStates.has(key)) {
        this.keyStates.set(key, {
          index: idx + 1,
          maskedKey: this.maskKey(key),
          status: 'healthy',
          cooldownUntil: 0,
          totalRequests: 0,
          successfulRequests: 0,
          rateLimitHits: 0,
          errorHits: 0,
          lastUsedAt: 0,
        });
      }
    });

    // Clean up removed keys
    for (const existingKey of Array.from(this.keyStates.keys())) {
      if (!gathered.includes(existingKey)) {
        this.keyStates.delete(existingKey);
      }
    }
  }

  private maskKey(key: string): string {
    if (key.length <= 10) return '***';
    return `${key.slice(0, 6)}...${key.slice(-4)}`;
  }

  /**
   * Returns whether any keys are configured.
   */
  public hasKeys(): boolean {
    this.refreshKeys();
    return this.rawKeys.length > 0;
  }

  /**
   * Returns the count of registered keys.
   */
  public getKeyCount(): number {
    return this.rawKeys.length;
  }

  /**
   * Retrieves the next healthy key using round-robin.
   * Clears expired cooldowns automatically.
   */
  public getNextKey(): { key: string; index: number; masked: string } | null {
    if (this.rawKeys.length === 0) {
      this.refreshKeys();
      if (this.rawKeys.length === 0) return null;
    }

    const now = Date.now();
    const total = this.rawKeys.length;

    // First pass: try round-robin looking for healthy or cooldown-expired keys
    for (let attempt = 0; attempt < total; attempt++) {
      const idx = (this.currentIndex + attempt) % total;
      const candidate = this.rawKeys[idx];
      const state = this.keyStates.get(candidate);

      if (!state) continue;

      // Check if cooldown expired
      if (state.status === 'cooldown' && now >= state.cooldownUntil) {
        state.status = 'healthy';
        state.cooldownUntil = 0;
      }

      if (state.status === 'healthy') {
        this.currentIndex = (idx + 1) % total;
        state.lastUsedAt = now;
        state.totalRequests += 1;
        return { key: candidate, index: state.index, masked: state.maskedKey };
      }
    }

    // Second pass: if all in cooldown, find the one closest to expiry
    let earliestKey: string | null = null;
    let earliestTime = Infinity;

    for (const [key, state] of this.keyStates.entries()) {
      if (state.status === 'cooldown' && state.cooldownUntil < earliestTime) {
        earliestTime = state.cooldownUntil;
        earliestKey = key;
      }
    }

    if (earliestKey) {
      const state = this.keyStates.get(earliestKey)!;
      state.lastUsedAt = now;
      state.totalRequests += 1;
      return { key: earliestKey, index: state.index, masked: state.maskedKey };
    }

    return null;
  }

  /**
   * Marks a key as successful, updating telemetry.
   */
  public markSuccess(key: string): void {
    const state = this.keyStates.get(key);
    if (state) {
      state.successfulRequests += 1;
      state.status = 'healthy';
      state.cooldownUntil = 0;
    }
  }

  /**
   * Marks a key in cooldown due to 429 rate limit or 503 high demand spike.
   * Default cooldown: 60 seconds for 429, 30 seconds for 503.
   */
  public markCooldown(key: string, statusCode: number = 429, customCooldownMs?: number): void {
    const state = this.keyStates.get(key);
    if (!state) return;

    this.totalFailovers += 1;
    state.errorHits += 1;

    if (statusCode === 429) {
      state.rateLimitHits += 1;
      const cooldownMs = customCooldownMs ?? 60_000;
      state.status = 'cooldown';
      state.cooldownUntil = Date.now() + cooldownMs;
    } else if (statusCode === 403 || statusCode === 400) {
      // Auth or invalid key - mark exhausted until manual reload
      state.status = 'exhausted';
      state.cooldownUntil = Date.now() + 24 * 3600_000;
    } else {
      // 503 / 502 server spike
      const cooldownMs = customCooldownMs ?? 20_000;
      state.status = 'cooldown';
      state.cooldownUntil = Date.now() + cooldownMs;
    }
  }

  /**
   * Executes an asynchronous Google Gemini API operation with automatic key rotation and failover.
   * Tries up to Math.min(keys.length, 3) times across available healthy keys before throwing.
   */
  public async executeWithFailover<T>(
    operation: (key: string, masked: string, attempt: number) => Promise<{ ok: boolean; status: number; data: T; errorText?: string }>
  ): Promise<{ data: T; keyUsed: string } | { error: string; lastStatus: number }> {
    if (this.rawKeys.length === 0) {
      this.refreshKeys();
      if (this.rawKeys.length === 0) {
        return { error: 'No Gemini API keys configured in environment.', lastStatus: 503 };
      }
    }

    const maxAttempts = Math.max(1, Math.min(this.rawKeys.length * 2, 4));
    let lastError = 'All keys failed';
    let lastStatus = 500;

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      const keyObj = this.getNextKey();
      if (!keyObj) {
        return { error: 'All Gemini API keys are currently in cooldown. Please wait 30 seconds.', lastStatus: 429 };
      }

      try {
        const res = await operation(keyObj.key, keyObj.masked, attempt);

        if (res.ok) {
          this.markSuccess(keyObj.key);
          return { data: res.data, keyUsed: keyObj.masked };
        }

        // Handle upstream failure
        lastStatus = res.status;
        lastError = res.errorText || `Upstream returned status ${res.status}`;

        if (res.status === 429 || res.status === 503 || res.status === 502) {
          console.warn(`[GeminiKeyPool] Key ${keyObj.masked} failed with ${res.status}. Triggering failover to next key (Attempt ${attempt}/${maxAttempts}).`);
          this.markCooldown(keyObj.key, res.status);
          // Small pause before retrying next key
          await new Promise((r) => setTimeout(r, 600));
          continue;
        } else if (res.status === 400 || res.status === 403) {
          console.error(`[GeminiKeyPool] Key ${keyObj.masked} is invalid/unauthorized (${res.status}). Marking exhausted.`);
          this.markCooldown(keyObj.key, res.status);
          continue;
        } else {
          // Non-retriable error
          return { error: lastError, lastStatus };
        }
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : String(err);
        lastError = msg;
        this.markCooldown(keyObj.key, 500, 10_000);
        console.warn(`[GeminiKeyPool] Network error on key ${keyObj.masked}: ${msg}. Retrying...`);
        await new Promise((r) => setTimeout(r, 800));
      }
    }

    return { error: lastError, lastStatus };
  }

  /**
   * Returns detailed pool metrics for system observability.
   */
  public getMetrics(): KeyPoolMetrics {
    const now = Date.now();
    let healthyCount = 0;
    let cooldownCount = 0;
    let exhaustedCount = 0;
    let totalInferences = 0;

    const keysList: KeyPoolMetrics['keys'] = [];

    for (const [, state] of this.keyStates.entries()) {
      if (state.status === 'cooldown' && now >= state.cooldownUntil) {
        state.status = 'healthy';
      }

      if (state.status === 'healthy') healthyCount++;
      else if (state.status === 'cooldown') cooldownCount++;
      else if (state.status === 'exhausted') exhaustedCount++;

      totalInferences += state.totalRequests;

      const rate = state.totalRequests > 0 ? (state.successfulRequests / state.totalRequests) : 1.0;

      keysList.push({
        index: state.index,
        masked: state.maskedKey,
        status: state.status,
        successRate: Math.round(rate * 100) / 100,
        lastUsed: state.lastUsedAt > 0 ? new Date(state.lastUsedAt).toISOString() : 'never',
      });
    }

    return {
      totalKeys: this.rawKeys.length,
      healthyKeys: healthyCount,
      cooldownKeys: cooldownCount,
      exhaustedKeys: exhaustedCount,
      totalInferences,
      totalFailovers: this.totalFailovers,
      keys: keysList,
    };
  }
}

// Global singleton instance across Next.js API invocations
declare global {
  // eslint-disable-next-line no-var
  var __geminiKeyPool: GeminiKeyPoolManager | undefined;
}

export const geminiKeyPool = global.__geminiKeyPool ?? new GeminiKeyPoolManager();
if (process.env.NODE_ENV !== 'production') {
  global.__geminiKeyPool = geminiKeyPool;
}
