import { PropertyData, RiskScore, MarketTrend, ComplianceScore, Issue, Recommendation } from '../types/analysis';

export class RiskAssessmentService {
  private static readonly WEIGHTS = {
    location: 0.3,
    propertyCondition: 0.3,
    financial: 0.2,
    marketTrend: 0.1,
    compliance: 0.1
  };

  private static readonly THRESHOLDS = {
    low: 30,
    medium: 70
  };

  static calculateRiskScore(propertyData: PropertyData): RiskScore {
    const locationScore = this.calculateLocationRisk(propertyData.location);
    const propertyScore = this.calculatePropertyConditionRisk(propertyData.propertyCondition);
    const financialScore = this.calculateFinancialRisk(propertyData.financial);
    const marketTrend = this.analyzeMarketTrends(propertyData.marketData);
    const complianceScore = this.calculateComplianceScore(propertyData.compliance);

    const weightedScore = 
      locationScore * this.WEIGHTS.location +
      propertyScore * this.WEIGHTS.propertyCondition +
      financialScore * this.WEIGHTS.financial +
      marketTrend.score * this.WEIGHTS.marketTrend +
      complianceScore.score * this.WEIGHTS.compliance;

    const level = this.determineRiskLevel(weightedScore);

    return {
      score: Math.round(weightedScore),
      level,
      factors: {
        location: locationScore,
        propertyCondition: propertyScore,
        financial: financialScore
      },
      marketTrend,
      complianceScore,
      recommendations: this.generateRecommendations(
        propertyData,
        weightedScore,
        level,
        marketTrend,
        complianceScore
      )
    };
  }

  private static calculateLocationRisk(location: PropertyData['location']): number {
    const factors = {
      crimeRate: 0.3,
      proximityToAmenities: 0.2,
      floodRisk: 0.2,
      schoolQuality: 0.15,
      transportation: 0.15
    };

    return Math.round(
      (location.crimeRate * factors.crimeRate +
      location.proximityToAmenities * factors.proximityToAmenities +
      (100 - location.floodRisk) * factors.floodRisk +
      location.schoolQuality * factors.schoolQuality +
      location.transportation * factors.transportation) * 100
    );
  }

  private static calculatePropertyConditionRisk(condition: PropertyData['propertyCondition']): number {
    const factors = {
      structuralIntegrity: 0.3,
      maintenanceHistory: 0.2,
      age: 0.2,
      energyEfficiency: 0.15,
      safetyFeatures: 0.15
    };

    const ageScore = Math.max(0, 100 - (condition.age * 2));
    
    return Math.round(
      condition.structuralIntegrity * factors.structuralIntegrity +
      condition.maintenanceHistory * factors.maintenanceHistory +
      ageScore * factors.age +
      condition.energyEfficiency * factors.energyEfficiency +
      condition.safetyFeatures * factors.safetyFeatures
    );
  }

  private static calculateFinancialRisk(financial: PropertyData['financial']): number {
    const factors = {
      marketValue: 0.3,
      rentalIncome: 0.25,
      operatingExpenses: 0.2,
      debtRatio: 0.15,
      cashFlow: 0.1
    };

    const debtRatioScore = Math.max(0, 100 - (financial.debtRatio * 100));
    const cashFlowScore = financial.cashFlow > 0 ? 100 : 50;

    return Math.round(
      (financial.marketValue / 1000000) * factors.marketValue +
      (financial.rentalIncome / 1000) * factors.rentalIncome +
      (100 - (financial.operatingExpenses / financial.rentalIncome * 100)) * factors.operatingExpenses +
      debtRatioScore * factors.debtRatio +
      cashFlowScore * factors.cashFlow
    );
  }

  private static analyzeMarketTrends(marketData: PropertyData['marketData']): MarketTrend {
    const priceTrend = this.calculatePriceTrend(marketData.priceHistory);
    const demandSupplyRatio = marketData.demandSupplyRatio;
    const economicIndicators = marketData.economicIndicators;

    const score = Math.round(
      (priceTrend === 'up' ? 80 : 40) * 0.4 +
      (demandSupplyRatio > 1 ? 80 : 40) * 0.3 +
      this.calculateEconomicScore(economicIndicators) * 0.3
    );

    return {
      score,
      direction: priceTrend,
      confidence: this.calculateConfidence(marketData),
      factors: {
        priceTrend,
        demandSupplyRatio,
        economicIndicators
      }
    };
  }

  private static calculateComplianceScore(compliance: PropertyData['compliance']): ComplianceScore {
    const issues = this.identifyComplianceIssues(compliance);
    const score = Math.round(
      (100 - (issues.length * 10)) * 0.7 +
      (compliance.certifications.length * 10) * 0.3
    );

    return {
      score,
      status: score >= 70 ? 'compliant' : 'non-compliant',
      issues,
      requiredActions: this.generateComplianceActions(issues)
    };
  }

