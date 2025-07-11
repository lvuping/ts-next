import { useState, useRef, useCallback, useEffect } from 'react';

interface UseInfiniteScrollOptions {
  itemsPerPage?: number;
  threshold?: number;
}

export function useInfiniteScroll<T>(
  items: T[],
  options: UseInfiniteScrollOptions = {}
) {
  const { itemsPerPage = 20, threshold = 100 } = options;
  const [displayedItems, setDisplayedItems] = useState<T[]>([]);
  const [hasMore, setHasMore] = useState(true);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const loadMoreRef = useRef<HTMLDivElement>(null);

  // Initialize displayed items
  useEffect(() => {
    if (items.length > 0) {
      setDisplayedItems(items.slice(0, itemsPerPage));
      setHasMore(items.length > itemsPerPage);
    }
  }, [items, itemsPerPage]);

  const loadMore = useCallback(() => {
    const currentLength = displayedItems.length;
    const nextItems = items.slice(currentLength, currentLength + itemsPerPage);
    
    if (nextItems.length > 0) {
      setDisplayedItems(prev => [...prev, ...nextItems]);
      setHasMore(currentLength + nextItems.length < items.length);
    } else {
      setHasMore(false);
    }
  }, [displayedItems.length, items, itemsPerPage]);

  // Set up intersection observer
  useEffect(() => {
    if (observerRef.current) {
      observerRef.current.disconnect();
    }

    observerRef.current = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore) {
          loadMore();
        }
      },
      { 
        rootMargin: `${threshold}px`,
        threshold: 0.1 
      }
    );

    if (loadMoreRef.current && hasMore) {
      observerRef.current.observe(loadMoreRef.current);
    }

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [hasMore, loadMore, threshold]);

  return {
    displayedItems,
    hasMore,
    loadMore,
    loadMoreRef,
  };
}