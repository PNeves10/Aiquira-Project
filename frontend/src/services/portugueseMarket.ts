import { captureError } from '../utils/sentry';
import {
  complianceDataSchema,
  marketRequirementsSchema,
  aiAnalysisSchema,
  type ComplianceData,
  type MarketRequirements,
  type AIAnalysisResult,
} from '../schemas/portugueseMarket';

export interface PortugueseRegistryData {
  registryNumber: string;
  propertyType: string;
  location: string;
  registrationDate: string;
  lastUpdate: string;
  status: 'active' | 'pending' | 'suspended';
  encumbrances: {
    type: 'mortgage' | 'lien' | 'restriction';
    description: string;
    date: string;
    status: 'active' | 'resolved';
  }[];
}

export interface NotaryData {
  notaryId: string;
  documentType: 'escritura' | 'certidão' | 'procuração';
  documentNumber: string;
  date: string;
  parties: string[];
  status: 'valid' | 'pending' | 'expired';
  notaryOffice: string;
  value: number;
  currency: 'EUR';
}

export interface EnergyCertificate {
  certificateNumber: string;
  energyClass: 'A+' | 'A' | 'B' | 'C' | 'D' | 'E' | 'F';
  validUntil: string;
  energyEfficiency: number;
  co2Emissions: number;
  primaryEnergy: number;
  globalEnergy: number;
  renewableEnergy: number;
}

export interface PortugueseComplianceData {
  registryData: PortugueseRegistryData;
  notaryData: NotaryData;
  cadastralData: {
    cadastralNumber: string;
    propertyType: string;
    area: number;
    location: string;
    lastUpdate: string;
    constructionYear: number;
    conservationState: 'excellent' | 'good' | 'fair' | 'poor';
    useType: string;
    urbanization: 'urban' | 'rural' | 'mixed';
  };
  taxData: {
    propertyTax: number;
    imi: number;
    lastPayment: string;
    status: 'up_to_date' | 'pending' | 'overdue';
    imt: number;
    stampDuty: number;
    taxExemptions: {
      type: string;
      percentage: number;
      validUntil: string;
    }[];
  };
  energyCertificate: EnergyCertificate;
  urbanPlanning: {
    licenseNumber: string;
    type: 'construction' | 'renovation' | 'demolition';
    status: 'valid' | 'expired' | 'pending';
    issueDate: string;
    expiryDate: string;
    restrictions: string[];
  };
  condominium: {
    exists: boolean;
    name: string;
    number: string;
    status: 'active' | 'inactive';
    lastAssemblyDate: string;
    nextAssemblyDate: string;
    maintenanceFund: number;
  };
}

export interface PortugueseMarketRequirements {
  requiredDocuments: string[];
  complianceChecks: {
    registry: boolean;
    notary: boolean;
    cadastral: boolean;
    tax: boolean;
    energy: boolean;
    urbanPlanning: boolean;
    condominium: boolean;
  };
  deadlines: {
    documentSubmission: string;
    complianceCheck: string;
  };
  regionalRequirements: {
    region: string;
    additionalDocuments: string[];
    specificChecks: string[];
  }[];
}

class PortugueseMarketService {
  private static instance: PortugueseMarketService;
  private readonly API_BASE_URL = process.env.REACT_APP_PORTUGUESE_MARKET_API_URL;

  private constructor() {}

  public static getInstance(): PortugueseMarketService {
    if (!PortugueseMarketService.instance) {
      PortugueseMarketService.instance = new PortugueseMarketService();
    }
    return PortugueseMarketService.instance;
  }

