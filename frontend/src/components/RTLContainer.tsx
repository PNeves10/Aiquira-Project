import React from 'react';
import { useDirection } from '../hooks/useDirection';

interface RTLContainerProps {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

export function RTLContainer({ children, className = '', style = {} }: RTLContainerProps) {
  const direction = useDirection();
  
  return (
    <div
      dir={direction}
      className={`rtl-container ${className}`}
      style={{
        ...style,
        direction,
      }}
    >
      {children}
    </div>
  );
} 