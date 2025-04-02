import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { useRouter } from 'next/router';
import AssetsPage from '@/pages/assets/index';
import { assetApi } from '@/services/api';

// Mock next/router
jest.mock('next/router', () => ({
  useRouter: jest.fn(),
}));

// Mock the API
jest.mock('@/services/api', () => ({
  assetApi: {
    getAssets: jest.fn(),
  },
}));

// Mock next-i18next
jest.mock('next-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

describe('AssetsPage', () => {
  const mockAssets = [
    {
      id: 1,
      title: 'Test Asset 1',
      type: 'Business',
      price: '€1M',
      status: 'Available',
      description: 'Test business asset 1',
      location: 'Test Location 1',
      financials: {
        revenue: '1000000',
        profit: '200000',
        employees: 50,
        yearFounded: 2020,
      },
      documents: [],
    },
    {
      id: 2,
      title: 'Test Asset 2',
      type: 'Property',
      price: '€2M',
      status: 'Under Offer',
      description: 'Test property asset 2',
      location: 'Test Location 2',
      financials: {
        revenue: '2000000',
        profit: '400000',
        employees: 100,
        yearFounded: 2019,
      },
      documents: [],
    },
  ];

  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks();

    // Mock router
    (useRouter as jest.Mock).mockImplementation(() => ({
      query: {},
    }));

    // Mock API response
    (assetApi.getAssets as jest.Mock).mockResolvedValue({
      items: mockAssets,
      total: 2,
      page: 1,
      pageSize: 12,
    });
  });

  it('renders the assets page with loading state', () => {
    render(<AssetsPage />);
    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('renders the assets page with assets', async () => {
    render(<AssetsPage />);

    // Wait for loading to complete
    await waitFor(() => {
      expect(screen.queryByRole('status')).not.toBeInTheDocument();
    });

    // Check if assets are rendered
    expect(screen.getByText('Test Asset 1')).toBeInTheDocument();
    expect(screen.getByText('Test Asset 2')).toBeInTheDocument();
  });

  it('handles search input', async () => {
    render(<AssetsPage />);

    // Wait for loading to complete
    await waitFor(() => {
      expect(screen.queryByRole('status')).not.toBeInTheDocument();
    });

    // Get search input
    const searchInput = screen.getByPlaceholderText('Search assets...');

    // Type in search
    fireEvent.change(searchInput, { target: { value: 'test' } });

    // Wait for debounce
    await waitFor(() => {
      expect(assetApi.getAssets).toHaveBeenCalledWith(
        expect.objectContaining({
          search: 'test',
        })
      );
    });
  });

  it('handles filter changes', async () => {
    render(<AssetsPage />);

    // Wait for loading to complete
    await waitFor(() => {
      expect(screen.queryByRole('status')).not.toBeInTheDocument();
    });

    // Get filter inputs
    const typeSelect = screen.getByLabelText('Type');
    const statusSelect = screen.getByLabelText('Status');
    const minPriceInput = screen.getByPlaceholderText('Minimum price');
    const maxPriceInput = screen.getByPlaceholderText('Maximum price');
    const locationInput = screen.getByPlaceholderText('Enter location');

    // Change filters
    fireEvent.change(typeSelect, { target: { value: 'business' } });
    fireEvent.change(statusSelect, { target: { value: 'available' } });
    fireEvent.change(minPriceInput, { target: { value: '1000000' } });
    fireEvent.change(maxPriceInput, { target: { value: '2000000' } });
    fireEvent.change(locationInput, { target: { value: 'test' } });

    // Wait for API call
    await waitFor(() => {
      expect(assetApi.getAssets).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'business',
          status: 'available',
          minPrice: 1000000,
          maxPrice: 2000000,
          location: 'test',
        })
      );
    });
  });

  it('handles pagination', async () => {
    render(<AssetsPage />);

    // Wait for loading to complete
    await waitFor(() => {
      expect(screen.queryByRole('status')).not.toBeInTheDocument();
    });

    // Click next page
    const nextButton = screen.getByText('Next');
    fireEvent.click(nextButton);

    // Wait for API call
    await waitFor(() => {
      expect(assetApi.getAssets).toHaveBeenCalledWith(
        expect.objectContaining({
          page: 2,
        })
      );
    });
  });

  it('handles error state', async () => {
    // Mock API error
    (assetApi.getAssets as jest.Mock).mockRejectedValue(new Error('API Error'));

    render(<AssetsPage />);

    // Wait for error to be displayed
    await waitFor(() => {
      expect(screen.getByText('API Error')).toBeInTheDocument();
    });
  });
}); 