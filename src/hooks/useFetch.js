import { useState, useEffect, useCallback } from 'react';

/**
 * Custom hook for handling async data fetching with loading, error states and retries
 * 
 * @param {Function} fetchFn - Async function that returns data
 * @param {Array} dependencies - Array of dependencies that should trigger a refetch
 * @param {Object} options - Additional options
 * @param {boolean} options.skipInitialFetch - If true, won't fetch on mount
 * @param {any} options.initialData - Initial data to use before fetching
 * @returns {Object} An object containing data, loading state, error, and control functions
 */
export const useFetch = (fetchFn, dependencies = [], options = {}) => {
  const { skipInitialFetch = false, initialData = null } = options;
  
  const [data, setData] = useState(initialData);
  const [loading, setLoading] = useState(!skipInitialFetch);
  const [error, setError] = useState(null);
  const [fetchCount, setFetchCount] = useState(0);
  
  const execute = useCallback(async (...args) => {
    try {
      setLoading(true);
      setError(null);
      
      const result = await fetchFn(...args);
      setData(result);
      return result;
    } catch (err) {
      setError(err.message || 'An error occurred');
      return null;
    } finally {
      setLoading(false);
    }
  }, [fetchFn]);
  
  const refetch = useCallback(() => {
    setFetchCount(prev => prev + 1);
  }, []);
  
  useEffect(() => {
    if (skipInitialFetch && fetchCount === 0) return;
    
    execute();
  // We intentionally exclude execute from the deps array to prevent infinite loops
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...dependencies, fetchCount]);
  
  return {
    data,
    loading,
    error,
    execute,
    refetch,
    setData, // Expose setData for optimistic updates
  };
};

/**
 * Custom hook for paginated data fetching
 * 
 * @param {Function} fetchFn - Async function that accepts limit and offset parameters
 * @param {number} initialLimit - Number of items to fetch per page
 * @param {Array} dependencies - Additional dependencies for refetching
 * @returns {Object} Pagination state and control functions
 */
export const usePagination = (fetchFn, initialLimit = 10, dependencies = []) => {
  const [items, setItems] = useState([]);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  
  const { data, loading, error, refetch } = useFetch(
    async () => {
      const result = await fetchFn(initialLimit, 0);
      setItems(result || []);
      setHasMore((result || []).length === initialLimit);
      return result;
    }, 
    dependencies
  );
  
  const loadMore = useCallback(async () => {
    if (loadingMore || !hasMore) return;
    
    try {
      setLoadingMore(true);
      const nextPage = page + 1;
      const offset = nextPage * initialLimit;
      
      const newItems = await fetchFn(initialLimit, offset);
      
      if (newItems && newItems.length > 0) {
        setItems(prev => [...prev, ...newItems]);
        setHasMore(newItems.length === initialLimit);
        setPage(nextPage);
      } else {
        setHasMore(false);
      }
    } catch (err) {
      console.error('Error loading more items:', err);
    } finally {
      setLoadingMore(false);
    }
  }, [fetchFn, initialLimit, page, hasMore, loadingMore]);
  
  const reset = useCallback(() => {
    setItems([]);
    setPage(0);
    setHasMore(true);
    refetch();
  }, [refetch]);
  
  return {
    items,
    loading,
    loadingMore,
    error,
    hasMore,
    loadMore,
    reset
  };
};

/**
 * Custom hook for infinite scrolling
 * 
 * @param {Function} loadMoreFn - Function to load more items
 * @param {boolean} hasMore - Whether there are more items to load
 * @param {boolean} loading - Whether items are currently loading
 * @param {Object} options - Additional options
 * @param {number} options.threshold - Distance from bottom (in px) to trigger loading
 * @param {HTMLElement} options.scrollContainer - Element to attach scroll listener to
 * @returns {Object} IntersectionObserver reference element
 */
export const useInfiniteScroll = (
  loadMoreFn, 
  hasMore, 
  loading, 
  options = {}
) => {
  const { threshold = 300, scrollContainer = null } = options;
  const [sentinelRef, setSentinelRef] = useState(null);
  
  useEffect(() => {
    if (!sentinelRef) return;
    
    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting && hasMore && !loading) {
          loadMoreFn();
        }
      },
      {
        root: scrollContainer,
        rootMargin: `0px 0px ${threshold}px 0px`,
        threshold: 0.1,
      }
    );
    
    observer.observe(sentinelRef);
    
    return () => {
      if (sentinelRef) {
        observer.unobserve(sentinelRef);
      }
    };
  }, [sentinelRef, loadMoreFn, hasMore, loading, threshold, scrollContainer]);
  
  return { sentinelRef: setSentinelRef };
};