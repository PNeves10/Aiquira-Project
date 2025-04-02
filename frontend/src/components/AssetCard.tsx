import React from 'react';
import Image from 'next/image';
import { formatCurrency } from '../utils/format';
import { useOptimisticMutation } from '../hooks/useOptimisticMutation';
import { toast } from 'react-hot-toast';

interface Asset {
  id: string;
  title: string;
  description: string;
  price: number;
  location: string;
  type: string;
  status: string;
  imageUrl: string;
  createdAt: string;
  updatedAt: string;
}

interface AssetCardProps {
  asset: Asset;
  onViewDetails?: (id: string) => void;
  onContact?: (id: string) => void;
  onUpdateStatus?: (id: string, newStatus: string) => Promise<void>;
  isLoading?: boolean;
}

export const AssetCard: React.FC<AssetCardProps> = ({
  asset,
  onViewDetails,
  onContact,
  onUpdateStatus,
  isLoading = false,
}) => {
  const handleKeyPress = (event: React.KeyboardEvent, callback?: (id: string) => void) => {
    if ((event.key === 'Enter' || event.key === ' ') && callback) {
      event.preventDefault();
      callback(asset.id);
    }
  };

  const statusMutation = useOptimisticMutation({
    mutationFn: async (newStatus: string) => {
      if (!onUpdateStatus) throw new Error('onUpdateStatus not provided');
      return onUpdateStatus(asset.id, newStatus);
    },
    onMutate: async (newStatus) => {
      // Optimistically update the status
      const previousStatus = asset.status;
      asset.status = newStatus;
      return previousStatus;
    },
    onError: async (error, newStatus, previousStatus) => {
      // Rollback on error
      if (previousStatus) {
        asset.status = previousStatus;
      }
      toast.error(`Failed to update status to ${newStatus}`);
    },
    onSuccess: async () => {
      toast.success(`Status updated to ${asset.status}`);
    },
  });

  if (isLoading) {
    return (
      <article
        className="bg-white rounded-lg shadow-md overflow-hidden animate-pulse"
        role="status"
        aria-label="Loading asset card"
      >
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
  }

  return (
    <article
      className="bg-white rounded-lg shadow-md overflow-hidden"
      role="article"
      aria-labelledby={`asset-title-${asset.id}`}
      tabIndex={0}
      onKeyDown={(e) => handleKeyPress(e, onViewDetails)}
      onClick={() => onViewDetails?.(asset.id)}
    >
      <div className="relative h-48">
        <Image
          src={asset.imageUrl}
          alt={`Image of ${asset.title}`}
          fill
          className="object-cover"
          priority
        />
        <div
          className={`absolute top-2 right-2 px-2 py-1 rounded-full text-sm font-medium ${
            statusMutation.isLoading ? 'opacity-50' : ''
          }`}
          role="status"
          aria-live="polite"
        >
          {asset.status}
        </div>
      </div>
      
      <div className="p-4">
        <h2
          id={`asset-title-${asset.id}`}
          className="text-xl font-semibold mb-2"
          tabIndex={-1}
        >
          {asset.title}
        </h2>
        
        <p className="text-gray-600 mb-2">{asset.description}</p>
        
        <div className="flex justify-between items-center mb-4">
          <span className="text-lg font-bold">{formatCurrency(asset.price)}</span>
          <span className="text-sm text-gray-500">{asset.location}</span>
        </div>
        
        <div className="flex gap-2">
          <button
            className="flex-1 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={(e) => {
              e.stopPropagation();
              onViewDetails?.(asset.id);
            }}
            onKeyDown={(e) => handleKeyPress(e, onViewDetails)}
            disabled={statusMutation.isLoading}
          >
            View Details
          </button>
          
          <button
            className="flex-1 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={(e) => {
              e.stopPropagation();
              onContact?.(asset.id);
            }}
            onKeyDown={(e) => handleKeyPress(e, onContact)}
            disabled={statusMutation.isLoading}
          >
            Contact
          </button>
        </div>
      </div>
    </article>
  );
}; 