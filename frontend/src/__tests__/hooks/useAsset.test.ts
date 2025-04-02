import { renderHook, act } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useAsset, useAssets, useUpdateAsset, useDeleteAsset } from '@/hooks/useAsset';
import { assetApi } from '@/services/api';

// Mock the API
jest.mock('@/services/api', () => ({
  assetApi: {
    getAsset: jest.fn(),
    getAssets: jest.fn(),
    updateAsset: jest.fn(),
    deleteAsset: jest.fn(),
  },
}));

const mockAsset = {
  id: 1,
  title: 'Test Asset',
  type: 'business',
  price: '1000000',
  status: 'available',
  description: 'Test Description',
  location: 'Test Location',
  financials: {
    revenue: '500000',
    profit: '100000',
    employees: 50,
    yearFounded: 2020,
  },
  documents: [],
};

describe('useAsset', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
        },
      },
    });
    jest.clearAllMocks();
  });

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );

  describe('useAsset', () => {
    it('should fetch asset data', async () => {
      (assetApi.getAsset as jest.Mock).mockResolvedValue(mockAsset);

      const { result } = renderHook(() => useAsset('1'), { wrapper });

      expect(result.current.isLoading).toBe(true);
      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 0));
      });
      expect(result.current.isLoading).toBe(false);
      expect(result.current.data).toEqual(mockAsset);
    });

    it('should handle error state', async () => {
      const error = new Error('Failed to fetch');
      (assetApi.getAsset as jest.Mock).mockRejectedValue(error);

      const { result } = renderHook(() => useAsset('1'), { wrapper });

      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 0));
      });
      expect(result.current.isError).toBe(true);
      expect(result.current.error).toBe(error);
    });
  });

  describe('useAssets', () => {
    it('should fetch assets with filters', async () => {
      const mockResponse = {
        items: [mockAsset],
        total: 1,
        page: 1,
        pageSize: 12,
      };
      (assetApi.getAssets as jest.Mock).mockResolvedValue(mockResponse);

      const filters = { type: 'business', page: 1 };
      const { result } = renderHook(() => useAssets(filters), { wrapper });

      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 0));
      });
      expect(result.current.data).toEqual(mockResponse);
    });
  });

  describe('useUpdateAsset', () => {
    it('should update asset and invalidate queries', async () => {
      const updatedAsset = { ...mockAsset, title: 'Updated Asset' };
      (assetApi.updateAsset as jest.Mock).mockResolvedValue(updatedAsset);

      const { result } = renderHook(() => useUpdateAsset(), { wrapper });

      await act(async () => {
        await result.current.mutateAsync(updatedAsset);
      });

      expect(assetApi.updateAsset).toHaveBeenCalledWith(updatedAsset);
      expect(queryClient.getQueryData(['asset', updatedAsset.id])).toEqual(updatedAsset);
    });
  });

  describe('useDeleteAsset', () => {
    it('should delete asset and invalidate queries', async () => {
      (assetApi.deleteAsset as jest.Mock).mockResolvedValue({ success: true });

      const { result } = renderHook(() => useDeleteAsset(), { wrapper });

      await act(async () => {
        await result.current.mutateAsync(1);
      });

      expect(assetApi.deleteAsset).toHaveBeenCalledWith(1);
      expect(queryClient.getQueryData(['asset', 1])).toBeUndefined();
    });
  });
}); 