  private async validateResponse<T>(response: Response, schema: any): Promise<T> {
    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`);
    }

    const data = await response.json();
    try {
      return schema.parse(data) as T;
    } catch (error) {
      captureError(error instanceof Error ? error : new Error('Validation failed'));
      throw new Error('Invalid response data format');
    }
  }

  async getComplianceData(assetId: string): Promise<ComplianceData> {
    try {
      const response = await fetch(`${this.API_BASE_URL}/compliance/${assetId}`);
      return this.validateResponse(response, complianceDataSchema);
    } catch (error) {
      captureError(error instanceof Error ? error : new Error('Failed to fetch compliance data'));
      throw error;
    }
  }

  async getMarketRequirements(): Promise<MarketRequirements> {
    try {
      const response = await fetch(`${this.API_BASE_URL}/requirements`);
      return this.validateResponse(response, marketRequirementsSchema);
    } catch (error) {
      captureError(error instanceof Error ? error : new Error('Failed to fetch market requirements'));
      throw error;
    }
  }

  async validateRegistryData(registryNumber: string): Promise<boolean> {
    try {
      const response = await fetch(`${this.API_BASE_URL}/registry/validate/${registryNumber}`);
      if (!response.ok) {
        throw new Error('Failed to validate registry data');
      }
      const data = await response.json();
      return data.isValid;
    } catch (error) {
      captureError(error as Error);
      throw error;
    }
  }

  async getNotaryDocuments(assetId: string): Promise<NotaryData[]> {
    try {
      const response = await fetch(`${this.API_BASE_URL}/notary/${assetId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch notary documents');
      }
      return await response.json();
    } catch (error) {
      captureError(error as Error);
      throw error;
    }
  }

  async checkTaxCompliance(assetId: string): Promise<boolean> {
    try {
      const response = await fetch(`${this.API_BASE_URL}/tax/compliance/${assetId}`);
      if (!response.ok) {
        throw new Error('Failed to check tax compliance');
      }
      const data = await response.json();
      return data.isCompliant;
    } catch (error) {
      captureError(error as Error);
      throw error;
    }
  }

  async getCadastralData(assetId: string): Promise<PortugueseComplianceData['cadastralData']> {
    try {
      const response = await fetch(`${this.API_BASE_URL}/cadastral/${assetId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch cadastral data');
      }
      return await response.json();
    } catch (error) {
      captureError(error as Error);
      throw error;
    }
  }

  async getEnergyCertificate(assetId: string): Promise<EnergyCertificate> {
    try {
      const response = await fetch(`${this.API_BASE_URL}/energy/${assetId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch energy certificate');
      }
      return await response.json();
    } catch (error) {
      captureError(error as Error);
      throw error;
    }
  }

  async checkUrbanPlanningCompliance(assetId: string): Promise<boolean> {
    try {
      const response = await fetch(`${this.API_BASE_URL}/urban-planning/${assetId}`);
      if (!response.ok) {
        throw new Error('Failed to check urban planning compliance');
      }
      const data = await response.json();
      return data.isCompliant;
    } catch (error) {
      captureError(error as Error);
      throw error;
    }
  }

  async getCondominiumInfo(assetId: string): Promise<PortugueseComplianceData['condominium']> {
    try {
      const response = await fetch(`${this.API_BASE_URL}/condominium/${assetId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch condominium information');
      }
      return await response.json();
    } catch (error) {
      captureError(error as Error);
      throw error;
    }
  }

  async calculateIMT(assetValue: number): Promise<number> {
    try {
      const response = await fetch(`${this.API_BASE_URL}/tax/imt`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ assetValue }),
      });
      if (!response.ok) {
        throw new Error('Failed to calculate IMT');
      }
      const data = await response.json();
      return data.imt;
    } catch (error) {
      captureError(error as Error);
      throw error;
    }
  }

  async getRegionalRequirements(region: string): Promise<PortugueseMarketRequirements['regionalRequirements'][0]> {
    try {
      const response = await fetch(`${this.API_BASE_URL}/requirements/region/${region}`);
      if (!response.ok) {
        throw new Error('Failed to fetch regional requirements');
      }
      return await response.json();
    } catch (error) {
      captureError(error as Error);
      throw error;
    }
  }

  async getAIAnalysis(assetId: string): Promise<AIAnalysisResult> {
    try {
      const complianceData = await this.getComplianceData(assetId);
      const marketData = await this.getMarketRequirements();
      
      // AI-powered risk assessment
      const riskScore = this.calculateRiskScore(complianceData);
      
      // Generate personalized recommendations
      const recommendations = this.generateRecommendations(complianceData, riskScore);
      
      // Analyze market trends and insights
      const marketInsights = await this.analyzeMarketTrends(assetId);
      
      // Calculate compliance score
      const complianceScore = this.calculateComplianceScore(complianceData);
      
      // Identify potential issues
      const issues = this.identifyIssues(complianceData, marketData);

      const analysis = {
        riskScore,
        recommendations,
        marketInsights,
        complianceScore,
        issues,
      };

      // Validate the analysis result
      return aiAnalysisSchema.parse(analysis);
    } catch (error) {
      captureError(error instanceof Error ? error : new Error('Failed to get AI analysis'));
      throw error;
    }
  }

  private calculateRiskScore(data: PortugueseComplianceData): number {
    let score = 0;
    const weights = {
      registry: 0.2,
      notary: 0.15,
      cadastral: 0.15,
      energy: 0.1,
      tax: 0.2,
      urban: 0.1,
      condominium: 0.1,
    };

    // Registry risk assessment
    if (data.registryData.status !== 'active') score += weights.registry;
    if (data.registryData.encumbrances.length > 0) score += weights.registry * 0.5;

    // Notary risk assessment
    if (data.notaryData.status !== 'valid') score += weights.notary;

    // Cadastral risk assessment
    if (data.cadastralData.conservationState === 'poor') score += weights.cadastral;
    if (data.cadastralData.constructionYear < 1990) score += weights.cadastral * 0.5;

    // Energy risk assessment
    if (['D', 'E', 'F', 'G'].includes(data.energyCertificate.energyClass)) {
      score += weights.energy;
    }

    // Tax risk assessment
    if (data.taxData.status !== 'up_to_date') score += weights.tax;
    if (data.taxData.taxExemptions.length === 0) score += weights.tax * 0.3;

    // Urban planning risk assessment
    if (data.urbanPlanning.status !== 'valid') score += weights.urban;
    if (data.urbanPlanning.restrictions.length > 0) score += weights.urban * 0.5;

    // Condominium risk assessment
    if (data.condominium.exists && data.condominium.status !== 'active') {
      score += weights.condominium;
    }

    return Math.min(Math.round(score * 100), 100);
  }

  private generateRecommendations(data: PortugueseComplianceData, riskScore: number): string[] {
    const recommendations: string[] = [];

    if (riskScore > 70) {
      recommendations.push('High risk property - Consider conducting additional due diligence');
    }

    if (data.registryData.encumbrances.length > 0) {
      recommendations.push('Property has active encumbrances - Review legal status');
    }

    if (data.energyCertificate.energyClass === 'G') {
      recommendations.push('Poor energy efficiency - Consider renovation options');
    }

    if (data.taxData.status !== 'up_to_date') {
      recommendations.push('Tax payments pending - Verify outstanding amounts');
    }

    if (data.urbanPlanning.restrictions.length > 0) {
      recommendations.push('Property has urban planning restrictions - Review impact on intended use');
    }

    return recommendations;
  }

  private async analyzeMarketTrends(assetId: string): Promise<AIAnalysisResult['marketInsights']> {
    // This would typically integrate with a market analysis API
    // For now, returning mock data
    return {
      trend: 'positive',
      confidence: 0.85,
      factors: [
        'Increasing property values in the area',
        'Strong rental demand',
        'Favorable interest rates',
      ],
    };
  }

  private calculateComplianceScore(data: PortugueseComplianceData): number {
    let score = 0;
    const weights = {
      registry: 0.2,
      notary: 0.15,
      cadastral: 0.15,
      energy: 0.1,
      tax: 0.2,
      urban: 0.1,
      condominium: 0.1,
    };

    // Registry compliance
    if (data.registryData.status === 'active') score += weights.registry;
    if (data.registryData.encumbrances.length === 0) score += weights.registry * 0.5;

    // Notary compliance
    if (data.notaryData.status === 'valid') score += weights.notary;

    // Cadastral compliance
    if (data.cadastralData.conservationState === 'excellent') score += weights.cadastral;
    if (data.cadastralData.constructionYear >= 2000) score += weights.cadastral * 0.5;

    // Energy compliance
    if (['A+', 'A', 'B'].includes(data.energyCertificate.energyClass)) {
      score += weights.energy;
    }

    // Tax compliance
    if (data.taxData.status === 'up_to_date') score += weights.tax;
    if (data.taxData.taxExemptions.length > 0) score += weights.tax * 0.3;

    // Urban planning compliance
    if (data.urbanPlanning.status === 'valid') score += weights.urban;
    if (data.urbanPlanning.restrictions.length === 0) score += weights.urban * 0.5;

    // Condominium compliance
    if (data.condominium.exists && data.condominium.status === 'active') {
      score += weights.condominium;
    }

    return Math.min(Math.round(score * 100), 100);
  }

  private identifyIssues(
    data: PortugueseComplianceData,
    requirements: PortugueseMarketRequirements
  ): AIAnalysisResult['issues'] {
    const issues: AIAnalysisResult['issues'] = [];

    // Check registry issues
    if (data.registryData.status !== 'active') {
      issues.push({
        severity: 'high',
        description: 'Registry status is not active',
        impact: 'May affect property ownership and transferability',
        resolution: 'Update registry status with relevant authorities',
      });
    }

    // Check energy efficiency issues
    if (['D', 'E', 'F', 'G'].includes(data.energyCertificate.energyClass)) {
      issues.push({
        severity: 'medium',
        description: 'Low energy efficiency rating',
        impact: 'Higher utility costs and potential renovation requirements',
        resolution: 'Consider energy efficiency improvements',
      });
    }

    // Check tax compliance issues
    if (data.taxData.status !== 'up_to_date') {
      issues.push({
        severity: 'high',
        description: 'Tax payments are not up to date',
        impact: 'Potential legal issues and additional costs',
        resolution: 'Settle outstanding tax payments',
      });
    }

    // Check urban planning issues
    if (data.urbanPlanning.restrictions.length > 0) {
      issues.push({
        severity: 'medium',
        description: 'Urban planning restrictions present',
        impact: 'May limit property use and development potential',
        resolution: 'Review restrictions and consider impact on intended use',
      });
    }

    return issues;
  }
}

export const portugueseMarketService = PortugueseMarketService.getInstance(); 