import { fetchAnalysisData, fetchRiskScore, fetchIssues, fetchRecommendations } from '../services/analysisService';

// Mock the global fetch function
global.fetch = jest.fn();

describe('Analysis Service', () => {
  const mockResponse = (data: any) => ({
    ok: true,
    json: () => Promise.resolve(data)
  });

  const mockErrorResponse = (status: number) => ({
    ok: false,
    status,
    json: () => Promise.resolve({ message: 'Error occurred' })
  });

  beforeEach(() => {
    (global.fetch as jest.Mock).mockClear();
  });

  describe('fetchAnalysisData', () => {
    it('successfully fetches analysis data', async () => {
      const mockData = {
        riskScore: { score: 75, level: 'medium' },
        marketTrend: { direction: 'up', confidence: 0.8 },
        issues: [{ id: '1', severity: 'high' }],
        recommendations: [{ id: '1', priority: 'high' }]
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce(mockResponse(mockData));

      const result = await fetchAnalysisData();
      expect(result).toEqual(mockData);
      expect(global.fetch).toHaveBeenCalledWith(
        '/api/analysis/analyze',
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' }
        })
      );
    });

    it('handles API errors', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce(mockErrorResponse(500));

      await expect(fetchAnalysisData()).rejects.toThrow('Failed to fetch analysis data');
    });

    it('handles network errors', async () => {
      (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

      await expect(fetchAnalysisData()).rejects.toThrow('Network error');
    });
  });

  describe('fetchRiskScore', () => {
    it('successfully fetches risk score', async () => {
      const mockData = { score: 75, level: 'medium' };
      (global.fetch as jest.Mock).mockResolvedValueOnce(mockResponse(mockData));

      const result = await fetchRiskScore();
      expect(result).toEqual(mockData);
      expect(global.fetch).toHaveBeenCalledWith(
        '/api/analysis/risk-score',
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' }
        })
      );
    });

    it('handles API errors', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce(mockErrorResponse(404));

      await expect(fetchRiskScore()).rejects.toThrow('Failed to fetch risk score');
    });
  });

  describe('fetchIssues', () => {
    it('successfully fetches issues', async () => {
      const mockData = [{ id: '1', severity: 'high' }];
      (global.fetch as jest.Mock).mockResolvedValueOnce(mockResponse(mockData));

      const result = await fetchIssues();
      expect(result).toEqual(mockData);
      expect(global.fetch).toHaveBeenCalledWith(
        '/api/analysis/issues',
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' }
        })
      );
    });

    it('handles API errors', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce(mockErrorResponse(400));

      await expect(fetchIssues()).rejects.toThrow('Failed to fetch issues');
    });
  });

  describe('fetchRecommendations', () => {
    it('successfully fetches recommendations', async () => {
      const mockData = [{ id: '1', priority: 'high' }];
      (global.fetch as jest.Mock).mockResolvedValueOnce(mockResponse(mockData));

      const result = await fetchRecommendations();
      expect(result).toEqual(mockData);
      expect(global.fetch).toHaveBeenCalledWith(
        '/api/analysis/recommendations',
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' }
        })
      );
    });

    it('handles API errors', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce(mockErrorResponse(403));

      await expect(fetchRecommendations()).rejects.toThrow('Failed to fetch recommendations');
    });
  });

  it('handles malformed JSON responses', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.reject(new Error('Invalid JSON'))
    });

    await expect(fetchAnalysisData()).rejects.toThrow('Invalid JSON');
  });

  it('handles timeout scenarios', async () => {
    (global.fetch as jest.Mock).mockImplementationOnce(() => 
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Request timeout')), 100)
      )
    );

    await expect(fetchAnalysisData()).rejects.toThrow('Request timeout');
  });

  it('handles empty responses', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce(mockResponse({}));

    await expect(fetchAnalysisData()).rejects.toThrow('Invalid response data');
  });
}); 