  private static identifyComplianceIssues(compliance: PropertyData['compliance']): Issue[] {
    const issues: Issue[] = [];

    // Check building codes
    if (!compliance.buildingCodes.every(code => code.status === 'compliant')) {
      issues.push({
        id: 'building-code-1',
        type: 'compliance',
        severity: 'high',
        description: 'Building code violations detected',
        impact: 'Legal and safety risks',
        resolution: 'Address code violations',
        estimatedCost: 5000,
        priority: 'high',
        status: 'open',
        createdAt: new Date(),
        updatedAt: new Date()
      });
    }

    // Check safety regulations
    if (!compliance.safetyRegulations.every(reg => reg.status === 'compliant')) {
      issues.push({
        id: 'safety-1',
        type: 'safety',
        severity: 'high',
        description: 'Safety regulation violations',
        impact: 'Occupant safety risk',
        resolution: 'Implement safety measures',
        estimatedCost: 3000,
        priority: 'high',
        status: 'open',
        createdAt: new Date(),
        updatedAt: new Date()
      });
    }

    return issues;
  }

  private static generateRecommendations(
    propertyData: PropertyData,
    riskScore: number,
    riskLevel: string,
    marketTrend: MarketTrend,
    complianceScore: ComplianceScore
  ): Recommendation[] {
    const recommendations: Recommendation[] = [];

    // Risk mitigation recommendations
    if (riskLevel === 'high') {
      recommendations.push({
        id: 'risk-mitigation-1',
        type: 'risk-mitigation',
        priority: 'high',
        description: 'Implement risk mitigation measures',
        rationale: 'High risk score requires immediate action',
        estimatedCost: 10000,
        expectedROI: 20000,
        timeline: '3 months',
        status: 'pending',
        createdAt: new Date(),
        updatedAt: new Date()
      });
    }

    // Market opportunity recommendations
    if (marketTrend.direction === 'up' && marketTrend.confidence > 0.7) {
      recommendations.push({
        id: 'market-opportunity-1',
        type: 'investment',
        priority: 'medium',
        description: 'Consider property value enhancement',
        rationale: 'Favorable market conditions',
        estimatedCost: 15000,
        expectedROI: 30000,
        timeline: '6 months',
        status: 'pending',
        createdAt: new Date(),
        updatedAt: new Date()
      });
    }

    // Compliance recommendations
    if (complianceScore.status === 'non-compliant') {
      recommendations.push({
        id: 'compliance-1',
        type: 'compliance',
        priority: 'high',
        description: 'Address compliance issues',
        rationale: 'Ensure regulatory compliance',
        estimatedCost: complianceScore.issues.reduce((sum, issue) => sum + (issue.estimatedCost || 0), 0),
        expectedROI: 15000,
        timeline: '2 months',
        status: 'pending',
        createdAt: new Date(),
        updatedAt: new Date()
      });
    }

    return recommendations;
  }

  private static determineRiskLevel(score: number): 'low' | 'medium' | 'high' {
    if (score <= this.THRESHOLDS.low) return 'low';
    if (score <= this.THRESHOLDS.medium) return 'medium';
    return 'high';
  }

  private static calculatePriceTrend(priceHistory: number[]): 'up' | 'down' | 'stable' {
    if (priceHistory.length < 2) return 'stable';
    
    const recentChange = priceHistory[priceHistory.length - 1] - priceHistory[priceHistory.length - 2];
    return recentChange > 0 ? 'up' : recentChange < 0 ? 'down' : 'stable';
  }

  private static calculateEconomicScore(indicators: PropertyData['marketData']['economicIndicators']): number {
    return Math.round(
      (indicators.gdpGrowth * 20) +
      ((100 - indicators.unemploymentRate) * 0.3) +
      ((100 - indicators.inflationRate) * 0.3) +
      ((100 - indicators.interestRate) * 0.2)
    );
  }

  private static calculateConfidence(marketData: PropertyData['marketData']): number {
    const factors = {
      dataPoints: marketData.priceHistory.length / 100,
      volatility: 1 - (this.calculateVolatility(marketData.priceHistory) / 100),
      economicStability: this.calculateEconomicStability(marketData.economicIndicators)
    };

    return Math.min(1, 
      factors.dataPoints * 0.4 +
      factors.volatility * 0.3 +
      factors.economicStability * 0.3
    );
  }

  private static calculateVolatility(prices: number[]): number {
    if (prices.length < 2) return 0;
    
    const mean = prices.reduce((sum, price) => sum + price, 0) / prices.length;
    const variance = prices.reduce((sum, price) => sum + Math.pow(price - mean, 2), 0) / prices.length;
    return Math.sqrt(variance);
  }

  private static calculateEconomicStability(indicators: PropertyData['marketData']['economicIndicators']): number {
    const stabilityScore = 
      (indicators.gdpGrowth > 2 ? 1 : 0.5) * 0.3 +
      (indicators.unemploymentRate < 5 ? 1 : 0.5) * 0.3 +
      (indicators.inflationRate < 3 ? 1 : 0.5) * 0.2 +
      (indicators.interestRate < 5 ? 1 : 0.5) * 0.2;

    return stabilityScore;
  }

  private static generateComplianceActions(issues: Issue[]): string[] {
    return issues.map(issue => issue.resolution);
  }
} 