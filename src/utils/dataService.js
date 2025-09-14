/**
 * Data Service Utilities
 * Provides consistent, cacheable data access with error handling
 */

// Cache for minimizing duplicate fetch requests
const cache = {
  data: new Map(),
  timestamps: new Map(),
  
  /**
   * Get data from cache if valid
   * @param {string} key - Cache key
   * @param {number} maxAge - Maximum age in milliseconds
   * @returns {any|null} Cached data or null if expired/missing
   */
  get(key, maxAge = 60000) {
    const timestamp = this.timestamps.get(key);
    if (!timestamp) return null;
    
    const age = Date.now() - timestamp;
    if (age > maxAge) {
      // Expired data
      this.data.delete(key);
      this.timestamps.delete(key);
      return null;
    }
    
    return this.data.get(key);
  },
  
  /**
   * Set data in cache
   * @param {string} key - Cache key
   * @param {any} data - Data to cache
   */
  set(key, data) {
    this.data.set(key, data);
    this.timestamps.set(key, Date.now());
  },
  
  /**
   * Invalidate a specific cache entry or entries matching a prefix
   * @param {string} keyOrPrefix - Cache key or prefix to invalidate
   * @param {boolean} isPrefix - If true, invalidate all keys starting with keyOrPrefix
   */
  invalidate(keyOrPrefix, isPrefix = false) {
    if (isPrefix) {
      const keysToDelete = [];
      this.data.forEach((_, key) => {
        if (key.startsWith(keyOrPrefix)) {
          keysToDelete.push(key);
        }
      });
      
      keysToDelete.forEach(key => {
        this.data.delete(key);
        this.timestamps.delete(key);
      });
    } else {
      this.data.delete(keyOrPrefix);
      this.timestamps.delete(keyOrPrefix);
    }
  },
  
  /**
   * Clear all cache entries
   */
  clear() {
    this.data.clear();
    this.timestamps.clear();
  }
};

/**
 * Create a cacheable fetch function with error handling
 * 
 * @param {Function} fetchFn - Async function that performs the actual data fetch
 * @param {string} cacheKey - Key for caching results
 * @param {number} cacheMaxAge - Maximum age for cached data in milliseconds
 * @param {Function} fallbackFn - Function to provide fallback data on error
 * @returns {Promise<any>} The fetched or cached data
 */
export const createCacheableFetch = (
  fetchFn,
  cacheKey,
  cacheMaxAge = 60000,
  fallbackFn = null
) => {
  return async (...args) => {
    try {
      // Try to get from cache first
      const cacheKeyWithArgs = `${cacheKey}:${JSON.stringify(args)}`;
      const cachedData = cache.get(cacheKeyWithArgs, cacheMaxAge);
      
      if (cachedData) {
        return cachedData;
      }
      
      // If not in cache, fetch fresh data
      const data = await fetchFn(...args);
      
      // Cache the result
      cache.set(cacheKeyWithArgs, data);
      
      return data;
    } catch (error) {
      console.error(`Error in cacheable fetch ${cacheKey}:`, error);
      
      // Use fallback if provided
      if (fallbackFn) {
        return fallbackFn(...args);
      }
      
      throw error;
    }
  };
};

/**
 * Invalidate a specific cache or all caches with a given prefix
 * 
 * @param {string} keyOrPrefix - Cache key or prefix to invalidate
 * @param {boolean} isPrefix - If true, invalidate all keys starting with keyOrPrefix
 */
export const invalidateCache = (keyOrPrefix, isPrefix = false) => {
  cache.invalidate(keyOrPrefix, isPrefix);
};

/**
 * Clear all caches
 */
export const clearCache = () => {
  cache.clear();
};

export default {
  createCacheableFetch,
  invalidateCache,
  clearCache
};