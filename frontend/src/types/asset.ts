export interface Asset {
  id: string;
  name: string;
  type: string;
  description: string;
  price: number;
  location: string;
  specifications: Record<string, any>;
  images: string[];
  documents: {
    type: string;
    url: string;
    content?: string;
  }[];
  createdAt: string;
  updatedAt: string;
  owner: {
    id: string;
    name: string;
    email: string;
  };
  status: 'available' | 'pending' | 'sold' | 'archived';
}

export interface AssetValuation {
  currentValue: number;
  predictedValue: number;
  confidence: number;
  factors: {
    name: string;
    impact: number;
    explanation: string;
  }[];
  marketTrends: {
    price: number;
    timestamp: string;
    confidence: number;
  }[];
  recommendations: {
    action: string;
    reason: string;
    priority: 'high' | 'medium' | 'low';
  }[];
}

export interface MatchScore {
  score: number;
  confidence: number;
  factors: {
    name: string;
    score: number;
    explanation: string;
  }[];
  recommendations: {
    action: string;
    reason: string;
    priority: 'high' | 'medium' | 'low';
  }[];
  similarAssets: {
    asset: Asset;
    similarity: number;
    keyDifferences: string[];
  }[];
}

export interface DueDiligenceReport {
  riskScore: number;
  complianceScore: number;
  financialHealth: {
    score: number;
    metrics: Record<string, number>;
    analysis: string;
  };
  legalStatus: {
    score: number;
    issues: {
      type: string;
      severity: 'high' | 'medium' | 'low';
      description: string;
      recommendation: string;
    }[];
  };
  marketPosition: {
    score: number;
    analysis: string;
    competitors: {
      name: string;
      marketShare: number;
      strengths: string[];
      weaknesses: string[];
    }[];
  };
  recommendations: {
    action: string;
    reason: string;
    priority: 'high' | 'medium' | 'low';
    timeline: string;
  }[];
  documents: {
    type: string;
    status: 'verified' | 'pending' | 'missing';
    issues: string[];
    recommendations: string[];
  }[];
} 