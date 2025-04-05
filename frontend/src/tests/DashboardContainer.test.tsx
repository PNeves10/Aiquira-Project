import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import DashboardContainer from '../containers/DashboardContainer';
import { fetchAnalysisData } from '../services/analysisService';

// Mock the analysis service
jest.mock('../services/analysisService');

describe('DashboardContainer', () => {
  const mockAnalysisData = {
    riskScore: {
      score: 75,
      level: 'medium',
      factors: {
        location: 80,
        propertyCondition: 70,
        financial: 60
      }
    },
    marketTrend: {
      score: 80,
      direction: 'up',
      confidence: 0.8,
      factors: {
        priceTrend: 'up',
        demandSupplyRatio: 1.2,
        economicIndicators: {
          gdpGrowth: 2.5,
          unemploymentRate: 4.5,
          inflationRate: 2.0,
          interestRate: 3.5
        }
      }
    },
    issues: [
      {
        id: '1',
        type: 'structural',
        severity: 'high',
        description: 'Foundation cracks',
        impact: 'Structural integrity compromised',
        resolution: 'Professional inspection required',
        estimatedCost: 5000,
        priority: 'high',
        status: 'open',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ],
    recommendations: [
      {
        id: '1',
        type: 'maintenance',
        priority: 'high',
        description: 'Immediate foundation repair',
        rationale: 'Prevent further structural damage',
        estimatedCost: 5000,
        expectedROI: 10000,
        timeline: '1 month',
        status: 'pending',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ]
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('shows loading state initially', () => {
    (fetchAnalysisData as jest.Mock).mockImplementation(() => new Promise(() => {}));
    
    render(<DashboardContainer />);
    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
  });

  it('displays dashboard data when loaded successfully', async () => {
    (fetchAnalysisData as jest.Mock).mockResolvedValue(mockAnalysisData);
    
    render(<DashboardContainer />);
    
    await waitFor(() => {
      expect(screen.getByText('75%')).toBeInTheDocument();
      expect(screen.getByText('medium')).toBeInTheDocument();
      expect(screen.getByText('Foundation cracks')).toBeInTheDocument();
      expect(screen.getByText('Immediate foundation repair')).toBeInTheDocument();
    });
  });

  it('shows error message when data fetch fails', async () => {
    (fetchAnalysisData as jest.Mock).mockRejectedValue(new Error('Failed to fetch data'));
    
    render(<DashboardContainer />);
    
    await waitFor(() => {
      expect(screen.getByText('Unable to load dashboard data')).toBeInTheDocument();
      expect(screen.getByText('Please try refreshing the page or contact support if the problem persists.')).toBeInTheDocument();
    });
  });

  it('handles missing data gracefully', async () => {
    (fetchAnalysisData as jest.Mock).mockResolvedValue({
      ...mockAnalysisData,
      riskScore: null,
      marketTrend: null
    });
    
    render(<DashboardContainer />);
    
    await waitFor(() => {
      expect(screen.getByText('Unable to load dashboard data')).toBeInTheDocument();
    });
  });

  it('retries data fetch on error', async () => {
    const mockFetch = jest.fn()
      .mockRejectedValueOnce(new Error('First attempt failed'))
      .mockResolvedValueOnce(mockAnalysisData);
    
    (fetchAnalysisData as jest.Mock).mockImplementation(mockFetch);
    
    render(<DashboardContainer />);
    
    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledTimes(2);
      expect(screen.getByText('75%')).toBeInTheDocument();
    });
  });

  it('handles network errors gracefully', async () => {
    (fetchAnalysisData as jest.Mock).mockRejectedValue({
      message: 'Network Error',
      status: 500
    });
    
    render(<DashboardContainer />);
    
    await waitFor(() => {
      expect(screen.getByText('Unable to load dashboard data')).toBeInTheDocument();
    });
  });

  it('handles invalid data format', async () => {
    (fetchAnalysisData as jest.Mock).mockResolvedValue({
      invalid: 'data'
    });
    
    render(<DashboardContainer />);
    
    await waitFor(() => {
      expect(screen.getByText('Unable to load dashboard data')).toBeInTheDocument();
    });
  });
}); 