import { PropertyData, RiskScore, MarketTrend, ComplianceScore, Issue, Recommendation } from '../types/analysis';

describe('Types', () => {
  describe('PropertyData', () => {
    it('should have required properties', () => {
      const propertyData: PropertyData = {
        location: {
          address: '123 Main St',
          coordinates: {
            latitude: 40.7128,
            longitude: -74.0060
          }
        },
        propertyCondition: {
          age: 10,
          maintenanceHistory: []
        },
        financial: {
          marketValue: 500000,
          rentalIncome: 3000
        }
      };

      expect(propertyData).toHaveProperty('location');
      expect(propertyData).toHaveProperty('propertyCondition');
      expect(propertyData).toHaveProperty('financial');
    });
  });

  describe('RiskScore', () => {
    it('should have required properties', () => {
      const riskScore: RiskScore = {
        score: 75,
        level: 'medium',
        factors: {
          location: 80,
          propertyCondition: 70,
          financial: 60
        }
      };

      expect(riskScore).toHaveProperty('score');
      expect(riskScore).toHaveProperty('level');
      expect(riskScore).toHaveProperty('factors');
    });
  });

  describe('MarketTrend', () => {
    it('should have required properties', () => {
      const marketTrend: MarketTrend = {
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
      };

      expect(marketTrend).toHaveProperty('score');
      expect(marketTrend).toHaveProperty('direction');
      expect(marketTrend).toHaveProperty('confidence');
      expect(marketTrend).toHaveProperty('factors');
    });
  });

  describe('ComplianceScore', () => {
    it('should have required properties', () => {
      const complianceScore: ComplianceScore = {
        score: 90,
        status: 'compliant',
        issues: [],
        requiredActions: []
      };

      expect(complianceScore).toHaveProperty('score');
      expect(complianceScore).toHaveProperty('status');
      expect(complianceScore).toHaveProperty('issues');
      expect(complianceScore).toHaveProperty('requiredActions');
    });
  });

  describe('Issue', () => {
    it('should have required properties', () => {
      const issue: Issue = {
        id: '1',
        type: 'structural',
        severity: 'high',
        description: 'Test issue',
        impact: 'Test impact',
        resolution: 'Test resolution',
        estimatedCost: 1000,
        priority: 'high',
        status: 'open',
        createdAt: new Date(),
        updatedAt: new Date()
      };

      expect(issue).toHaveProperty('id');
      expect(issue).toHaveProperty('type');
      expect(issue).toHaveProperty('severity');
      expect(issue).toHaveProperty('description');
      expect(issue).toHaveProperty('impact');
      expect(issue).toHaveProperty('resolution');
      expect(issue).toHaveProperty('estimatedCost');
      expect(issue).toHaveProperty('priority');
      expect(issue).toHaveProperty('status');
      expect(issue).toHaveProperty('createdAt');
      expect(issue).toHaveProperty('updatedAt');
    });
  });

  describe('Recommendation', () => {
    it('should have required properties', () => {
      const recommendation: Recommendation = {
        id: '1',
        type: 'maintenance',
        priority: 'high',
        description: 'Test recommendation',
        rationale: 'Test rationale',
        estimatedCost: 1000,
        expectedROI: 2000,
        timeline: '1 month',
        status: 'pending',
        createdAt: new Date(),
        updatedAt: new Date()
      };

      expect(recommendation).toHaveProperty('id');
      expect(recommendation).toHaveProperty('type');
      expect(recommendation).toHaveProperty('priority');
      expect(recommendation).toHaveProperty('description');
      expect(recommendation).toHaveProperty('rationale');
      expect(recommendation).toHaveProperty('estimatedCost');
      expect(recommendation).toHaveProperty('expectedROI');
      expect(recommendation).toHaveProperty('timeline');
      expect(recommendation).toHaveProperty('status');
      expect(recommendation).toHaveProperty('createdAt');
      expect(recommendation).toHaveProperty('updatedAt');
    });
  });
}); 