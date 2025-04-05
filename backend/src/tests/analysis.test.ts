import { AnalysisService } from '../services/analysis';
import { PropertyData } from '../types/analysis';

describe('AnalysisService', () => {
  const mockPropertyData: PropertyData = {
    location: {
      address: '123 Main St',
      coordinates: {
        latitude: 40.7128,
        longitude: -74.0060
      },
      neighborhood: 'Downtown',
      city: 'New York',
      state: 'NY',
      zipCode: '10001',
      country: 'USA'
    },
    propertyCondition: {
      age: 10,
      maintenanceHistory: [
        {
          date: new Date('2020-01-01'),
          description: 'Roof repair',
          cost: 5000
        }
      ],
      lastInspection: new Date('2021-01-01'),
      structuralIssues: [],
      maintenanceScore: 85
    },
    financial: {
      marketValue: 500000,
      rentalIncome: 3000,
      expenses: 1000,
      mortgage: {
        principal: 400000,
        interestRate: 3.5,
        term: 30,
        monthlyPayment: 1796
      }
    },
    marketData: {
      averagePrice: 550000,
      priceTrend: 'up',
      demandSupplyRatio: 1.2,
      economicIndicators: {
        gdpGrowth: 2.5,
        unemploymentRate: 4.5,
        inflationRate: 2.0,
        interestRate: 3.5
      }
    },
    compliance: {
      permits: [
        {
          type: 'building',
          number: '12345',
          issueDate: new Date('2010-01-01'),
          expiryDate: new Date('2030-01-01')
        }
      ],
      inspections: [
        {
          type: 'safety',
          date: new Date('2021-01-01'),
          passed: true
        }
      ],
      violations: []
    }
  };

  describe('analyzeProperty', () => {
    it('should return a complete analysis', () => {
      const analysis = AnalysisService.analyzeProperty(mockPropertyData);

      expect(analysis).toHaveProperty('riskScore');
      expect(analysis).toHaveProperty('issues');
      expect(analysis).toHaveProperty('recommendations');
    });

    it('should calculate risk score correctly', () => {
      const analysis = AnalysisService.analyzeProperty(mockPropertyData);

      expect(analysis.riskScore.score).toBeGreaterThanOrEqual(0);
      expect(analysis.riskScore.score).toBeLessThanOrEqual(100);
      expect(['low', 'medium', 'high']).toContain(analysis.riskScore.level);
    });

    it('should identify issues', () => {
      const analysis = AnalysisService.analyzeProperty(mockPropertyData);

      expect(Array.isArray(analysis.issues)).toBe(true);
      analysis.issues.forEach(issue => {
        expect(issue).toHaveProperty('type');
        expect(issue).toHaveProperty('severity');
        expect(issue).toHaveProperty('description');
      });
    });

    it('should generate recommendations', () => {
      const analysis = AnalysisService.analyzeProperty(mockPropertyData);

      expect(Array.isArray(analysis.recommendations)).toBe(true);
      analysis.recommendations.forEach(recommendation => {
        expect(recommendation).toHaveProperty('type');
        expect(recommendation).toHaveProperty('priority');
        expect(recommendation).toHaveProperty('description');
      });
    });
  });

  describe('identifyIssues', () => {
    it('should return an array of issues', () => {
      const issues = AnalysisService.identifyIssues(mockPropertyData);

      expect(Array.isArray(issues)).toBe(true);
      issues.forEach(issue => {
        expect(issue).toHaveProperty('type');
        expect(issue).toHaveProperty('severity');
        expect(issue).toHaveProperty('description');
      });
    });
  });

  describe('generateRecommendations', () => {
    it('should return an array of recommendations', () => {
      const recommendations = AnalysisService.generateRecommendations(mockPropertyData);

      expect(Array.isArray(recommendations)).toBe(true);
      recommendations.forEach(recommendation => {
        expect(recommendation).toHaveProperty('type');
        expect(recommendation).toHaveProperty('priority');
        expect(recommendation).toHaveProperty('description');
      });
    });
  });

  describe('determineSeverity', () => {
    it('should return severity based on score', () => {
      expect(AnalysisService.determineSeverity(10)).toBe('low');
      expect(AnalysisService.determineSeverity(40)).toBe('medium');
      expect(AnalysisService.determineSeverity(70)).toBe('high');
    });
  });

  describe('estimateRepairCost', () => {
    it('should return a cost estimate', () => {
      const cost = AnalysisService.estimateRepairCost(5);

      expect(typeof cost).toBe('number');
      expect(cost).toBeGreaterThan(0);
    });
  });
}); 