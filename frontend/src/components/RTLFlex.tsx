import React from 'react';
import { useDirection } from '../hooks/useDirection';

interface RTLFlexProps {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  gap?: number | string;
  align?: 'flex-start' | 'flex-end' | 'center' | 'baseline' | 'stretch';
  justify?: 'flex-start' | 'flex-end' | 'center' | 'space-between' | 'space-around' | 'space-evenly';
  wrap?: 'nowrap' | 'wrap' | 'wrap-reverse';
}

export function RTLFlex({
  children,
  className = '',
  style = {},
  gap,
  align = 'flex-start',
  justify = 'flex-start',
  wrap = 'nowrap',
}: RTLFlexProps) {
  const direction = useDirection();
  
  return (
    <div
      dir={direction}
      className={`rtl-flex ${className}`}
      style={{
        ...style,
        display: 'flex',
        flexDirection: direction === 'rtl' ? 'row-reverse' : 'row',
        alignItems: align,
        justifyContent: justify,
        flexWrap: wrap,
        gap: typeof gap === 'number' ? `${gap}px` : gap,
      }}
    >
      {children}
    </div>
  );
} 