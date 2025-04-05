import { test, expect } from '@playwright/test';

test.describe('Portuguese Market Performance Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3000');
  });

  test('should load AI analysis within performance budget', async ({ page }) => {
    // Start performance measurement
    const startTime = Date.now();

    // Enter asset ID and trigger analysis
    await page.fill('[data-testid="asset-id-input"]', 'test-asset-123');
    await page.click('[data-testid="analyze-button"]');

    // Wait for all components to load
    await Promise.all([
      page.waitForSelector('[data-testid="risk-score"]'),
      page.waitForSelector('[data-testid="market-insights"]'),
      page.waitForSelector('[data-testid="recommendations"]'),
      page.waitForSelector('[data-testid="issues"]'),
    ]);

    // Calculate load time
    const loadTime = Date.now() - startTime;

    // Assert performance budget (e.g., 2 seconds)
    expect(loadTime).toBeLessThan(2000);
  });

  test('should maintain performance with large datasets', async ({ page }) => {
    // Mock large dataset response
    await page.route('**/api/ai-analysis/**', async (route) => {
      const largeDataset = {
        riskScore: 45,
        recommendations: Array(50).fill('Test recommendation'),
        marketInsights: {
          trend: 'positive',
          confidence: 0.85,
          factors: Array(20).fill('Test factor'),
        },
        complianceScore: 75,
        issues: Array(30).fill({
          severity: 'high',
          description: 'Test issue',
          impact: 'Test impact',
          resolution: 'Test resolution',
        }),
      };
      await route.fulfill({ json: largeDataset });
    });

    // Start performance measurement
    const startTime = Date.now();

    // Trigger analysis with large dataset
    await page.fill('[data-testid="asset-id-input"]', 'test-asset-123');
    await page.click('[data-testid="analyze-button"]');

    // Wait for rendering
    await page.waitForSelector('[data-testid="ai-analysis-container"]');

    // Calculate render time
    const renderTime = Date.now() - startTime;

    // Assert performance budget (e.g., 3 seconds for large dataset)
    expect(renderTime).toBeLessThan(3000);
  });

  test('should handle rapid user interactions', async ({ page }) => {
    // Start performance measurement
    const startTime = Date.now();

    // Simulate rapid user interactions
    for (let i = 0; i < 5; i++) {
      await page.fill('[data-testid="asset-id-input"]', `test-asset-${i}`);
      await page.click('[data-testid="analyze-button"]');
      await page.waitForTimeout(100); // Small delay between interactions
    }

    // Calculate total interaction time
    const interactionTime = Date.now() - startTime;

    // Assert performance budget (e.g., 5 seconds for 5 interactions)
    expect(interactionTime).toBeLessThan(5000);
  });

  test('should maintain smooth animations', async ({ page }) => {
    // Enter asset ID
    await page.fill('[data-testid="asset-id-input"]', 'test-asset-123');
    await page.click('[data-testid="analyze-button"]');

    // Wait for initial render
    await page.waitForSelector('[data-testid="ai-analysis-container"]');

    // Measure animation performance
    const animationStartTime = Date.now();
    await page.waitForSelector('[data-testid="risk-score"]', { state: 'visible' });
    const animationTime = Date.now() - animationStartTime;

    // Assert animation performance (e.g., 500ms)
    expect(animationTime).toBeLessThan(500);
  });

  test('should handle concurrent API requests efficiently', async ({ page }) => {
    // Start performance measurement
    const startTime = Date.now();

    // Trigger multiple concurrent requests
    const requests = Array(3).fill(null).map(async () => {
      await page.fill('[data-testid="asset-id-input"]', 'test-asset-123');
      await page.click('[data-testid="analyze-button"]');
      await page.waitForSelector('[data-testid="ai-analysis-container"]');
    });

    // Wait for all requests to complete
    await Promise.all(requests);

    // Calculate total time
    const totalTime = Date.now() - startTime;

    // Assert performance budget (e.g., 4 seconds for 3 concurrent requests)
    expect(totalTime).toBeLessThan(4000);
  });

  test('should maintain performance during data updates', async ({ page }) => {
    // Initial load
    await page.fill('[data-testid="asset-id-input"]', 'test-asset-123');
    await page.click('[data-testid="analyze-button"]');
    await page.waitForSelector('[data-testid="ai-analysis-container"]');

    // Start performance measurement for updates
    const startTime = Date.now();

    // Simulate data updates
    for (let i = 0; i < 3; i++) {
      await page.route('**/api/ai-analysis/**', async (route) => {
        await route.fulfill({
          json: {
            riskScore: 45 + i,
            recommendations: ['Updated recommendation'],
            marketInsights: {
              trend: 'positive',
              confidence: 0.85,
              factors: ['Updated factor'],
            },
            complianceScore: 75,
            issues: [{
              severity: 'high',
              description: 'Updated issue',
              impact: 'Updated impact',
              resolution: 'Updated resolution',
            }],
          },
        });
      });

      await page.click('[data-testid="refresh-button"]');
      await page.waitForSelector('[data-testid="ai-analysis-container"]');
    }

    // Calculate update time
    const updateTime = Date.now() - startTime;

    // Assert performance budget (e.g., 2 seconds for 3 updates)
    expect(updateTime).toBeLessThan(2000);
  });

  test('should maintain responsive UI during heavy operations', async ({ page }) => {
    // Start performance measurement
    const startTime = Date.now();

    // Trigger heavy operation
    await page.fill('[data-testid="asset-id-input"]', 'test-asset-123');
    await page.click('[data-testid="analyze-button"]');

    // Simulate user interaction during heavy operation
    const interactionStartTime = Date.now();
    await page.mouse.move(100, 100);
    await page.mouse.click(100, 100);
    const interactionTime = Date.now() - interactionStartTime;

    // Assert UI responsiveness (e.g., interaction should complete within 100ms)
    expect(interactionTime).toBeLessThan(100);

    // Wait for operation to complete
    await page.waitForSelector('[data-testid="ai-analysis-container"]');
    const totalTime = Date.now() - startTime;

    // Assert total operation time
    expect(totalTime).toBeLessThan(3000);
  });
}); 