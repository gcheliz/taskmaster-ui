import React, { useRef } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import { cn } from '../../utils/cn';

interface VirtualizedListProps<T> {
  items: T[];
  height?: number | string;
  itemHeight?: number | ((index: number) => number);
  renderItem: (item: T, index: number) => React.ReactNode;
  overscan?: number;
  className?: string;
  estimateSize?: (index: number) => number;
  getItemKey?: (index: number) => string | number;
  onScroll?: (scrollTop: number) => void;
  gap?: number;
}

export function VirtualizedList<T>({
  items,
  height = 400,
  itemHeight = 50,
  renderItem,
  overscan = 5,
  className,
  estimateSize,
  getItemKey,
  onScroll,
  gap = 0,
}: VirtualizedListProps<T>) {
  const parentRef = useRef<HTMLDivElement>(null);

  const virtualizer = useVirtualizer({
    count: items.length,
    getScrollElement: () => parentRef.current,
    estimateSize: estimateSize || (typeof itemHeight === 'function' ? itemHeight : () => itemHeight),
    overscan,
    getItemKey: getItemKey || ((index) => index),
    gap,
  });

  const virtualItems = virtualizer.getVirtualItems();

  return (
    <div
      ref={parentRef}
      className={cn(
        'overflow-auto scrollbar-thin',
        className
      )}
      style={{
        height: typeof height === 'number' ? `${height}px` : height,
      }}
      onScroll={(e) => {
        const scrollTop = (e.target as HTMLElement).scrollTop;
        onScroll?.(scrollTop);
      }}
    >
      <div
        style={{
          height: `${virtualizer.getTotalSize()}px`,
          width: '100%',
          position: 'relative',
        }}
      >
        {virtualItems.map((virtualItem) => (
          <div
            key={virtualItem.key}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: `${virtualItem.size}px`,
              transform: `translateY(${virtualItem.start}px)`,
            }}
          >
            {renderItem(items[virtualItem.index], virtualItem.index)}
          </div>
        ))}
      </div>
    </div>
  );
}

// Specialized virtualized list for uniform items
export function UniformVirtualizedList<T>({
  items,
  itemHeight = 50,
  ...props
}: Omit<VirtualizedListProps<T>, 'estimateSize'> & { itemHeight?: number }) {
  return (
    <VirtualizedList
      items={items}
      itemHeight={itemHeight}
      estimateSize={() => itemHeight}
      {...props}
    />
  );
}

// Hook for custom virtualization
export function useVirtualization<T>(
  items: T[],
  containerRef: React.RefObject<HTMLElement>,
  itemHeight: number | ((index: number) => number)
) {
  const virtualizer = useVirtualizer({
    count: items.length,
    getScrollElement: () => containerRef.current,
    estimateSize: typeof itemHeight === 'function' ? itemHeight : () => itemHeight,
    overscan: 5,
  });

  return {
    virtualItems: virtualizer.getVirtualItems(),
    totalSize: virtualizer.getTotalSize(),
    measureElement: virtualizer.measureElement,
  };
}