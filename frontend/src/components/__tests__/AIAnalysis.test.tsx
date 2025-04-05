import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { AIAnalysis } from '../AIAnalysis';
import { portugueseMarketService } from '../../services/portugueseMarket';
import { z } from 'zod';

// Mock the portugueseMarketService
jest.mock('../../services/portugueseMarket', () => ({
  portugueseMarketService: {
    getAIAnalysis: jest.fn(),
  },
}));

describe('AIAnalysis', () => {
  const mockAssetId = 'test-asset-id';
  const mockAnalysis = {
    riskScore: 45,
    recommendations: [
      'Consider conducting additional due diligence',
      'Review energy efficiency improvements',
    ],
    marketInsights: {
      trend: 'positive' as const,
      confidence: 0.85,
      factors: [
        'Increasing property values in the area',
        'Strong rental demand',
      ],
    },
    complianceScore: 75,
    issues: [
      {
        severity: 'high' as const,
        description: 'Registry status is not active',
        impact: 'May affect property ownership and transferability',
        resolution: 'Update registry status with relevant authorities',
      },
      {
        severity: 'medium' as const,
        description: 'Low energy efficiency rating',
        impact: 'Higher utility costs and potential renovation requirements',
        resolution: 'Consider energy efficiency improvements',
      },
    ],
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders loading state initially', () => {
    render(<AIAnalysis assetId={mockAssetId} />);
    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('renders error state when API call fails', async () => {
    const errorMessage = 'Failed to fetch AI analysis';
    (portugueseMarketService.getAIAnalysis as jest.Mock).mockRejectedValueOnce(new Error(errorMessage));

    render(<AIAnalysis assetId={mockAssetId} />);

    await waitFor(() => {
      expect(screen.getByText(`Error: ${errorMessage}`)).toBeInTheDocument();
    });
  });

  it('renders AI analysis data successfully', async () => {
    (portugueseMarketService.getAIAnalysis as jest.Mock).mockResolvedValueOnce(mockAnalysis);

    render(<AIAnalysis assetId={mockAssetId} />);

    await waitFor(() => {
      expect(screen.getByText('AI-Powered Analysis')).toBeInTheDocument();
      expect(screen.getByText('45')).toBeInTheDocument();
      expect(screen.getByText('Medium Risk')).toBeInTheDocument();
      expect(screen.getByText('Positive Trend')).toBeInTheDocument();
      expect(screen.getByText('85%')).toBeInTheDocument();
    });
  });

  it('displays market insights correctly', async () => {
    (portugueseMarketService.getAIAnalysis as jest.Mock).mockResolvedValueOnce(mockAnalysis);

    render(<AIAnalysis assetId={mockAssetId} />);

    await waitFor(() => {
      expect(screen.getByText('Market Insights')).toBeInTheDocument();
      expect(screen.getByText('Increasing property values in the area')).toBeInTheDocument();
      expect(screen.getByText('Strong rental demand')).toBeInTheDocument();
    });
  });

  it('displays recommendations correctly', async () => {
    (portugueseMarketService.getAIAnalysis as jest.Mock).mockResolvedValueOnce(mockAnalysis);

    render(<AIAnalysis assetId={mockAssetId} />);

    await waitFor(() => {
      expect(screen.getByText('Recommendations')).toBeInTheDocument();
      mockAnalysis.recommendations.forEach(recommendation => {
        expect(screen.getByText(recommendation)).toBeInTheDocument();
      });
    });
  });

  it('displays issues with correct severity levels', async () => {
    (portugueseMarketService.getAIAnalysis as jest.Mock).mockResolvedValueOnce(mockAnalysis);

    render(<AIAnalysis assetId={mockAssetId} />);

    await waitFor(() => {
      expect(screen.getByText('Identified Issues')).toBeInTheDocument();
      expect(screen.getByText('High Priority')).toBeInTheDocument();
      expect(screen.getByText('Medium Priority')).toBeInTheDocument();
      mockAnalysis.issues.forEach(issue => {
        expect(screen.getByText(issue.description)).toBeInTheDocument();
        expect(screen.getByText(issue.impact)).toBeInTheDocument();
        expect(screen.getByText(issue.resolution)).toBeInTheDocument();
      });
    });
  });

  it('displays different risk levels correctly', async () => {
    const lowRiskAnalysis = { ...mockAnalysis, riskScore: 25 };
    (portugueseMarketService.getAIAnalysis as jest.Mock).mockResolvedValueOnce(lowRiskAnalysis);

    render(<AIAnalysis assetId={mockAssetId} />);

    await waitFor(() => {
      expect(screen.getByText('Low Risk')).toBeInTheDocument();
    });

    const highRiskAnalysis = { ...mockAnalysis, riskScore: 85 };
    (portugueseMarketService.getAIAnalysis as jest.Mock).mockResolvedValueOnce(highRiskAnalysis);

    render(<AIAnalysis assetId={mockAssetId} />);

    await waitFor(() => {
      expect(screen.getByText('High Risk')).toBeInTheDocument();
    });
  });

  it('displays different market trends correctly', async () => {
    const negativeAnalysis = {
      ...mockAnalysis,
      marketInsights: { ...mockAnalysis.marketInsights, trend: 'negative' as const },
    };
    (portugueseMarketService.getAIAnalysis as jest.Mock).mockResolvedValueOnce(negativeAnalysis);

    render(<AIAnalysis assetId={mockAssetId} />);

    await waitFor(() => {
      expect(screen.getByText('Negative Trend')).toBeInTheDocument();
    });
  });

  it('validates assetId format', async () => {
    const invalidAssetId = 'invalid@id';
    render(<AIAnalysis assetId={invalidAssetId} />);

    await waitFor(() => {
      expect(screen.getByText(/Error: Invalid input/)).toBeInTheDocument();
    });
  });

  it('handles invalid API response data', async () => {
    const invalidAnalysis = {
      ...mockAnalysis,
      riskScore: 'invalid', // Should be a number
    };
    (portugueseMarketService.getAIAnalysis as jest.Mock).mockResolvedValueOnce(invalidAnalysis);

    render(<AIAnalysis assetId={mockAssetId} />);

    await waitFor(() => {
      expect(screen.getByText(/Error: Invalid response data format/)).toBeInTheDocument();
    });
  });

  it('handles missing required fields in API response', async () => {
    const incompleteAnalysis = {
      riskScore: 45,
      recommendations: [],
      marketInsights: {
        trend: 'positive',
        confidence: 0.85,
        factors: [],
      },
      // Missing complianceScore and issues
    };
    (portugueseMarketService.getAIAnalysis as jest.Mock).mockResolvedValueOnce(incompleteAnalysis);

    render(<AIAnalysis assetId={mockAssetId} />);

    await waitFor(() => {
      expect(screen.getByText(/Error: Invalid response data format/)).toBeInTheDocument();
    });
  });
}); 