import React, { useState } from 'react';
import { useDirection } from '../hooks/useDirection';

interface Column<T> {
  key: keyof T | string;
  header: string;
  render?: (item: T) => React.ReactNode;
  sortable?: boolean;
  filterable?: boolean;
}

interface RTLTableProps<T> {
  data: T[];
  columns: Column<T>[];
  className?: string;
  style?: React.CSSProperties;
  onSort?: (key: keyof T | string, direction: 'asc' | 'desc') => void;
  onFilter?: (key: keyof T | string, value: string) => void;
  sortKey?: keyof T | string;
  sortDirection?: 'asc' | 'desc';
  filters?: Record<string, string>;
}

export function RTLTable<T>({
  data,
  columns,
  className = '',
  style = {},
  onSort,
  onFilter,
  sortKey,
  sortDirection,
  filters = {},
}: RTLTableProps<T>) {
  const direction = useDirection();
  const [localSortKey, setLocalSortKey] = useState<keyof T | string | undefined>(sortKey);
  const [localSortDirection, setLocalSortDirection] = useState<'asc' | 'desc' | undefined>(sortDirection);
  const [localFilters, setLocalFilters] = useState<Record<string, string>>(filters);

  const handleSort = (key: keyof T | string) => {
    const column = columns.find(col => col.key === key);
    if (!column?.sortable) return;

    const newDirection = localSortKey === key && localSortDirection === 'asc' ? 'desc' : 'asc';
    setLocalSortKey(key);
    setLocalSortDirection(newDirection);
    onSort?.(key, newDirection);
  };

  const handleFilter = (key: keyof T | string, value: string) => {
    const column = columns.find(col => col.key === key);
    if (!column?.filterable) return;

    const newFilters = { ...localFilters, [key]: value };
    setLocalFilters(newFilters);
    onFilter?.(key, value);
  };

  return (
    <div
      dir={direction}
      className={`rtl-table-container ${className}`}
      style={{
        ...style,
        direction,
      }}
    >
      <table className="rtl-table">
        <thead>
          <tr>
            {columns.map(column => (
              <th
                key={String(column.key)}
                className={`
                  ${column.sortable ? 'sortable' : ''}
                  ${column.filterable ? 'filterable' : ''}
                  ${localSortKey === column.key ? `sorted-${localSortDirection}` : ''}
                `}
                onClick={() => column.sortable && handleSort(column.key)}
              >
                <div className="header-content">
                  <span>{column.header}</span>
                  {column.sortable && (
                    <span className="sort-indicator">
                      {localSortKey === column.key ? (localSortDirection === 'asc' ? '↑' : '↓') : '↕'}
                    </span>
                  )}
                </div>
                {column.filterable && (
                  <input
                    type="text"
                    value={localFilters[String(column.key)] || ''}
                    onChange={e => handleFilter(column.key, e.target.value)}
                    className="filter-input"
                    placeholder={`Filter ${column.header.toLowerCase()}...`}
                  />
                )}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((item, index) => (
            <tr key={index}>
              {columns.map(column => (
                <td key={String(column.key)}>
                  {column.render ? column.render(item) : String(item[column.key as keyof T])}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
} 