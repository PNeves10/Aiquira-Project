import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { assetApi, Asset } from '@/services/api';

export function useAsset(id: string) {
  return useQuery({
    queryKey: ['asset', id],
    queryFn: () => assetApi.getAsset(Number(id)),
    staleTime: 5 * 60 * 1000, // Consider data fresh for 5 minutes
    cacheTime: 30 * 60 * 1000, // Keep in cache for 30 minutes
  });
}

export function useAssets(filters?: any) {
  return useQuery({
    queryKey: ['assets', filters],
    queryFn: () => assetApi.getAssets(filters),
    staleTime: 5 * 60 * 1000,
    cacheTime: 30 * 60 * 1000,
  });
}

export function useUpdateAsset() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (asset: Partial<Asset>) => assetApi.updateAsset(asset),
    onSuccess: (data) => {
      // Invalidate and refetch assets query
      queryClient.invalidateQueries({ queryKey: ['assets'] });
      // Update the specific asset in cache
      queryClient.setQueryData(['asset', data.id], data);
    },
  });
}

export function useDeleteAsset() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => assetApi.deleteAsset(id),
    onSuccess: (_, id) => {
      // Invalidate and refetch assets query
      queryClient.invalidateQueries({ queryKey: ['assets'] });
      // Remove the asset from cache
      queryClient.removeQueries({ queryKey: ['asset', id] });
    },
  });
} 