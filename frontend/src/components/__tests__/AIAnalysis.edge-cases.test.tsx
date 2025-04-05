import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import AIAnalysis from '../AIAnalysis';
import { portugueseMarketService } from '../../services/portugueseMarket';

jest.mock('../../services/portugueseMarket');

describe('AIAnalysis Edge Cases', () => {
  const mockAnalysisData = {
    riskScore: 45,
    recommendations: ['Test recommendation'],
    marketInsights: {
      trend: 'positive',
      confidence: 0.85,
      factors: ['Test factor'],
    },
    complianceScore: 75,
    issues: [{
      severity: 'high',
      description: 'Test issue',
      impact: 'Test impact',
      resolution: 'Test resolution',
    }],
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should handle extremely large datasets', async () => {
    const largeDataset = {
      ...mockAnalysisData,
      recommendations: Array(1000).fill('Test recommendation'),
      marketInsights: {
        ...mockAnalysisData.marketInsights,
        factors: Array(500).fill('Test factor'),
      },
      issues: Array(500).fill({
        severity: 'high',
        description: 'Test issue',
        impact: 'Test impact',
        resolution: 'Test resolution',
      }),
    };

    (portugueseMarketService.getAIAnalysis as jest.Mock).mockResolvedValue(largeDataset);

    render(<AIAnalysis assetId="test-asset-123" />);
    
    // Wait for initial load
    await waitFor(() => {
      expect(screen.getByTestId('ai-analysis-container')).toBeInTheDocument();
    });

    // Verify pagination or virtualization is working
    expect(screen.getByTestId('recommendations-list')).toHaveAttribute('data-virtualized', 'true');
  });

  it('should handle malformed API responses', async () => {
    const malformedData = {
      riskScore: 'invalid',
      recommendations: null,
      marketInsights: undefined,
      complianceScore: 'not-a-number',
      issues: 'not-an-array',
    };

    (portugueseMarketService.getAIAnalysis as jest.Mock).mockResolvedValue(malformedData);

    render(<AIAnalysis assetId="test-asset-123" />);
    
    await waitFor(() => {
      expect(screen.getByTestId('error-message')).toBeInTheDocument();
      expect(screen.getByText(/Invalid data format/i)).toBeInTheDocument();
    });
  });

  it('should handle network timeouts', async () => {
    (portugueseMarketService.getAIAnalysis as jest.Mock).mockImplementation(() => 
      new Promise((_, reject) => setTimeout(() => reject(new Error('Network timeout')), 10000))
    );

    render(<AIAnalysis assetId="test-asset-123" />);
    
    await waitFor(() => {
      expect(screen.getByTestId('error-message')).toBeInTheDocument();
      expect(screen.getByText(/Request timeout/i)).toBeInTheDocument();
    });
  });

  it('should handle rapid user interactions', async () => {
    (portugueseMarketService.getAIAnalysis as jest.Mock).mockResolvedValue(mockAnalysisData);

    render(<AIAnalysis assetId="test-asset-123" />);
    
    const input = screen.getByTestId('asset-id-input');
    const analyzeButton = screen.getByTestId('analyze-button');

    // Simulate rapid typing and clicking
    for (let i = 0; i < 10; i++) {
      await userEvent.type(input, `test-${i}`);
      await userEvent.click(analyzeButton);
      await new Promise(resolve => setTimeout(resolve, 50));
    }

    // Verify only the last request was processed
    expect(portugueseMarketService.getAIAnalysis).toHaveBeenCalledTimes(1);
  });

  it('should handle concurrent requests', async () => {
    const requests = Array(5).fill(null).map((_, i) => ({
      ...mockAnalysisData,
      riskScore: 45 + i,
    }));

    (portugueseMarketService.getAIAnalysis as jest.Mock).mockImplementation((id) => 
      new Promise(resolve => setTimeout(() => resolve(requests[parseInt(id.split('-')[1])]), 100))
    );

    render(<AIAnalysis assetId="test-asset-0" />);
    
    // Trigger multiple concurrent requests
    const analyzeButton = screen.getByTestId('analyze-button');
    for (let i = 0; i < 5; i++) {
      await userEvent.click(analyzeButton);
      await new Promise(resolve => setTimeout(resolve, 50));
    }

    // Verify request cancellation and latest result
    await waitFor(() => {
      expect(screen.getByTestId('risk-score')).toHaveTextContent('49');
    });
  });

  it('should handle browser offline state', async () => {
    // Simulate offline state
    Object.defineProperty(navigator, 'onLine', {
      value: false,
      configurable: true,
    });

    (portugueseMarketService.getAIAnalysis as jest.Mock).mockRejectedValue(new Error('Network error'));

    render(<AIAnalysis assetId="test-asset-123" />);
    
    await waitFor(() => {
      expect(screen.getByTestId('offline-message')).toBeInTheDocument();
      expect(screen.getByText(/You are offline/i)).toBeInTheDocument();
    });
  });

  it('should handle memory pressure', async () => {
    const largeDataset = {
      ...mockAnalysisData,
      recommendations: Array(10000).fill('Test recommendation'),
      marketInsights: {
        ...mockAnalysisData.marketInsights,
        factors: Array(5000).fill('Test factor'),
      },
    };

    (portugueseMarketService.getAIAnalysis as jest.Mock).mockResolvedValue(largeDataset);

    render(<AIAnalysis assetId="test-asset-123" />);
    
    // Verify memory-efficient rendering
    await waitFor(() => {
      expect(screen.getByTestId('ai-analysis-container')).toHaveAttribute('data-memory-optimized', 'true');
    });
  });

  it('should handle rapid viewport changes', async () => {
    (portugueseMarketService.getAIAnalysis as jest.Mock).mockResolvedValue(mockAnalysisData);

    render(<AIAnalysis assetId="test-asset-123" />);
    
    // Simulate rapid viewport changes
    for (let i = 0; i < 10; i++) {
      window.innerWidth = 320 + (i * 100);
      window.innerHeight = 568 + (i * 100);
      window.dispatchEvent(new Event('resize'));
      await new Promise(resolve => setTimeout(resolve, 50));
    }

    // Verify responsive layout stability
    await waitFor(() => {
      expect(screen.getByTestId('ai-analysis-container')).toHaveAttribute('data-layout-stable', 'true');
    });
  });

  it('should handle language changes', async () => {
    (portugueseMarketService.getAIAnalysis as jest.Mock).mockResolvedValue(mockAnalysisData);

    render(<AIAnalysis assetId="test-asset-123" />);
    
    // Simulate language changes
    const languages = ['en', 'pt', 'es', 'fr'];
    for (const lang of languages) {
      document.documentElement.lang = lang;
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    // Verify proper text direction and translations
    await waitFor(() => {
      expect(screen.getByTestId('ai-analysis-container')).toHaveAttribute('dir', 'ltr');
    });
  });
}); 