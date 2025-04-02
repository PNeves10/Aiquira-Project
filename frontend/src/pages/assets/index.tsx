import { useState, useEffect } from 'react';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import MainLayout from '@/components/layout/MainLayout';
import { assetApi, Asset, AssetFilters } from '@/services/api';
import { useDebounce } from '@/hooks/useDebounce';

export default function AssetsPage() {
  const { t } = useTranslation('common');
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<AssetFilters>({
    type: '',
    minPrice: undefined,
    maxPrice: undefined,
    location: '',
    status: '',
    search: '',
  });
  const [pagination, setPagination] = useState({
    page: 1,
    pageSize: 12,
    total: 0,
  });
  const debouncedSearch = useDebounce(filters.search, 300);

  useEffect(() => {
    const fetchAssets = async () => {
      try {
        setLoading(true);
        const params: AssetFilters = {
          ...filters,
          page: pagination.page,
          pageSize: pagination.pageSize,
          search: debouncedSearch,
          minPrice: filters.minPrice ? Number(filters.minPrice) : undefined,
          maxPrice: filters.maxPrice ? Number(filters.maxPrice) : undefined,
        };
        const response = await assetApi.getAssets(params);
        setAssets(response.items);
        setPagination(prev => ({ ...prev, total: response.total }));
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch assets');
      } finally {
        setLoading(false);
      }
    };

    fetchAssets();
  }, [filters, pagination.page, pagination.pageSize, debouncedSearch]);

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
    setPagination(prev => ({ ...prev, page: 1 })); // Reset to first page when filters change
  };

  const handlePageChange = (newPage: number) => {
    setPagination(prev => ({ ...prev, page: newPage }));
  };

  const totalPages = Math.ceil(pagination.total / pagination.pageSize);

  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Filters */}
        <div className="mb-8 bg-white p-6 rounded-lg shadow">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Search</label>
              <input
                type="text"
                name="search"
                value={filters.search}
                onChange={handleFilterChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                placeholder="Search assets..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Type</label>
              <select
                name="type"
                value={filters.type}
                onChange={handleFilterChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
              >
                <option value="">All Types</option>
                <option value="business">Business</option>
                <option value="property">Property</option>
                <option value="technology">Technology</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Status</label>
              <select
                name="status"
                value={filters.status}
                onChange={handleFilterChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
              >
                <option value="">All Statuses</option>
                <option value="available">Available</option>
                <option value="under_offer">Under Offer</option>
                <option value="sold">Sold</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Min Price</label>
              <input
                type="number"
                name="minPrice"
                value={filters.minPrice || ''}
                onChange={handleFilterChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                placeholder="Minimum price"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Max Price</label>
              <input
                type="number"
                name="maxPrice"
                value={filters.maxPrice || ''}
                onChange={handleFilterChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                placeholder="Maximum price"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Location</label>
              <input
                type="text"
                name="location"
                value={filters.location}
                onChange={handleFilterChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                placeholder="Enter location"
              />
            </div>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-8">
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {/* Assets Grid */}
        {!loading && !error && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {assets.map((asset) => (
                <div
                  key={asset.id}
                  className="bg-white rounded-lg shadow overflow-hidden hover:shadow-lg transition-shadow duration-200"
                >
                  <div className="p-6">
                    <h3 className="text-lg font-semibold text-gray-900">{asset.title}</h3>
                    <p className="mt-2 text-sm text-gray-500">{asset.description}</p>
                    <div className="mt-4 flex items-center justify-between">
                      <span className="text-primary-600 font-medium">{asset.price}</span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        asset.status === 'Available' ? 'bg-green-100 text-green-800' :
                        asset.status === 'Under Offer' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {asset.status}
                      </span>
                    </div>
                    <div className="mt-4">
                      <a
                        href={`/assets/${asset.id}`}
                        className="text-primary-600 hover:text-primary-700 font-medium"
                      >
                        View Details →
                      </a>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-8 flex justify-center">
                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                  <button
                    onClick={() => handlePageChange(pagination.page - 1)}
                    disabled={pagination.page === 1}
                    className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                  >
                    Previous
                  </button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <button
                      key={page}
                      onClick={() => handlePageChange(page)}
                      className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                        page === pagination.page
                          ? 'z-10 bg-primary-50 border-primary-500 text-primary-600'
                          : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                  <button
                    onClick={() => handlePageChange(pagination.page + 1)}
                    disabled={pagination.page === totalPages}
                    className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                  >
                    Next
                  </button>
                </nav>
              </div>
            )}
          </>
        )}
      </div>
    </MainLayout>
  );
}

export async function getStaticProps({ locale }: { locale: string }) {
  return {
    props: {
      ...(await serverSideTranslations(locale, ['common'])),
    },
  };
} 