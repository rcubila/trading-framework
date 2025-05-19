/**
 * Cache implementation for expensive API calls and data fetching
 * This utility provides caching functionality with TTL (time-to-live) support
 */

type CacheOptions = {
  /** Cache expiration time in milliseconds (default: 5 minutes) */
  ttl?: number;
  /** Cache key prefix to avoid collisions */
  prefix?: string;
};

type CacheItem<T> = {
  /** The cached data */
  data: T;
  /** Timestamp when the cache will expire */
  expiry: number;
};

// Default options
const DEFAULT_OPTIONS: CacheOptions = {
  ttl: 5 * 60 * 1000, // 5 minutes
  prefix: 'app_cache_',
};

/**
 * Simple cache utility for storing and retrieving data with TTL support
 */
class Cache {
  private static cacheStorage: Map<string, CacheItem<unknown>> = new Map();

  /**
   * Store data in the cache
   * @param key Cache key
   * @param data Data to store
   * @param options Cache options
   */
  static set<T>(key: string, data: T, options: CacheOptions = {}): void {
    const { ttl, prefix } = { ...DEFAULT_OPTIONS, ...options };
    const prefixedKey = `${prefix}${key}`;
    const expiry = Date.now() + ttl!;

    this.cacheStorage.set(prefixedKey, { data, expiry });
  }

  /**
   * Retrieve data from the cache
   * @param key Cache key
   * @param options Cache options
   * @returns Cached data or null if not found or expired
   */
  static get<T>(key: string, options: CacheOptions = {}): T | null {
    const { prefix } = { ...DEFAULT_OPTIONS, ...options };
    const prefixedKey = `${prefix}${key}`;
    
    const item = this.cacheStorage.get(prefixedKey) as CacheItem<T> | undefined;
    
    // Return null if item doesn't exist or has expired
    if (!item || Date.now() > item.expiry) {
      if (item) {
        // Clean up expired item
        this.cacheStorage.delete(prefixedKey);
      }
      return null;
    }
    
    return item.data;
  }

  /**
   * Check if a cache key exists and is not expired
   * @param key Cache key
   * @param options Cache options
   * @returns True if the key exists and is not expired
   */
  static has(key: string, options: CacheOptions = {}): boolean {
    const { prefix } = { ...DEFAULT_OPTIONS, ...options };
    const prefixedKey = `${prefix}${key}`;
    
    const item = this.cacheStorage.get(prefixedKey);
    return !!item && Date.now() <= item.expiry;
  }

  /**
   * Remove a specific item from the cache
   * @param key Cache key
   * @param options Cache options
   */
  static remove(key: string, options: CacheOptions = {}): void {
    const { prefix } = { ...DEFAULT_OPTIONS, ...options };
    const prefixedKey = `${prefix}${key}`;
    
    this.cacheStorage.delete(prefixedKey);
  }

  /**
   * Remove all items from the cache
   */
  static clear(): void {
    this.cacheStorage.clear();
  }

  /**
   * Remove all expired items from the cache
   */
  static clearExpired(): void {
    const now = Date.now();
    
    for (const [key, item] of this.cacheStorage.entries()) {
      if (now > item.expiry) {
        this.cacheStorage.delete(key);
      }
    }
  }

  /**
   * Wrapper function for async functions that adds caching
   * @param fn Async function to cache
   * @param keyFn Function to generate cache key from arguments
   * @param options Cache options
   * @returns A wrapped function that uses caching
   */
  static withCache<T, Args extends any[]>(
    fn: (...args: Args) => Promise<T>,
    keyFn: (...args: Args) => string,
    options: CacheOptions = {}
  ): (...args: Args) => Promise<T> {
    return async (...args: Args): Promise<T> => {
      const cacheKey = keyFn(...args);
      
      // Return cached data if available
      const cachedData = this.get<T>(cacheKey, options);
      if (cachedData !== null) {
        return cachedData;
      }
      
      // Fetch new data if not cached or expired
      const data = await fn(...args);
      this.set(cacheKey, data, options);
      
      return data;
    };
  }
}

export default Cache; 