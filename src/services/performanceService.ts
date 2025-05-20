import { lazy } from 'react';
import type { ComponentType } from 'react';

// Cache configuration
const CACHE_CONFIG = {
  maxAge: 5 * 60 * 1000, // 5 minutes
  maxSize: 50, // Maximum number of items in cache
};

// Cache implementation
class Cache<K, V> {
  private cache: Map<K, { value: V; timestamp: number }>;
  private maxAge: number;
  private maxSize: number;

  constructor(maxAge: number, maxSize: number) {
    this.cache = new Map();
    this.maxAge = maxAge;
    this.maxSize = maxSize;
  }

  set(key: K, value: V): void {
    if (this.cache.size >= this.maxSize) {
      const oldestKey = this.cache.keys().next().value;
      if (oldestKey !== undefined) {
        this.cache.delete(oldestKey);
      }
    }
    this.cache.set(key, { value, timestamp: Date.now() });
  }

  get(key: K): V | null {
    const item = this.cache.get(key);
    if (!item) return null;

    if (Date.now() - item.timestamp > this.maxAge) {
      this.cache.delete(key);
      return null;
    }

    return item.value;
  }

  clear(): void {
    this.cache.clear();
  }
}

// API response cache
const apiCache = new Cache<string, any>(CACHE_CONFIG.maxAge, CACHE_CONFIG.maxSize);

// Code splitting helper
export const lazyLoad = <T extends ComponentType<any>>(
  importFn: () => Promise<{ default: T }>
) => {
  return lazy(() => importFn());
};

// Cached API request
export const cachedFetch = async <T>(
  url: string,
  options?: RequestInit
): Promise<T> => {
  const cacheKey = `${url}-${JSON.stringify(options)}`;
  const cachedData = apiCache.get(cacheKey);

  if (cachedData) {
    return cachedData as T;
  }

  const response = await fetch(url, options);
  const data = await response.json();
  apiCache.set(cacheKey, data);

  return data;
};

// Performance monitoring
export const performanceService = {
  measurePerformance: (name: string, callback: () => void) => {
    const start = performance.now();
    callback();
    const end = performance.now();
    console.log(`${name} took ${end - start}ms`);
  },

  trackResourceLoading: () => {
    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        console.log(`${entry.name} loaded in ${entry.duration}ms`);
      }
    });

    observer.observe({ entryTypes: ['resource'] });
  },

  trackLargestContentfulPaint: () => {
    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        console.log(`LCP: ${entry.startTime}ms`);
      }
    });

    observer.observe({ entryTypes: ['largest-contentful-paint'] });
  },

  trackFirstInputDelay: () => {
    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if ('processingStart' in entry) {
          const fid = (entry as PerformanceEventTiming).processingStart - entry.startTime;
          console.log(`FID: ${fid}ms`);
        }
      }
    });

    observer.observe({ entryTypes: ['first-input'] });
  },

  clearCache: () => {
    apiCache.clear();
  },
}; 