import { createHash } from 'crypto';

// Simple in-memory cache with TTL support
interface CacheEntry {
  data: unknown;
  timestamp: number;
  ttl: number;
}

class LLMCache {
  private cache: Map<string, CacheEntry> = new Map();
  private maxSize: number = 1000; // Maximum number of entries
  private defaultTTL: number = 3600000; // 1 hour in milliseconds

  constructor(maxSize?: number, defaultTTL?: number) {
    if (maxSize) this.maxSize = maxSize;
    if (defaultTTL) this.defaultTTL = defaultTTL;
  }

  // Generate cache key from request data
  generateKey(params: Record<string, unknown>): string {
    const sortedParams = JSON.stringify(params, Object.keys(params).sort());
    return createHash('sha256').update(sortedParams).digest('hex');
  }

  // Get cached response
  get(key: string): unknown | null {
    const entry = this.cache.get(key);
    
    if (!entry) {
      return null;
    }

    // Check if entry has expired
    if (Date.now() > entry.timestamp + entry.ttl) {
      this.cache.delete(key);
      return null;
    }

    // Move to end (LRU behavior)
    this.cache.delete(key);
    this.cache.set(key, entry);

    return entry.data;
  }

  // Set cache entry
  set(key: string, data: unknown, ttl?: number): void {
    // If cache is full, remove oldest entry
    if (this.cache.size >= this.maxSize) {
      const firstKey = this.cache.keys().next().value;
      if (firstKey !== undefined) {
        this.cache.delete(firstKey);
      }
    }

    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl: ttl || this.defaultTTL
    });
  }

  // Clear cache
  clear(): void {
    this.cache.clear();
  }

  // Get cache stats
  getStats() {
    let validEntries = 0;
    let expiredEntries = 0;
    const now = Date.now();

    for (const [, entry] of this.cache.entries()) {
      if (now > entry.timestamp + entry.ttl) {
        expiredEntries++;
      } else {
        validEntries++;
      }
    }

    return {
      totalEntries: this.cache.size,
      validEntries,
      expiredEntries,
      maxSize: this.maxSize
    };
  }

  // Clean up expired entries
  cleanup(): void {
    const now = Date.now();
    const keysToDelete: string[] = [];

    for (const [key, entry] of this.cache.entries()) {
      if (now > entry.timestamp + entry.ttl) {
        keysToDelete.push(key);
      }
    }

    keysToDelete.forEach(key => this.cache.delete(key));
  }
}

// Create singleton instances for different LLM providers
export const geminiCache = new LLMCache(500, 3600000); // 1 hour TTL
export const openaiCache = new LLMCache(500, 3600000); // 1 hour TTL

// Periodic cleanup (every 5 minutes)
if (typeof global !== 'undefined') {
  const g = global as typeof globalThis & { llmCacheCleanupInterval?: NodeJS.Timeout };
  if (!g.llmCacheCleanupInterval) {
    g.llmCacheCleanupInterval = setInterval(() => {
      geminiCache.cleanup();
      openaiCache.cleanup();
    }, 300000); // 5 minutes
  }
}

// Cache key generators for specific use cases
export function generateAssistCacheKey(prompt: string, context?: string, language?: string): string {
  return geminiCache.generateKey({ prompt, context, language });
}

export function generateChatGPTCacheKey(model: string, messages: unknown[]): string {
  return openaiCache.generateKey({ model, messages });
}