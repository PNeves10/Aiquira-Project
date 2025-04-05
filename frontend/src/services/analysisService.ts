import { RiskScore, MarketTrend, Issue, Recommendation } from '../types/analysis';

interface AnalysisData {
  riskScore: RiskScore;
  marketTrend: MarketTrend;
  issues: Issue[];
  recommendations: Recommendation[];
}

export const fetchAnalysisData = async (): Promise<AnalysisData> => {
  try {
    const response = await fetch('/api/analysis/analyze', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        // Add any required request body data here
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch analysis data');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching analysis data:', error);
    throw error;
  }
};

export const fetchRiskScore = async (): Promise<RiskScore> => {
  try {
    const response = await fetch('/api/analysis/risk-score', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        // Add any required request body data here
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch risk score');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching risk score:', error);
    throw error;
  }
};

export const fetchIssues = async (): Promise<Issue[]> => {
  try {
    const response = await fetch('/api/analysis/issues', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        // Add any required request body data here
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch issues');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching issues:', error);
    throw error;
  }
};

export const fetchRecommendations = async (): Promise<Recommendation[]> => {
  try {
    const response = await fetch('/api/analysis/recommendations', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        // Add any required request body data here
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch recommendations');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching recommendations:', error);
    throw error;
  }
}; 