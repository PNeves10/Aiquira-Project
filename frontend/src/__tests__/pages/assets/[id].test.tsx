import { render, screen, waitFor } from '@testing-library/react';
import { useRouter } from 'next/router';
import AssetDetailsPage from '@/pages/assets/[id]';
import { api } from '@/services/api';

// Mock the router
jest.mock('next/router', () => ({
  useRouter: jest.fn(),
}));

// Mock the API
jest.mock('@/services/api', () => ({
  api: {
    get: jest.fn(),
  },
}));

const mockAsset = {
  id: '1',
  title: 'Test Asset',
  description: 'Test Description',
  status: 'active',
  price: 1000000,
  location: 'Test Location',
  financials: {
    annualRevenue: 500000,
    profit: 100000,
    employees: 50,
    yearFounded: 2020,
  },
  documents: [
    {
      id: '1',
      title: 'Test Document',
      type: 'pdf',
      url: 'https://example.com/test.pdf',
    },
  ],
  aiAnalysis: {
    valuation: {
      estimatedValue: 1200000,
      confidence: 0.85,
      methodology: 'DCF',
    },
    risks: [
      {
        category: 'market',
        description: 'Market risk',
        severity: 'medium',
      },
    ],
    opportunities: [
      {
        description: 'Growth opportunity',
        potential: 'high',
      },
    ],
  },
};

describe('AssetDetailsPage', () => {
  beforeEach(() => {
    // Reset all mocks before each test
    jest.clearAllMocks();
    
    // Mock router
    (useRouter as jest.Mock).mockReturnValue({
      query: { id: '1' },
      push: jest.fn(),
    });

    // Mock API response
    (api.get as jest.Mock).mockResolvedValue({ data: mockAsset });
  });

  it('renders loading state initially', () => {
    render(<AssetDetailsPage />);
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('renders asset details after loading', async () => {
    render(<AssetDetailsPage />);
    
    await waitFor(() => {
      expect(screen.getByText('Test Asset')).toBeInTheDocument();
      expect(screen.getByText('Test Description')).toBeInTheDocument();
      expect(screen.getByText('$1,000,000')).toBeInTheDocument();
      expect(screen.getByText('Test Location')).toBeInTheDocument();
    });
  });

  it('renders financial information', async () => {
    render(<AssetDetailsPage />);
    
    await waitFor(() => {
      expect(screen.getByText('$500,000')).toBeInTheDocument();
      expect(screen.getByText('$100,000')).toBeInTheDocument();
      expect(screen.getByText('50')).toBeInTheDocument();
      expect(screen.getByText('2020')).toBeInTheDocument();
    });
  });

  it('renders documents section', async () => {
    render(<AssetDetailsPage />);
    
    await waitFor(() => {
      expect(screen.getByText('Test Document')).toBeInTheDocument();
      expect(screen.getByText('pdf')).toBeInTheDocument();
    });
  });

  it('renders AI analysis section', async () => {
    render(<AssetDetailsPage />);
    
    await waitFor(() => {
      expect(screen.getByText('$1,200,000')).toBeInTheDocument();
      expect(screen.getByText('85%')).toBeInTheDocument();
      expect(screen.getByText('DCF')).toBeInTheDocument();
      expect(screen.getByText('Market risk')).toBeInTheDocument();
      expect(screen.getByText('Growth opportunity')).toBeInTheDocument();
    });
  });

  it('handles API error', async () => {
    // Mock API error
    (api.get as jest.Mock).mockRejectedValue(new Error('API Error'));
    
    render(<AssetDetailsPage />);
    
    await waitFor(() => {
      expect(screen.getByText('Error loading asset details')).toBeInTheDocument();
    });
  });
}); 