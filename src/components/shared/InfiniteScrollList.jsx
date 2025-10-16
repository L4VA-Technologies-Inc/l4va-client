import { useEffect, useRef, useCallback } from 'react';

import { Spinner } from '@/components/Spinner';

export const InfiniteScrollList = ({
  items,
  renderItem,
  isLoading,
  isLoadingMore,
  hasNextPage,
  onLoadMore,
  className = '',
  itemClassName = '',
  loadThreshold = 100, // pixels from bottom to trigger load
}) => {
  const scrollRef = useRef(null);
  const isLoadingRef = useRef(false);

  const handleScroll = useCallback(() => {
    if (!scrollRef.current || isLoadingRef.current || !hasNextPage) return;

    const { scrollTop, scrollHeight, clientHeight } = scrollRef.current;
    const distanceFromBottom = scrollHeight - scrollTop - clientHeight;

    if (distanceFromBottom < loadThreshold) {
      isLoadingRef.current = true;
      onLoadMore().finally(() => {
        isLoadingRef.current = false;
      });
    }
  }, [hasNextPage, onLoadMore, loadThreshold]);

  useEffect(() => {
    const scrollElement = scrollRef.current;
    if (!scrollElement) return;

    scrollElement.addEventListener('scroll', handleScroll, { passive: true });
    return () => scrollElement.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-32">
        <Spinner />
      </div>
    );
  }

  if (items.length === 0) {
    return <div className="flex items-center justify-center h-32 text-dark-100">No assets available</div>;
  }

  return (
    <div ref={scrollRef} className={`overflow-y-auto ${className}`}>
      <div className="space-y-2">
        {items.map((item, index) => (
          <div key={item.id || item.tokenId || index} className={itemClassName}>
            {renderItem(item, index)}
          </div>
        ))}
      </div>

      {isLoadingMore && (
        <div className="flex items-center justify-center py-4">
          <Spinner size="sm" />
          <span className="ml-2 text-sm text-dark-300">Loading more...</span>
        </div>
      )}

      {!hasNextPage && items.length > 0 && (
        <div className="flex items-center justify-center py-4 text-sm text-dark-300">You've reached the end</div>
      )}
    </div>
  );
};
