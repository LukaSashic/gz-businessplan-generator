/**
 * Rate Limiter for API endpoints
 * 
 * In-memory implementation for MVP (production should use Redis)
 */

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

interface RateLimitConfig {
  maxRequests: number;
  windowMs: number;
}

interface RateLimitResult {
  success: boolean;
  limit: number;
  remaining: number;
  reset: number;
}

/**
 * In-memory rate limit store
 */
class RateLimitStore {
  private store = new Map<string, RateLimitEntry>();
  
  /**
   * Get rate limit entry for a key
   */
  get(key: string): RateLimitEntry | null {
    const entry = this.store.get(key);
    if (!entry) return null;
    
    // Check if entry has expired
    if (Date.now() > entry.resetTime) {
      this.store.delete(key);
      return null;
    }
    
    return entry;
  }
  
  /**
   * Set rate limit entry for a key
   */
  set(key: string, entry: RateLimitEntry): void {
    this.store.set(key, entry);
  }
  
  /**
   * Delete rate limit entry for a key
   */
  delete(key: string): void {
    this.store.delete(key);
  }
  
  /**
   * Clean up expired entries (call periodically)
   */
  cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of this.store.entries()) {
      if (now > entry.resetTime) {
        this.store.delete(key);
      }
    }
  }
  
  /**
   * Get store size (for debugging)
   */
  size(): number {
    return this.store.size;
  }
  
  /**
   * Clear all entries (for testing)
   */
  clear(): void {
    this.store.clear();
  }
}

/**
 * Rate Limiter class
 */
export class RateLimiter {
  private store: RateLimitStore;
  private config: RateLimitConfig;
  
  constructor(config: RateLimitConfig) {
    this.store = new RateLimitStore();
    this.config = config;
    
    // Clean up expired entries every minute
    if (typeof window === 'undefined') {
      setInterval(() => this.store.cleanup(), 60 * 1000);
    }
  }
  
  /**
   * Check if request is allowed and update counter
   */
  check(key: string): RateLimitResult {
    const now = Date.now();
    const entry = this.store.get(key);
    
    // No existing entry - create new one
    if (!entry) {
      this.store.set(key, {
        count: 1,
        resetTime: now + this.config.windowMs,
      });
      
      return {
        success: true,
        limit: this.config.maxRequests,
        remaining: this.config.maxRequests - 1,
        reset: now + this.config.windowMs,
      };
    }
    
    // Entry exists - check if limit exceeded
    if (entry.count >= this.config.maxRequests) {
      return {
        success: false,
        limit: this.config.maxRequests,
        remaining: 0,
        reset: entry.resetTime,
      };
    }
    
    // Update counter
    entry.count++;
    this.store.set(key, entry);
    
    return {
      success: true,
      limit: this.config.maxRequests,
      remaining: this.config.maxRequests - entry.count,
      reset: entry.resetTime,
    };
  }
  
  /**
   * Reset rate limit for a key
   */
  reset(key: string): void {
    this.store.delete(key);
  }
  
  /**
   * Get current status without incrementing
   */
  status(key: string): RateLimitResult {
    const entry = this.store.get(key);
    
    if (!entry) {
      return {
        success: true,
        limit: this.config.maxRequests,
        remaining: this.config.maxRequests,
        reset: Date.now() + this.config.windowMs,
      };
    }
    
    return {
      success: entry.count < this.config.maxRequests,
      limit: this.config.maxRequests,
      remaining: Math.max(0, this.config.maxRequests - entry.count),
      reset: entry.resetTime,
    };
  }
}

/**
 * Pre-configured rate limiters for different endpoints
 */

// Chat API: 10 requests per minute
export const chatRateLimiter = new RateLimiter({
  maxRequests: 10,
  windowMs: 60 * 1000, // 1 minute
});

// Workshop API: 30 requests per minute
export const workshopRateLimiter = new RateLimiter({
  maxRequests: 30,
  windowMs: 60 * 1000, // 1 minute
});

// General API: 60 requests per minute
export const apiRateLimiter = new RateLimiter({
  maxRequests: 60,
  windowMs: 60 * 1000, // 1 minute
});

/**
 * Helper to create rate limit response headers
 */
export function createRateLimitHeaders(result: RateLimitResult): Record<string, string> {
  return {
    'X-RateLimit-Limit': result.limit.toString(),
    'X-RateLimit-Remaining': result.remaining.toString(),
    'X-RateLimit-Reset': result.reset.toString(),
  };
}

/**
 * Helper to create 429 Too Many Requests response
 */
export function createRateLimitError(result: RateLimitResult) {
  const retryAfter = Math.ceil((result.reset - Date.now()) / 1000);
  
  return {
    error: 'Rate limit exceeded',
    message: `Too many requests. Please try again in ${retryAfter} seconds.`,
    retryAfter,
    limit: result.limit,
    reset: result.reset,
  };
}
