import React from 'react';
import { render } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import AIAnalysis from '../AIAnalysis';
import { portugueseMarketService } from '../../services/portugueseMarket';

// Extend Jest matchers with jest-axe
expect.extend(toHaveNoViolations);

// Mock the service
jest.mock('../../services/portugueseMarket');

describe('AIAnalysis Accessibility Tests', () => {
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

  it('should not have any accessibility violations in loading state', async () => {
    (portugueseMarketService.getAIAnalysis as jest.Mock).mockImplementation(() => 
      new Promise(resolve => setTimeout(() => resolve(mockAnalysisData), 100))
    );

    const { container } = render(<AIAnalysis assetId="test-asset-123" />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('should not have any accessibility violations in error state', async () => {
    (portugueseMarketService.getAIAnalysis as jest.Mock).mockRejectedValue(
      new Error('Test error')
    );

    const { container } = render(<AIAnalysis assetId="test-asset-123" />);
    // Wait for error state to be rendered
    await new Promise(resolve => setTimeout(resolve, 100));
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('should not have any accessibility violations in success state', async () => {
    (portugueseMarketService.getAIAnalysis as jest.Mock).mockResolvedValue(mockAnalysisData);

    const { container } = render(<AIAnalysis assetId="test-asset-123" />);
    // Wait for success state to be rendered
    await new Promise(resolve => setTimeout(resolve, 100));
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('should have proper ARIA labels and roles', async () => {
    (portugueseMarketService.getAIAnalysis as jest.Mock).mockResolvedValue(mockAnalysisData);

    const { container } = render(<AIAnalysis assetId="test-asset-123" />);
    await new Promise(resolve => setTimeout(resolve, 100));

    // Check for proper ARIA labels
    expect(container.querySelector('[aria-label="Risk Score"]')).toBeInTheDocument();
    expect(container.querySelector('[aria-label="Market Insights"]')).toBeInTheDocument();
    expect(container.querySelector('[aria-label="Recommendations"]')).toBeInTheDocument();
    expect(container.querySelector('[aria-label="Issues"]')).toBeInTheDocument();

    // Check for proper roles
    expect(container.querySelector('[role="alert"]')).toBeInTheDocument();
    expect(container.querySelector('[role="progressbar"]')).toBeInTheDocument();
    expect(container.querySelector('[role="list"]')).toBeInTheDocument();
    expect(container.querySelector('[role="listitem"]')).toBeInTheDocument();

    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('should maintain accessibility with dynamic content updates', async () => {
    (portugueseMarketService.getAIAnalysis as jest.Mock).mockResolvedValue(mockAnalysisData);

    const { container, rerender } = render(<AIAnalysis assetId="test-asset-123" />);
    await new Promise(resolve => setTimeout(resolve, 100));

    // Initial check
    let results = await axe(container);
    expect(results).toHaveNoViolations();

    // Update with new data
    const updatedData = {
      ...mockAnalysisData,
      riskScore: 75,
      recommendations: ['Updated recommendation'],
    };
    (portugueseMarketService.getAIAnalysis as jest.Mock).mockResolvedValue(updatedData);
    rerender(<AIAnalysis assetId="test-asset-123" />);
    await new Promise(resolve => setTimeout(resolve, 100));

    // Check after update
    results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('should handle keyboard navigation properly', async () => {
    (portugueseMarketService.getAIAnalysis as jest.Mock).mockResolvedValue(mockAnalysisData);

    const { container } = render(<AIAnalysis assetId="test-asset-123" />);
    await new Promise(resolve => setTimeout(resolve, 100));

    // Check for focusable elements
    const focusableElements = container.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    expect(focusableElements.length).toBeGreaterThan(0);

    // Check for proper tab order
    const firstFocusable = focusableElements[0] as HTMLElement;
    firstFocusable.focus();
    expect(document.activeElement).toBe(firstFocusable);

    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('should maintain accessibility with different screen sizes', async () => {
    (portugueseMarketService.getAIAnalysis as jest.Mock).mockResolvedValue(mockAnalysisData);

    const { container } = render(<AIAnalysis assetId="test-asset-123" />);
    await new Promise(resolve => setTimeout(resolve, 100));

    // Test with different viewport sizes
    const viewportSizes = [
      { width: 320, height: 568 }, // Mobile
      { width: 768, height: 1024 }, // Tablet
      { width: 1024, height: 768 }, // Desktop
    ];

    for (const size of viewportSizes) {
      // Simulate viewport size
      Object.defineProperty(window, 'innerWidth', { value: size.width });
      Object.defineProperty(window, 'innerHeight', { value: size.height });
      window.dispatchEvent(new Event('resize'));

      // Wait for any responsive updates
      await new Promise(resolve => setTimeout(resolve, 100));

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    }
  });

  it('should handle color contrast requirements', async () => {
    (portugueseMarketService.getAIAnalysis as jest.Mock).mockResolvedValue(mockAnalysisData);

    const { container } = render(<AIAnalysis assetId="test-asset-123" />);
    await new Promise(resolve => setTimeout(resolve, 100));

    // Check text elements for sufficient contrast
    const textElements = container.querySelectorAll('p, span, div');
    textElements.forEach(element => {
      const style = window.getComputedStyle(element);
      const backgroundColor = style.backgroundColor;
      const color = style.color;
      
      // Basic contrast check (can be enhanced with a proper contrast calculation library)
      expect(backgroundColor).not.toBe(color);
    });

    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
}); 