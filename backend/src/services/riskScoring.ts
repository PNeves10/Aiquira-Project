import { PropertyData } from '../types/property';
import { RiskScore, RiskFactors, MarketTrend, ComplianceScore } from '../types/analysis';

export class RiskScoringService {
  private static readonly WEIGHTS = {
    location: 0.25,
    propertyCondition: 0.20,
    marketTrend: 0.15,
    compliance: 0.20,
    financial: 0.20
  };

  private static readonly THRESHOLDS = {
    low: 0.3,
    medium: 0.6,
    high: 0.8
  };

  static calculateRiskScore(propertyData: PropertyData): RiskScore {
    const factors = this.calculateRiskFactors(propertyData);
    const marketTrend = this.analyzeMarketTrend(propertyData);
    const complianceScore = this.calculateComplianceScore(propertyData);

    const weightedScore = this.calculateWeightedScore(factors, marketTrend, complianceScore);
    const riskLevel = this.determineRiskLevel(weightedScore);

    return {
      score: weightedScore,
      level: riskLevel,
      factors,
      marketTrend,
      complianceScore,
      recommendations: this.generateRecommendations(weightedScore, factors, marketTrend, complianceScore)
    };
  }

  private static calculateRiskFactors(propertyData: PropertyData): RiskFactors {
    return {
      location: this.calculateLocationRisk(propertyData),
      propertyCondition: this.calculatePropertyConditionRisk(propertyData),
      financial: this.calculateFinancialRisk(propertyData)
    };
  }

  private static calculateLocationRisk(propertyData: PropertyData): number {
    const { crimeRate, floodRisk, proximityToAmenities } = propertyData.location;
    
    return (
      (crimeRate * 0.4) +
      (floodRisk * 0.3) +
      ((1 - proximityToAmenities) * 0.3)
    );
  }

  private static calculatePropertyConditionRisk(propertyData: PropertyData): number {
    const { age, maintenanceHistory, structuralIssues } = propertyData.property;
    
    return (
      (age / 100 * 0.3) +
      (maintenanceHistory.length > 0 ? 0.2 : 0.4) +
      (structuralIssues.length * 0.3)
    );
  }

  private static calculateFinancialRisk(propertyData: PropertyData): number {
    const { priceTrend, rentalYield, vacancyRate } = propertyData.financial;
    
    return (
      ((1 - priceTrend) * 0.4) +
      ((1 - rentalYield) * 0.3) +
      (vacancyRate * 0.3)
    );
  }

  private static analyzeMarketTrend(propertyData: PropertyData): MarketTrend {
    const { priceTrend, demand, supply, economicIndicators } = propertyData.market;
    
    const trendScore = (
      (priceTrend * 0.3) +
      (demand / supply * 0.3) +
      (economicIndicators.gdpGrowth * 0.2) +
      (economicIndicators.unemploymentRate * 0.2)
    );

    return {
      score: trendScore,
      direction: trendScore > 0.5 ? 'positive' : trendScore < 0.3 ? 'negative' : 'neutral',
      confidence: Math.abs(trendScore - 0.5) * 2,
      factors: {
        priceTrend,
        demandSupplyRatio: demand / supply,
        economicIndicators
      }
    };
  }

  private static calculateComplianceScore(propertyData: PropertyData): ComplianceScore {
    const { permits, violations, inspections } = propertyData.compliance;
    
    const score = (
      (permits.valid ? 0.4 : 0) +
      (violations.length === 0 ? 0.3 : 0) +
      (inspections.passed ? 0.3 : 0)
    );

    return {
      score,
      status: score > 0.8 ? 'compliant' : score > 0.5 ? 'partial' : 'non-compliant',
      issues: violations,
      requiredActions: this.getRequiredComplianceActions(permits, violations, inspections)
    };
  }

  private static calculateWeightedScore(
    factors: RiskFactors,
    marketTrend: MarketTrend,
    complianceScore: ComplianceScore
  ): number {
    return (
      (factors.location * this.WEIGHTS.location) +
      (factors.propertyCondition * this.WEIGHTS.propertyCondition) +
      (marketTrend.score * this.WEIGHTS.marketTrend) +
      (complianceScore.score * this.WEIGHTS.compliance) +
      (factors.financial * this.WEIGHTS.financial)
    );
  }

  private static determineRiskLevel(score: number): 'low' | 'medium' | 'high' {
    if (score <= this.THRESHOLDS.low) return 'low';
    if (score <= this.THRESHOLDS.medium) return 'medium';
    return 'high';
  }

  private static generateRecommendations(
    score: number,
    factors: RiskFactors,
    marketTrend: MarketTrend,
    complianceScore: ComplianceScore
  ): string[] {
    const recommendations: string[] = [];

    if (factors.location > 0.6) {
      recommendations.push('Consider additional security measures due to high location risk');
    }

    if (factors.propertyCondition > 0.7) {
      recommendations.push('Schedule immediate property maintenance and repairs');
    }

    if (marketTrend.direction === 'negative') {
      recommendations.push('Consider holding off on major investments until market conditions improve');
    }

    if (complianceScore.status === 'non-compliant') {
      recommendations.push('Address compliance issues immediately to avoid penalties');
    }

    if (factors.financial > 0.8) {
      recommendations.push('Review financial strategy and consider risk mitigation measures');
    }

    return recommendations;
  }

  private static getRequiredComplianceActions(
    permits: { valid: boolean; type: string },
    violations: string[],
    inspections: { passed: boolean; date: Date }
  ): string[] {
    const actions: string[] = [];

    if (!permits.valid) {
      actions.push(`Renew ${permits.type} permit`);
    }

    violations.forEach(violation => {
      actions.push(`Resolve violation: ${violation}`);
    });

    if (!inspections.passed) {
      actions.push('Schedule follow-up inspection');
    }

    return actions;
  }
} 