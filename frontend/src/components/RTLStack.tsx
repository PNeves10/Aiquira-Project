import React from 'react';
import { useDirection } from '../hooks/useDirection';

interface RTLStackProps {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  gap?: number | string;
  align?: 'flex-start' | 'flex-end' | 'center' | 'baseline' | 'stretch';
  justify?: 'flex-start' | 'flex-end' | 'center' | 'space-between' | 'space-around' | 'space-evenly';
  spacing?: number | string;
}

export function RTLStack({
  children,
  className = '',
  style = {},
  gap,
  align = 'flex-start',
  justify = 'flex-start',
  spacing = '1rem',
}: RTLStackProps) {
  const direction = useDirection();
  
  return (
    <div
      dir={direction}
      className={`rtl-stack ${className}`}
      style={{
        ...style,
        display: 'flex',
        flexDirection: 'column',
        alignItems: align,
        justifyContent: justify,
        gap: typeof gap === 'number' ? `${gap}px` : gap,
      }}
    >
      {React.Children.map(children, (child, index) => {
        if (React.isValidElement(child)) {
          return React.cloneElement(child, {
            style: {
              ...child.props.style,
              marginBottom: index !== React.Children.count(children) - 1
                ? (typeof spacing === 'number' ? `${spacing}px` : spacing)
                : 0,
            },
          });
        }
        return child;
      })}
    </div>
  );
} 