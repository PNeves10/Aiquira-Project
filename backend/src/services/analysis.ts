import { PropertyData, Issue, Recommendation } from '../types/analysis';
import { RiskScoringService } from './riskScoring';

export class AnalysisService {
  static analyzeProperty(propertyData: PropertyData) {
    const riskScore = RiskScoringService.calculateRiskScore(propertyData);
    const issues = this.identifyIssues(propertyData, riskScore);
    const recommendations = this.generateRecommendations(propertyData, riskScore, issues);

    return {
      riskScore,
      issues,
      recommendations
    };
  }

  private static identifyIssues(propertyData: PropertyData, riskScore: any): Issue[] {
    const issues: Issue[] = [];

    // Structural issues
    if (propertyData.property.structuralIssues.length > 0) {
      issues.push({
        id: 'structural-1',
        type: 'structural',
        severity: this.determineSeverity(propertyData.property.structuralIssues.length),
        description: 'Structural issues identified',
        impact: 'Potential safety hazards and reduced property value',
        resolution: 'Schedule structural inspection and repairs',
        estimatedCost: this.estimateRepairCost(propertyData.property.structuralIssues),
        priority: 1,
        status: 'open',
        createdAt: new Date(),
        updatedAt: new Date()
      });
    }

    // Compliance issues
    if (propertyData.compliance.violations.length > 0) {
      issues.push({
        id: 'compliance-1',
        type: 'compliance',
        severity: 'high',
        description: 'Compliance violations found',
        impact: 'Legal and financial penalties',
        resolution: 'Address violations immediately',
        priority: 1,
        status: 'open',
        createdAt: new Date(),
        updatedAt: new Date()
      });
    }

    // Financial issues
    if (propertyData.financial.vacancyRate > 0.1) {
      issues.push({
        id: 'financial-1',
        type: 'financial',
        severity: this.determineSeverity(propertyData.financial.vacancyRate),
        description: 'High vacancy rate',
        impact: 'Reduced rental income',
        resolution: 'Review marketing strategy and property pricing',
        priority: 2,
        status: 'open',
        createdAt: new Date(),
        updatedAt: new Date()
      });
    }

    // Market issues
    if (riskScore.marketTrend.direction === 'negative') {
      issues.push({
        id: 'market-1',
        type: 'market',
        severity: 'medium',
        description: 'Negative market trend',
        impact: 'Potential decrease in property value',
        resolution: 'Monitor market conditions and adjust strategy',
        priority: 3,
        status: 'open',
        createdAt: new Date(),
        updatedAt: new Date()
      });
    }

    // Location issues
    if (propertyData.location.crimeRate > 0.5) {
      issues.push({
        id: 'location-1',
        type: 'location',
        severity: this.determineSeverity(propertyData.location.crimeRate),
        description: 'High crime rate in area',
        impact: 'Reduced property value and tenant safety concerns',
        resolution: 'Implement additional security measures',
        priority: 2,
        status: 'open',
        createdAt: new Date(),
        updatedAt: new Date()
      });
    }

    return issues;
  }

  private static generateRecommendations(
    propertyData: PropertyData,
    riskScore: any,
    issues: Issue[]
  ): Recommendation[] {
    const recommendations: Recommendation[] = [];

    // Maintenance recommendations
    if (propertyData.property.maintenanceHistory.length === 0) {
      recommendations.push({
        id: 'maintenance-1',
        type: 'maintenance',
        priority: 'high',
        description: 'Schedule regular maintenance',
        rationale: 'No maintenance history found',
        estimatedCost: 5000,
        expectedROI: 0.1,
        timeline: 'Within 30 days',
        status: 'pending',
        createdAt: new Date(),
        updatedAt: new Date()
      });
    }

    // Investment recommendations
    if (propertyData.property.energyEfficiency < 0.7) {
      recommendations.push({
        id: 'investment-1',
        type: 'investment',
        priority: 'medium',
        description: 'Improve energy efficiency',
        rationale: 'Low energy efficiency score',
        estimatedCost: 15000,
        expectedROI: 0.15,
        timeline: 'Within 6 months',
        status: 'pending',
        createdAt: new Date(),
        updatedAt: new Date()
      });
    }

    // Compliance recommendations
    if (!propertyData.compliance.permits.valid) {
      recommendations.push({
        id: 'compliance-1',
        type: 'compliance',
        priority: 'high',
        description: 'Renew permits',
        rationale: 'Expired or invalid permits',
        estimatedCost: 1000,
        timeline: 'Immediately',
        status: 'pending',
        createdAt: new Date(),
        updatedAt: new Date()
      });
    }

    // Risk mitigation recommendations
    if (riskScore.level === 'high') {
      recommendations.push({
        id: 'risk-1',
        type: 'risk-mitigation',
        priority: 'high',
        description: 'Implement risk mitigation strategy',
        rationale: 'High overall risk score',
        estimatedCost: 20000,
        expectedROI: 0.2,
        timeline: 'Within 3 months',
        status: 'pending',
        createdAt: new Date(),
        updatedAt: new Date()
      });
    }

    return recommendations;
  }

  private static determineSeverity(value: number): 'low' | 'medium' | 'high' {
    if (value < 0.3) return 'low';
    if (value < 0.7) return 'medium';
    return 'high';
  }

  private static estimateRepairCost(issues: string[]): number {
    // Simple estimation based on number of issues
    return issues.length * 5000;
  }
} 