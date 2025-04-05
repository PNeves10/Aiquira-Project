import { AIAnalysisService } from '../aiAnalysis';
import { Asset, AssetValuation, MatchScore, DueDiligenceReport } from '../../types/asset';

// Mock fetch
global.fetch = jest.fn();

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

describe('AIAnalysisService', () => {
  let service: AIAnalysisService;

  beforeEach(() => {
    service = AIAnalysisService.getInstance();
    (global.fetch as jest.Mock).mockClear();
  });

  it('should be a singleton', () => {
    const instance1 = AIAnalysisService.getInstance();
    const instance2 = AIAnalysisService.getInstance();
    expect(instance1).toBe(instance2);
  });

  describe('getPredictiveValuation', () => {
    it('should fetch and return valuation data', async () => {
      const mockResponse = { ok: true, json: () => Promise.resolve(mockValuation) };
      (global.fetch as jest.Mock).mockResolvedValueOnce(mockResponse);

      const result = await service.getPredictiveValuation({ asset: mockAsset });

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/ai/valuation'),
        expect.objectContaining({
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: expect.any(String),
        })
      );
      expect(result).toEqual(mockValuation);
    });

    it('should handle API errors', async () => {
      const mockResponse = { ok: false };
      (global.fetch as jest.Mock).mockResolvedValueOnce(mockResponse);

      await expect(service.getPredictiveValuation({ asset: mockAsset })).rejects.toThrow(
        'Failed to fetch predictive valuation'
      );
    });
  });

  describe('getMatchingScore', () => {
    it('should fetch and return matching score', async () => {
      const mockResponse = { ok: true, json: () => Promise.resolve(mockMatchScore) };
      (global.fetch as jest.Mock).mockResolvedValueOnce(mockResponse);

      const buyerPreferences = { priceRange: { min: 900000, max: 1200000 } };
      const result = await service.getMatchingScore({
        asset: mockAsset,
        buyerPreferences,
      });

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/ai/matching'),
        expect.objectContaining({
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: expect.any(String),
        })
      );
      expect(result).toEqual(mockMatchScore);
    });

    it('should handle API errors', async () => {
      const mockResponse = { ok: false };
      (global.fetch as jest.Mock).mockResolvedValueOnce(mockResponse);

      const buyerPreferences = { priceRange: { min: 900000, max: 1200000 } };
      await expect(
        service.getMatchingScore({
          asset: mockAsset,
          buyerPreferences,
        })
      ).rejects.toThrow('Failed to fetch matching score');
    });
  });

  describe('getDueDiligenceReport', () => {
    it('should fetch and return due diligence report', async () => {
      const mockResponse = { ok: true, json: () => Promise.resolve(mockDueDiligenceReport) };
      (global.fetch as jest.Mock).mockResolvedValueOnce(mockResponse);

      const mockDocuments = [new File([], 'test.pdf')];
      const result = await service.getDueDiligenceReport({
        asset: mockAsset,
        documents: mockDocuments,
      });

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/ai/due-diligence'),
        expect.objectContaining({
          method: 'POST',
          body: expect.any(FormData),
        })
      );
      expect(result).toEqual(mockDueDiligenceReport);
    });

    it('should handle API errors', async () => {
      const mockResponse = { ok: false };
      (global.fetch as jest.Mock).mockResolvedValueOnce(mockResponse);

      const mockDocuments = [new File([], 'test.pdf')];
      await expect(
        service.getDueDiligenceReport({
          asset: mockAsset,
          documents: mockDocuments,
        })
      ).rejects.toThrow('Failed to fetch due diligence report');
    });

    it('should include additional context in FormData when provided', async () => {
      const mockResponse = { ok: true, json: () => Promise.resolve(mockDueDiligenceReport) };
      (global.fetch as jest.Mock).mockResolvedValueOnce(mockResponse);

      const mockDocuments = [new File([], 'test.pdf')];
      const additionalContext = { market: 'residential', region: 'north' };
      await service.getDueDiligenceReport({
        asset: mockAsset,
        documents: mockDocuments,
        additionalContext,
      });

      const formData = (global.fetch as jest.Mock).mock.calls[0][1].body;
      expect(formData.get('additionalContext')).toBe(JSON.stringify(additionalContext));
    });
  });
}); 