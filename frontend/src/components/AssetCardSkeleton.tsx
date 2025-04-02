import React from 'react';

export const AssetCardSkeleton: React.FC = () => {
  return (
    <article className="bg-white rounded-lg shadow-md overflow-hidden animate-pulse">
      <div className="relative h-48 bg-gray-200" />
      
      <div className="p-4">
        <div className="h-6 bg-gray-200 rounded w-3/4 mb-2" />
        <div className="h-4 bg-gray-200 rounded w-full mb-2" />
        <div className="h-4 bg-gray-200 rounded w-2/3 mb-4" />
        
        <div className="flex justify-between items-center mb-4">
          <div className="h-5 bg-gray-200 rounded w-1/3" />
          <div className="h-4 bg-gray-200 rounded w-1/4" />
        </div>
        
        <div className="flex gap-2">
          <div className="flex-1 h-10 bg-gray-200 rounded" />
          <div className="flex-1 h-10 bg-gray-200 rounded" />
        </div>
      </div>
    </article>
  );
}; 