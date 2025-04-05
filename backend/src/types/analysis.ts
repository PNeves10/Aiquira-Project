export interface RiskScore {
  score: number;
  level: 'low' | 'medium' | 'high';
  factors: RiskFactors;
  marketTrend: MarketTrend;
  complianceScore: ComplianceScore;
  recommendations: string[];
}

export interface RiskFactors {
  location: number;
  propertyCondition: number;
  financial: number;
}

export interface MarketTrend {
  score: number;
  direction: 'positive' | 'neutral' | 'negative';
  confidence: number;
  factors: {
    priceTrend: number;
    demandSupplyRatio: number;
    economicIndicators: EconomicIndicators;
  };
}

export interface EconomicIndicators {
  gdpGrowth: number;
  unemploymentRate: number;
  inflationRate: number;
  interestRate: number;
}

export interface ComplianceScore {
  score: number;
  status: 'compliant' | 'partial' | 'non-compliant';
  issues: string[];
  requiredActions: string[];
}

export interface PropertyData {
  location: {
    address: string;
    coordinates: {
      latitude: number;
      longitude: number;
    };
    crimeRate: number;
    proximityToAmenities: number;
    floodRisk: number;
    schoolQuality: number;
    transportation: number;
  };
  propertyCondition: {
    age: number;
    structuralIntegrity: number;
    maintenanceHistory: number;
    energyEfficiency: number;
    safetyFeatures: number;
  };
  financial: {
    marketValue: number;
    rentalIncome: number;
    operatingExpenses: number;
    debtRatio: number;
    cashFlow: number;
  };
  marketData: MarketData;
  compliance: ComplianceData;
}

export interface MarketData {
  priceHistory: number[];
  demandSupplyRatio: number;
  economicIndicators: {
    gdpGrowth: number;
    unemploymentRate: number;
    inflationRate: number;
    interestRate: number;
  };
}

export interface ComplianceData {
  buildingCodes: Array<{
    code: string;
    status: 'compliant' | 'non-compliant';
  }>;
  safetyRegulations: Array<{
    regulation: string;
    status: 'compliant' | 'non-compliant';
  }>;
  certifications: string[];
}

export interface Issue {
  id: string;
  type: 'structural' | 'compliance' | 'financial' | 'market' | 'location';
  severity: 'low' | 'medium' | 'high';
  description: string;
  impact: string;
  resolution: string;
  estimatedCost?: number;
  priority: number;
  status: 'open' | 'in-progress' | 'resolved';
  createdAt: Date;
  updatedAt: Date;
}

export interface Recommendation {
  id: string;
  type: 'maintenance' | 'investment' | 'compliance' | 'risk-mitigation';
  priority: 'low' | 'medium' | 'high';
  description: string;
  rationale: string;
  estimatedCost?: number;
  expectedROI?: number;
  timeline: string;
  status: 'pending' | 'approved' | 'rejected' | 'completed';
  createdAt: Date;
  updatedAt: Date;
}

export interface DocumentAnalysis {
  sentiment: {
    score: number;
    magnitude: number;
    label: 'positive' | 'negative' | 'neutral';
  };
  entities: Array<{
    type: string;
    value: string;
    confidence: number;
  }>;
  keyPhrases: Array<{
    phrase: string;
    importance: number;
  }>;
  complianceIssues: Array<{
    type: string;
    severity: 'low' | 'medium' | 'high';
    description: string;
    reference: string;
  }>;
  summary: string;
}

export interface ComplianceDocument {
  id: string;
  type: 'building-permit' | 'inspection-report' | 'safety-certificate' | 'other';
  content: string;
  date: Date;
  status: 'valid' | 'expired' | 'pending';
}

export interface ComplianceIssue {
  type: string;
  severity: 'low' | 'medium' | 'high';
  description: string;
  reference: string;
}

export interface ComplianceRecommendation {
  action: string;
  priority: 'low' | 'medium' | 'high';
  deadline?: Date;
}

export interface MaintenancePrediction {
  maintenanceNeeds: Array<{
    component: string;
    urgency: 'low' | 'medium' | 'high';
    estimatedCost: number;
    timeline: string;
  }>;
  overallRisk: number;
}

export interface PricePrediction {
  predictedPrice: number;
  confidence: number;
  factors: Record<string, number>;
}

export interface WebsiteMetrics {
  traffic: {
    monthlyVisitors: number;
    pageViews: number;
    averageTimeOnSite: number;
    bounceRate: number;
  };
  seo: {
    domainAuthority: number;
    backlinks: number;
    organicKeywords: number;
    rankingKeywords: number;
  };
  conversions: {
    rate: number;
    value: number;
  };
  competition: {
    score: number;
    topCompetitors: string[];
  };
}

export interface ValuationResult {
  domain: string;
  valuation: number;
  metrics: WebsiteMetrics;
  confidence: number;
  timestamp: Date;
  recommendations: string[];
} 