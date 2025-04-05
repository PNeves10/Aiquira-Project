import React from 'react';
import { useDirection } from '../hooks/useDirection';

interface RTLGridProps {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  columns?: number;
  gap?: number | string;
  align?: 'start' | 'end' | 'center' | 'stretch';
  justify?: 'start' | 'end' | 'center' | 'space-between' | 'space-around' | 'space-evenly';
}

export function RTLGrid({
  children,
  className = '',
  style = {},
  columns = 12,
  gap = '1rem',
  align = 'start',
  justify = 'start',
}: RTLGridProps) {
  const direction = useDirection();
  
  return (
    <div
      dir={direction}
      className={`rtl-grid ${className}`}
      style={{
        ...style,
        display: 'grid',
        gridTemplateColumns: `repeat(${columns}, 1fr)`,
        gap: typeof gap === 'number' ? `${gap}px` : gap,
        alignItems: align,
        justifyContent: justify,
      }}
    >
      {children}
    </div>
  );
}

interface RTLGridItemProps {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  span?: number;
  start?: number;
  end?: number;
}

export function RTLGridItem({
  children,
  className = '',
  style = {},
  span = 1,
  start,
  end,
}: RTLGridItemProps) {
  const direction = useDirection();
  
  return (
    <div
      dir={direction}
      className={`rtl-grid-item ${className}`}
      style={{
        ...style,
        gridColumn: start && end
          ? `${start} / ${end}`
          : `span ${span}`,
      }}
    >
      {children}
    </div>
  );
} 