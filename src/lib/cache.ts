/**
 * Simple in-memory cache with TTL for performance optimization
 * Reduces redundant database calls for frequently accessed data
 */

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

class SimpleCache {
  private cache = new Map<string, CacheEntry<unknown>>();

  set<T>(key: string, data: T, ttlMs = 300000): void {
    // 5 minutes default
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl: ttlMs,
    });
  }

  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry) return null;

    if (Date.now() - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      return null;
    }

    return entry.data as T;
  }

  delete(key: string): void {
    this.cache.delete(key);
  }

  clear(): void {
    this.cache.clear();
  }
}

export const cache = new SimpleCache();

/**
 * Cache key generators for consistent caching
 */
export const cacheKeys = {
  agents: (accountId: number) => `agents:${accountId}`,
  listings: (accountId: number, page: number, filters: string) =>
    `listings:${accountId}:${page}:${filters}`,
  listingDetails: (accountId: number, listingId: number) =>
    `listing:${accountId}:${listingId}`,
  userSession: (userId: string) => `session:${userId}`,
};
