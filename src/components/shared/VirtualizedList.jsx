import { useState, useEffect, useRef, useMemo, useCallback } from 'react';

export const VirtualizedList = ({
  items,
  itemHeight = 60,
  containerHeight = 300,
  renderItem,
  className = '',
  overscan = 5,
}) => {
  const [scrollTop, setScrollTop] = useState(0);
  const scrollElementRef = useRef(null);

  const visibleRange = useMemo(() => {
    const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
    const endIndex = Math.min(items.length - 1, Math.ceil((scrollTop + containerHeight) / itemHeight) + overscan);
    return { startIndex, endIndex };
  }, [scrollTop, itemHeight, containerHeight, items.length, overscan]);

  const visibleItems = useMemo(() => {
    return items.slice(visibleRange.startIndex, visibleRange.endIndex + 1);
  }, [items, visibleRange]);

  const renderVisibleItem = useCallback(
    (item, index) => {
      const actualIndex = visibleRange.startIndex + index;
      return (
        <div key={item.id || actualIndex} style={{ height: itemHeight }}>
          {renderItem(item, actualIndex)}
        </div>
      );
    },
    [itemHeight, visibleRange.startIndex, renderItem]
  );

  const totalHeight = items.length * itemHeight;
  const offsetY = visibleRange.startIndex * itemHeight;

  const handleScroll = useCallback(e => {
    requestAnimationFrame(() => {
      setScrollTop(e.target.scrollTop);
    });
  }, []);

  useEffect(() => {
    const scrollElement = scrollElementRef.current;
    if (scrollElement) {
      scrollElement.addEventListener('scroll', handleScroll);
      return () => scrollElement.removeEventListener('scroll', handleScroll);
    }
  }, [handleScroll]);

  return (
    <div ref={scrollElementRef} className={`overflow-auto ${className}`} style={{ height: containerHeight }}>
      <div style={{ height: totalHeight, position: 'relative' }}>
        <div
          style={{
            transform: `translateY(${offsetY}px)`,
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
          }}
        >
          {visibleItems.map(renderVisibleItem)}
        </div>
      </div>
    </div>
  );
};
