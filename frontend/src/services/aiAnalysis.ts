import { Asset, AssetValuation, MatchScore, DueDiligenceReport } from '../types/asset';
import { captureError } from '../utils/sentry';

interface PredictiveValuationParams {
  asset: Asset;
  marketData?: Record<string, any>;
  historicalData?: Record<string, any>;
}

interface MatchingParams {
  asset: Asset;
  buyerPreferences: Record<string, any>;
  marketContext?: Record<string, any>;
}

interface DueDiligenceParams {
  asset: Asset;
  documents: File[];
  additionalContext?: Record<string, any>;
}

export class AIAnalysisService {
  private static instance: AIAnalysisService;
  private baseUrl: string;

  private constructor() {
    this.baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';
  }

  public static getInstance(): AIAnalysisService {
    if (!AIAnalysisService.instance) {
      AIAnalysisService.instance = new AIAnalysisService();
    }
    return AIAnalysisService.instance;
  }

  public async getPredictiveValuation(params: PredictiveValuationParams): Promise<AssetValuation> {
    try {
      const response = await fetch(`${this.baseUrl}/ai/valuation`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(params),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch predictive valuation');
      }

      return await response.json();
    } catch (error) {
      captureError(error instanceof Error ? error : new Error('Failed to fetch predictive valuation'));
      throw error;
    }
  }

  public async getMatchingScore(params: MatchingParams): Promise<MatchScore> {
    try {
      const response = await fetch(`${this.baseUrl}/ai/matching`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(params),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch matching score');
      }

      return await response.json();
    } catch (error) {
      captureError(error instanceof Error ? error : new Error('Failed to fetch matching score'));
      throw error;
    }
  }

  public async getDueDiligenceReport(params: DueDiligenceParams): Promise<DueDiligenceReport> {
    try {
      const formData = new FormData();
      formData.append('asset', JSON.stringify(params.asset));
      params.documents.forEach((doc) => {
        formData.append('documents', doc);
      });
      if (params.additionalContext) {
        formData.append('additionalContext', JSON.stringify(params.additionalContext));
      }

      const response = await fetch(`${this.baseUrl}/ai/due-diligence`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to fetch due diligence report');
      }

      return await response.json();
    } catch (error) {
      captureError(error instanceof Error ? error : new Error('Failed to fetch due diligence report'));
      throw error;
    }
  }
} 