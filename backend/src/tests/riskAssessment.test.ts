import { RiskAssessmentService } from '../services/riskAssessment';
import { PropertyData } from '../types/analysis';

describe('RiskAssessmentService', () => {
  const mockPropertyData: PropertyData = {
    location: {
      address: '123 Main St',
      coordinates: {
        latitude: 40.7128,
        longitude: -74.0060
      },
      crimeRate: 0.7,
      proximityToAmenities: 0.8,
      floodRisk: 0.3,
      schoolQuality: 0.9,
      transportation: 0.8
    },
    propertyCondition: {
      age: 10,
      structuralIntegrity: 0.9,
      maintenanceHistory: 0.8,
      energyEfficiency: 0.7,
      safetyFeatures: 0.9
    },
    financial: {
      marketValue: 500000,
      rentalIncome: 3000,
      operatingExpenses: 1500,
      debtRatio: 0.6,
      cashFlow: 1500
    },
    marketData: {
      priceHistory: [450000, 460000, 470000, 480000, 500000],
      demandSupplyRatio: 1.2,
      economicIndicators: {
        gdpGrowth: 2.5,
        unemploymentRate: 4.5,
        inflationRate: 2.0,
        interestRate: 3.5
      }
    },
    compliance: {
      buildingCodes: [
        { code: 'BC-001', status: 'compliant' },
        { code: 'BC-002', status: 'compliant' }
      ],
      safetyRegulations: [
        { regulation: 'SR-001', status: 'compliant' },
        { regulation: 'SR-002', status: 'compliant' }
      ],
      certifications: ['LEED', 'Energy Star']
    }
  };

  describe('calculateRiskScore', () => {
    it('calculates overall risk score correctly', () => {
      const result = RiskAssessmentService.calculateRiskScore(mockPropertyData);
      
      expect(result.score).toBeGreaterThanOrEqual(0);
      expect(result.score).toBeLessThanOrEqual(100);
      expect(['low', 'medium', 'high']).toContain(result.level);
      expect(result.factors).toHaveProperty('location');
      expect(result.factors).toHaveProperty('propertyCondition');
      expect(result.factors).toHaveProperty('financial');
      expect(result.marketTrend).toBeDefined();
      expect(result.complianceScore).toBeDefined();
      expect(Array.isArray(result.recommendations)).toBe(true);
    });

    it('handles different risk levels', () => {
      const lowRiskData = { ...mockPropertyData };
      lowRiskData.location.crimeRate = 0.2;
      lowRiskData.propertyCondition.structuralIntegrity = 0.9;
      lowRiskData.financial.debtRatio = 0.3;

      const highRiskData = { ...mockPropertyData };
      highRiskData.location.crimeRate = 0.9;
      highRiskData.propertyCondition.structuralIntegrity = 0.4;
      highRiskData.financial.debtRatio = 0.8;

      const lowRiskResult = RiskAssessmentService.calculateRiskScore(lowRiskData);
      const highRiskResult = RiskAssessmentService.calculateRiskScore(highRiskData);

      expect(lowRiskResult.level).toBe('low');
      expect(highRiskResult.level).toBe('high');
    });
  });

  describe('calculateLocationRisk', () => {
    it('calculates location risk score correctly', () => {
      const score = RiskAssessmentService['calculateLocationRisk'](mockPropertyData.location);
      
      expect(score).toBeGreaterThanOrEqual(0);
      expect(score).toBeLessThanOrEqual(100);
    });

    it('considers all location factors', () => {
      const score = RiskAssessmentService['calculateLocationRisk'](mockPropertyData.location);
      const expectedScore = Math.round(
        (mockPropertyData.location.crimeRate * 0.3 +
        mockPropertyData.location.proximityToAmenities * 0.2 +
        (100 - mockPropertyData.location.floodRisk) * 0.2 +
        mockPropertyData.location.schoolQuality * 0.15 +
        mockPropertyData.location.transportation * 0.15) * 100
      );

      expect(score).toBe(expectedScore);
    });
  });

  describe('calculatePropertyConditionRisk', () => {
    it('calculates property condition risk score correctly', () => {
      const score = RiskAssessmentService['calculatePropertyConditionRisk'](mockPropertyData.propertyCondition);
      
      expect(score).toBeGreaterThanOrEqual(0);
      expect(score).toBeLessThanOrEqual(100);
    });

    it('adjusts score based on property age', () => {
      const oldProperty = { ...mockPropertyData.propertyCondition, age: 50 };
      const score = RiskAssessmentService['calculatePropertyConditionRisk'](oldProperty);
      
      expect(score).toBeLessThan(RiskAssessmentService['calculatePropertyConditionRisk'](mockPropertyData.propertyCondition));
    });
  });

  describe('calculateFinancialRisk', () => {
    it('calculates financial risk score correctly', () => {
      const score = RiskAssessmentService['calculateFinancialRisk'](mockPropertyData.financial);
      
      expect(score).toBeGreaterThanOrEqual(0);
      expect(score).toBeLessThanOrEqual(100);
    });

    it('handles negative cash flow', () => {
      const negativeCashFlow = { ...mockPropertyData.financial, cashFlow: -500 };
      const score = RiskAssessmentService['calculateFinancialRisk'](negativeCashFlow);
      
      expect(score).toBeLessThan(RiskAssessmentService['calculateFinancialRisk'](mockPropertyData.financial));
    });
  });

  describe('analyzeMarketTrends', () => {
    it('analyzes market trends correctly', () => {
      const result = RiskAssessmentService['analyzeMarketTrends'](mockPropertyData.marketData);
      
      expect(result.score).toBeGreaterThanOrEqual(0);
      expect(result.score).toBeLessThanOrEqual(100);
      expect(['up', 'down', 'stable']).toContain(result.direction);
      expect(result.confidence).toBeGreaterThanOrEqual(0);
      expect(result.confidence).toBeLessThanOrEqual(1);
    });

    it('detects price trends', () => {
      const risingPrices = { ...mockPropertyData.marketData, priceHistory: [400000, 450000, 500000] };
      const fallingPrices = { ...mockPropertyData.marketData, priceHistory: [500000, 450000, 400000] };
      
      expect(RiskAssessmentService['analyzeMarketTrends'](risingPrices).direction).toBe('up');
      expect(RiskAssessmentService['analyzeMarketTrends'](fallingPrices).direction).toBe('down');
    });
  });

  describe('calculateComplianceScore', () => {
    it('calculates compliance score correctly', () => {
      const result = RiskAssessmentService['calculateComplianceScore'](mockPropertyData.compliance);
      
      expect(result.score).toBeGreaterThanOrEqual(0);
      expect(result.score).toBeLessThanOrEqual(100);
      expect(['compliant', 'non-compliant']).toContain(result.status);
      expect(Array.isArray(result.issues)).toBe(true);
      expect(Array.isArray(result.requiredActions)).toBe(true);
    });

    it('identifies compliance issues', () => {
      const nonCompliantData = {
        ...mockPropertyData.compliance,
        buildingCodes: [{ code: 'BC-001', status: 'non-compliant' }]
      };
      
      const result = RiskAssessmentService['calculateComplianceScore'](nonCompliantData);
      expect(result.issues.length).toBeGreaterThan(0);
    });
  });

  describe('generateRecommendations', () => {
    it('generates appropriate recommendations', () => {
      const riskScore = RiskAssessmentService.calculateRiskScore(mockPropertyData);
      const recommendations = riskScore.recommendations;
      
      expect(Array.isArray(recommendations)).toBe(true);
      recommendations.forEach(rec => {
        expect(rec).toHaveProperty('type');
        expect(rec).toHaveProperty('priority');
        expect(rec).toHaveProperty('description');
        expect(rec).toHaveProperty('rationale');
        expect(rec).toHaveProperty('estimatedCost');
        expect(rec).toHaveProperty('expectedROI');
        expect(rec).toHaveProperty('timeline');
      });
    });

    it('generates risk mitigation recommendations for high risk', () => {
      const highRiskData = { ...mockPropertyData };
      highRiskData.location.crimeRate = 0.9;
      highRiskData.propertyCondition.structuralIntegrity = 0.4;
      
      const result = RiskAssessmentService.calculateRiskScore(highRiskData);
      const riskMitigationRecs = result.recommendations.filter(r => r.type === 'risk-mitigation');
      
      expect(riskMitigationRecs.length).toBeGreaterThan(0);
    });
  });
}); 