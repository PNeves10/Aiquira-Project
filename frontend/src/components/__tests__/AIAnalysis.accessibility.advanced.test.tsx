import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import AIAnalysis from '../AIAnalysis';
import { portugueseMarketService } from '../../services/portugueseMarket';
import { AccessibilityThresholds } from '../../../performance/metrics.config';

expect.extend(toHaveNoViolations);

jest.mock('../../services/portugueseMarket');

describe('AIAnalysis Advanced Accessibility Tests', () => {
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

  it('should meet WCAG 2.1 Level AAA compliance', async () => {
    (portugueseMarketService.getAIAnalysis as jest.Mock).mockResolvedValue(mockAnalysisData);

    const { container } = render(<AIAnalysis assetId="test-asset-123" />);
    await waitFor(() => {
      expect(screen.getByTestId('ai-analysis-container')).toBeInTheDocument();
    });

    const results = await axe(container, {
      rules: {
        'color-contrast': { enabled: true },
        'aria-allowed-attr': { enabled: true },
        'aria-required-attr': { enabled: true },
        'aria-required-children': { enabled: true },
        'aria-required-parent': { enabled: true },
        'aria-roles': { enabled: true },
        'aria-valid-attr-value': { enabled: true },
        'aria-valid-attr': { enabled: true },
        'button-name': { enabled: true },
        'color-contrast-enhanced': { enabled: true },
        'document-title': { enabled: true },
        'html-has-lang': { enabled: true },
        'landmark-banner-is-top-level': { enabled: true },
        'landmark-complementary-is-top-level': { enabled: true },
        'landmark-contentinfo-is-top-level': { enabled: true },
        'landmark-main-is-top-level': { enabled: true },
        'landmark-navigation-is-top-level': { enabled: true },
        'landmark-region-is-top-level': { enabled: true },
        'landmark-one-main': { enabled: true },
        'page-has-heading-one': { enabled: true },
        'region': { enabled: true },
        'skip-link': { enabled: true },
      },
      checks: {
        'color-contrast': { enabled: true },
        'aria-allowed-attr': { enabled: true },
        'aria-required-attr': { enabled: true },
        'aria-required-children': { enabled: true },
        'aria-required-parent': { enabled: true },
        'aria-roles': { enabled: true },
        'aria-valid-attr-value': { enabled: true },
        'aria-valid-attr': { enabled: true },
        'button-name': { enabled: true },
        'color-contrast-enhanced': { enabled: true },
        'document-title': { enabled: true },
        'html-has-lang': { enabled: true },
        'landmark-banner-is-top-level': { enabled: true },
        'landmark-complementary-is-top-level': { enabled: true },
        'landmark-contentinfo-is-top-level': { enabled: true },
        'landmark-main-is-top-level': { enabled: true },
        'landmark-navigation-is-top-level': { enabled: true },
        'landmark-region-is-top-level': { enabled: true },
        'landmark-one-main': { enabled: true },
        'page-has-heading-one': { enabled: true },
        'region': { enabled: true },
        'skip-link': { enabled: true },
      },
    });

    expect(results).toHaveNoViolations();
  });

  it('should maintain accessibility with dynamic content updates', async () => {
    (portugueseMarketService.getAIAnalysis as jest.Mock).mockResolvedValue(mockAnalysisData);

    const { container, rerender } = render(<AIAnalysis assetId="test-asset-123" />);
    await waitFor(() => {
      expect(screen.getByTestId('ai-analysis-container')).toBeInTheDocument();
    });

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
    await waitFor(() => {
      expect(screen.getByTestId('ai-analysis-container')).toBeInTheDocument();
    });

    // Check after update
    results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('should handle screen reader announcements properly', async () => {
    (portugueseMarketService.getAIAnalysis as jest.Mock).mockResolvedValue(mockAnalysisData);

    const { container } = render(<AIAnalysis assetId="test-asset-123" />);
    await waitFor(() => {
      expect(screen.getByTestId('ai-analysis-container')).toBeInTheDocument();
    });

    // Check for live regions
    expect(container.querySelector('[aria-live="polite"]')).toBeInTheDocument();
    expect(container.querySelector('[aria-live="assertive"]')).toBeInTheDocument();

    // Check for proper announcement roles
    expect(container.querySelector('[role="alert"]')).toBeInTheDocument();
    expect(container.querySelector('[role="status"]')).toBeInTheDocument();
    expect(container.querySelector('[role="log"]')).toBeInTheDocument();

    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('should maintain proper focus management', async () => {
    (portugueseMarketService.getAIAnalysis as jest.Mock).mockResolvedValue(mockAnalysisData);

    const { container } = render(<AIAnalysis assetId="test-asset-123" />);
    await waitFor(() => {
      expect(screen.getByTestId('ai-analysis-container')).toBeInTheDocument();
    });

    // Check for focus trap
    expect(container.querySelector('[data-focus-trap]')).toBeInTheDocument();

    // Check for skip links
    expect(container.querySelector('[href="#main-content"]')).toBeInTheDocument();
    expect(container.querySelector('[href="#navigation"]')).toBeInTheDocument();

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

  it('should handle keyboard navigation with complex interactions', async () => {
    (portugueseMarketService.getAIAnalysis as jest.Mock).mockResolvedValue(mockAnalysisData);

    const { container } = render(<AIAnalysis assetId="test-asset-123" />);
    await waitFor(() => {
      expect(screen.getByTestId('ai-analysis-container')).toBeInTheDocument();
    });

    // Test keyboard navigation
    const focusableElements = container.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );

    // Test tab navigation
    for (let i = 0; i < focusableElements.length; i++) {
      const element = focusableElements[i] as HTMLElement;
      element.focus();
      expect(document.activeElement).toBe(element);
    }

    // Test arrow key navigation
    const listItems = container.querySelectorAll('[role="listitem"]');
    if (listItems.length > 0) {
      const firstItem = listItems[0] as HTMLElement;
      firstItem.focus();
      expect(document.activeElement).toBe(firstItem);
    }

    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('should maintain accessibility with different viewport sizes', async () => {
    (portugueseMarketService.getAIAnalysis as jest.Mock).mockResolvedValue(mockAnalysisData);

    const { container } = render(<AIAnalysis assetId="test-asset-123" />);
    await waitFor(() => {
      expect(screen.getByTestId('ai-analysis-container')).toBeInTheDocument();
    });

    // Test with different viewport sizes
    const viewportSizes = [
      { width: 320, height: 568 }, // Mobile
      { width: 768, height: 1024 }, // Tablet
      { width: 1024, height: 768 }, // Desktop
      { width: 1440, height: 900 }, // Large Desktop
    ];

    for (const size of viewportSizes) {
      // Simulate viewport size
      Object.defineProperty(window, 'innerWidth', { value: size.width });
      Object.defineProperty(window, 'innerHeight', { value: size.height });
      window.dispatchEvent(new Event('resize'));

      // Wait for any responsive updates
      await waitFor(() => {
        expect(screen.getByTestId('ai-analysis-container')).toHaveAttribute('data-responsive', 'true');
      });

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    }
  });

  it('should handle color contrast requirements for all text elements', async () => {
    (portugueseMarketService.getAIAnalysis as jest.Mock).mockResolvedValue(mockAnalysisData);

    const { container } = render(<AIAnalysis assetId="test-asset-123" />);
    await waitFor(() => {
      expect(screen.getByTestId('ai-analysis-container')).toBeInTheDocument();
    });

    // Check text elements for sufficient contrast
    const textElements = container.querySelectorAll('p, span, div, h1, h2, h3, h4, h5, h6');
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

  it('should handle RTL layout properly', async () => {
    (portugueseMarketService.getAIAnalysis as jest.Mock).mockResolvedValue(mockAnalysisData);

    // Set RTL direction
    document.documentElement.dir = 'rtl';
    document.documentElement.lang = 'ar';

    const { container } = render(<AIAnalysis assetId="test-asset-123" />);
    await waitFor(() => {
      expect(screen.getByTestId('ai-analysis-container')).toBeInTheDocument();
    });

    // Check for RTL-specific attributes
    expect(container.querySelector('[dir="rtl"]')).toBeInTheDocument();
    expect(container.querySelector('[lang="ar"]')).toBeInTheDocument();

    // Check for proper text alignment
    const textElements = container.querySelectorAll('p, span, div');
    textElements.forEach(element => {
      const style = window.getComputedStyle(element);
      expect(style.textAlign).toBe('right');
    });

    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
}); 