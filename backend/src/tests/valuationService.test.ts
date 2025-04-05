import axios from 'axios';
import { ValuationService } from '../services/valuationService';
import { ValuationResult } from '../types/analysis';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('ValuationService', () => {
  const mockGoogleAnalyticsId = 'GA-123456';
  const mockSemrushApiKey = 'SEMRUSH-123456';
  const mockDomain = 'example.com';

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('calculateWebsiteValuation', () => {
    it('calculates valuation correctly with valid data', async () => {
      // Mock Google Analytics response
      mockedAxios.get.mockImplementationOnce(() => Promise.resolve({
        data: {
          rows: [{
            metricValues: [
              { value: '10000' }, // monthlyVisitors
              { value: '50000' }, // pageViews
              { value: '180' },   // averageTimeOnSite
              { value: '45' },    // bounceRate
              { value: '2.5' }    // conversionRate
            ]
          }]
        }
      }));

      // Mock SEMrush response
      mockedAxios.get.mockImplementationOnce(() => Promise.resolve({
        data: {
          authority: 45,
          backlinks: 1000,
          keywords: 500,
          ranking_keywords: 200,
          competition_level: 60,
          competitors: ['competitor1.com', 'competitor2.com']
        }
      }));

      const result = await ValuationService.calculateWebsiteValuation(
        mockGoogleAnalyticsId,
        mockSemrushApiKey,
        mockDomain
      );

      expect(result).toBeDefined();
      expect(result.domain).toBe(mockDomain);
      expect(result.valuation).toBeGreaterThan(0);
      expect(result.confidence).toBeGreaterThan(0);
      expect(result.recommendations.length).toBeGreaterThan(0);
    });

    it('handles API errors gracefully', async () => {
      mockedAxios.get.mockRejectedValueOnce(new Error('API Error'));

      await expect(
        ValuationService.calculateWebsiteValuation(
          mockGoogleAnalyticsId,
          mockSemrushApiKey,
          mockDomain
        )
      ).rejects.toThrow('Failed to calculate website valuation');
    });
  });

  describe('calculateValuation', () => {
    it('calculates valuation based on traffic', () => {
      const metrics = {
        traffic: {
          monthlyVisitors: 10000,
          pageViews: 50000,
          averageTimeOnSite: 180,
          bounceRate: 45
        },
        seo: {
          domainAuthority: 45,
          backlinks: 1000,
          organicKeywords: 500,
          rankingKeywords: 200
        },
        conversions: {
          rate: 2.5,
          value: 50000
        },
        competition: {
          score: 60,
          topCompetitors: ['competitor1.com', 'competitor2.com']
        }
      };

      const valuation = ValuationService['calculateValuation'](metrics);
      expect(valuation).toBeGreaterThan(0);
    });

    it('adjusts valuation based on competition', () => {
      const highCompetitionMetrics = {
        traffic: {
          monthlyVisitors: 10000,
          pageViews: 50000,
          averageTimeOnSite: 180,
          bounceRate: 45
        },
        seo: {
          domainAuthority: 45,
          backlinks: 1000,
          organicKeywords: 500,
          rankingKeywords: 200
        },
        conversions: {
          rate: 2.5,
          value: 50000
        },
        competition: {
          score: 90,
          topCompetitors: ['competitor1.com', 'competitor2.com']
        }
      };

      const lowCompetitionMetrics = {
        ...highCompetitionMetrics,
        competition: {
          ...highCompetitionMetrics.competition,
          score: 30
        }
      };

      const highCompetitionValuation = ValuationService['calculateValuation'](highCompetitionMetrics);
      const lowCompetitionValuation = ValuationService['calculateValuation'](lowCompetitionMetrics);

      expect(highCompetitionValuation).toBeLessThan(lowCompetitionValuation);
    });
  });

  describe('calculateConfidence', () => {
    it('calculates confidence based on data completeness', () => {
      const completeMetrics = {
        traffic: {
          monthlyVisitors: 10000,
          pageViews: 50000,
          averageTimeOnSite: 180,
          bounceRate: 45
        },
        seo: {
          domainAuthority: 45,
          backlinks: 1000,
          organicKeywords: 500,
          rankingKeywords: 200
        },
        conversions: {
          rate: 2.5,
          value: 50000
        },
        competition: {
          score: 60,
          topCompetitors: ['competitor1.com', 'competitor2.com']
        }
      };

      const incompleteMetrics = {
        ...completeMetrics,
        traffic: {
          ...completeMetrics.traffic,
          monthlyVisitors: 0
        }
      };

      const completeConfidence = ValuationService['calculateConfidence'](completeMetrics);
      const incompleteConfidence = ValuationService['calculateConfidence'](incompleteMetrics);

      expect(completeConfidence).toBe(100);
      expect(incompleteConfidence).toBeLessThan(100);
    });
  });

  describe('generateRecommendations', () => {
    it('generates recommendations based on metrics', () => {
      const metrics = {
        traffic: {
          monthlyVisitors: 500,
          pageViews: 2500,
          averageTimeOnSite: 180,
          bounceRate: 45
        },
        seo: {
          domainAuthority: 25,
          backlinks: 1000,
          organicKeywords: 500,
          rankingKeywords: 200
        },
        conversions: {
          rate: 1.5,
          value: 50000
        },
        competition: {
          score: 80,
          topCompetitors: ['competitor1.com', 'competitor2.com']
        }
      };

      const recommendations = ValuationService['generateRecommendations'](metrics);
      expect(recommendations.length).toBeGreaterThan(0);
      expect(recommendations).toContain('Consider increasing marketing efforts to drive more traffic');
      expect(recommendations).toContain('Focus on building high-quality backlinks to improve domain authority');
      expect(recommendations).toContain('Optimize landing pages to improve conversion rates');
      expect(recommendations).toContain('Develop unique value propositions to stand out from competitors');
    });
  });
}); 