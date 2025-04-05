import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AIAnalysisDisplay } from '../AIAnalysisDisplay';
import { AIAnalysisService } from '../../services/aiAnalysis';
import { Asset, AssetValuation, MatchScore, DueDiligenceReport } from '../../types/asset';

// Mock the AIAnalysisService
jest.mock('../../services/aiAnalysis');

const mockAsset: Asset = {
  id: '1',
  name: 'Test Asset',
  type: 'real_estate',
  description: 'Test Description',
  price: 1000000,
  location: 'Test Location',
  specifications: {},
  images: [],
  documents: [],
  createdAt: '2024-01-01',
  updatedAt: '2024-01-01',
  owner: {
    id: '1',
    name: 'Test Owner',
    email: 'test@example.com',
  },
  status: 'available',
};

const mockValuation: AssetValuation = {
  currentValue: 1000000,
  predictedValue: 1100000,
  confidence: 0.85,
  factors: [
    {
      name: 'Market Trend',
      impact: 0.7,
      explanation: 'Positive market trend',
    },
  ],
  marketTrends: [
    {
      price: 1000000,
      timestamp: '2024-01-01',
      confidence: 0.9,
    },
  ],
  recommendations: [
    {
      action: 'Hold',
      reason: 'Strong market position',
      priority: 'high',
    },
  ],
};

const mockMatchScore: MatchScore = {
  score: 0.85,
  confidence: 0.9,
  factors: [
    {
      name: 'Price Match',
      score: 0.8,
      explanation: 'Price within range',
    },
  ],
  recommendations: [
    {
      action: 'Consider',
      reason: 'Good match',
      priority: 'high',
    },
  ],
  similarAssets: [
    {
      asset: mockAsset,
      similarity: 0.8,
      keyDifferences: ['Location'],
    },
  ],
};

const mockDueDiligenceReport: DueDiligenceReport = {
  riskScore: 0.2,
  complianceScore: 0.9,
  financialHealth: {
    score: 0.85,
    metrics: {},
    analysis: 'Strong financial position',
  },
  legalStatus: {
    score: 0.9,
    issues: [
      {
        type: 'Compliance',
        severity: 'low',
        description: 'Minor compliance issue',
        recommendation: 'Update documentation',
      },
    ],
  },
  marketPosition: {
    score: 0.8,
    analysis: 'Strong market position',
    competitors: [
      {
        name: 'Competitor 1',
        marketShare: 0.3,
        strengths: ['Brand'],
        weaknesses: ['Price'],
      },
    ],
  },
  recommendations: [
    {
      action: 'Proceed',
      reason: 'Low risk',
      priority: 'high',
      timeline: 'Immediate',
    },
  ],
  documents: [
    {
      type: 'Financial',
      status: 'verified',
      issues: [],
      recommendations: [],
    },
  ],
};

describe('AIAnalysisDisplay', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders loading state initially', () => {
    render(<AIAnalysisDisplay asset={mockAsset} type="valuation" />);
    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('renders error state when API call fails', async () => {
    const mockError = new Error('API Error');
    (AIAnalysisService.getInstance as jest.Mock).mockImplementation(() => ({
      getPredictiveValuation: jest.fn().mockRejectedValue(mockError),
    }));

    render(<AIAnalysisDisplay asset={mockAsset} type="valuation" />);

    await waitFor(() => {
      expect(screen.getByText('API Error')).toBeInTheDocument();
    });
  });

  it('renders valuation analysis correctly', async () => {
    (AIAnalysisService.getInstance as jest.Mock).mockImplementation(() => ({
      getPredictiveValuation: jest.fn().mockResolvedValue(mockValuation),
    }));

    render(<AIAnalysisDisplay asset={mockAsset} type="valuation" />);

    await waitFor(() => {
      expect(screen.getByText('Current Value')).toBeInTheDocument();
      expect(screen.getByText('Predicted Value')).toBeInTheDocument();
      expect(screen.getByText('Key Factors')).toBeInTheDocument();
    });
  });

  it('renders matching analysis correctly', async () => {
    const buyerPreferences = { priceRange: { min: 900000, max: 1200000 } };
    (AIAnalysisService.getInstance as jest.Mock).mockImplementation(() => ({
      getMatchingScore: jest.fn().mockResolvedValue(mockMatchScore),
    }));

    render(
      <AIAnalysisDisplay
        asset={mockAsset}
        type="matching"
        buyerPreferences={buyerPreferences}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('Match Score')).toBeInTheDocument();
      expect(screen.getByText('Similar Assets')).toBeInTheDocument();
    });
  });

  it('renders due diligence report correctly', async () => {
    const mockDocuments = [new File([], 'test.pdf')];
    (AIAnalysisService.getInstance as jest.Mock).mockImplementation(() => ({
      getDueDiligenceReport: jest.fn().mockResolvedValue(mockDueDiligenceReport),
    }));

    render(
      <AIAnalysisDisplay
        asset={mockAsset}
        type="dueDiligence"
        documents={mockDocuments}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('Risk Score')).toBeInTheDocument();
      expect(screen.getByText('Compliance Score')).toBeInTheDocument();
      expect(screen.getByText('Financial Health')).toBeInTheDocument();
    });
  });

  it('switches between tabs correctly', async () => {
    (AIAnalysisService.getInstance as jest.Mock).mockImplementation(() => ({
      getPredictiveValuation: jest.fn().mockResolvedValue(mockValuation),
    }));

    render(<AIAnalysisDisplay asset={mockAsset} type="valuation" />);

    await waitFor(() => {
      expect(screen.getByText('Overview')).toBeInTheDocument();
    });

    await userEvent.click(screen.getByText('Details'));
    expect(screen.getByText('Detailed Factors')).toBeInTheDocument();

    await userEvent.click(screen.getByText('Recommendations'));
    expect(screen.getByText('Hold')).toBeInTheDocument();
  });

  it('handles missing buyer preferences for matching analysis', async () => {
    (AIAnalysisService.getInstance as jest.Mock).mockImplementation(() => ({
      getMatchingScore: jest.fn().mockResolvedValue(mockMatchScore),
    }));

    render(<AIAnalysisDisplay asset={mockAsset} type="matching" />);

    await waitFor(() => {
      expect(screen.getByText('Buyer preferences required for matching')).toBeInTheDocument();
    });
  });

  it('handles missing documents for due diligence', async () => {
    (AIAnalysisService.getInstance as jest.Mock).mockImplementation(() => ({
      getDueDiligenceReport: jest.fn().mockResolvedValue(mockDueDiligenceReport),
    }));

    render(<AIAnalysisDisplay asset={mockAsset} type="dueDiligence" />);

    await waitFor(() => {
      expect(screen.getByText('Documents required for due diligence')).toBeInTheDocument();
    });
  });
}); 