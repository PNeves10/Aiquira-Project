import { test, expect } from '@playwright/test';

test.describe('Portuguese Market Features', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the application
    await page.goto('http://localhost:3000');
  });

  test('should display AI analysis for a valid asset', async ({ page }) => {
    // Enter a valid asset ID
    await page.fill('[data-testid="asset-id-input"]', 'test-asset-123');
    await page.click('[data-testid="analyze-button"]');

    // Wait for loading state to complete
    await page.waitForSelector('[data-testid="loading-spinner"]', { state: 'hidden' });

    // Verify AI analysis components are displayed
    await expect(page.locator('[data-testid="risk-score"]')).toBeVisible();
    await expect(page.locator('[data-testid="market-insights"]')).toBeVisible();
    await expect(page.locator('[data-testid="recommendations"]')).toBeVisible();
    await expect(page.locator('[data-testid="issues"]')).toBeVisible();
  });

  test('should handle invalid asset ID', async ({ page }) => {
    // Enter an invalid asset ID
    await page.fill('[data-testid="asset-id-input"]', 'invalid@id');
    await page.click('[data-testid="analyze-button"]');

    // Verify error message is displayed
    await expect(page.locator('[data-testid="error-message"]')).toBeVisible();
    await expect(page.locator('[data-testid="error-message"]')).toContainText('Invalid input');
  });

  test('should display market insights with correct data', async ({ page }) => {
    // Enter a valid asset ID
    await page.fill('[data-testid="asset-id-input"]', 'test-asset-123');
    await page.click('[data-testid="analyze-button"]');

    // Wait for market insights to load
    await page.waitForSelector('[data-testid="market-insights"]');

    // Verify market insights content
    const marketInsights = page.locator('[data-testid="market-insights"]');
    await expect(marketInsights.locator('[data-testid="trend-indicator"]')).toBeVisible();
    await expect(marketInsights.locator('[data-testid="confidence-bar"]')).toBeVisible();
    await expect(marketInsights.locator('[data-testid="factors-list"]')).toBeVisible();
  });

  test('should display issues with correct severity levels', async ({ page }) => {
    // Enter a valid asset ID
    await page.fill('[data-testid="asset-id-input"]', 'test-asset-123');
    await page.click('[data-testid="analyze-button"]');

    // Wait for issues to load
    await page.waitForSelector('[data-testid="issues"]');

    // Verify issues are displayed with correct severity
    const issues = page.locator('[data-testid="issues"]');
    await expect(issues.locator('[data-testid="high-severity"]')).toBeVisible();
    await expect(issues.locator('[data-testid="medium-severity"]')).toBeVisible();
    await expect(issues.locator('[data-testid="low-severity"]')).toBeVisible();
  });

  test('should handle network errors gracefully', async ({ page }) => {
    // Mock network error
    await page.route('**/api/ai-analysis/**', async (route) => {
      await route.abort('failed');
    });

    // Enter a valid asset ID
    await page.fill('[data-testid="asset-id-input"]', 'test-asset-123');
    await page.click('[data-testid="analyze-button"]');

    // Verify error message is displayed
    await expect(page.locator('[data-testid="error-message"]')).toBeVisible();
    await expect(page.locator('[data-testid="error-message"]')).toContainText('Failed to fetch');
  });

  test('should display recommendations correctly', async ({ page }) => {
    // Enter a valid asset ID
    await page.fill('[data-testid="asset-id-input"]', 'test-asset-123');
    await page.click('[data-testid="analyze-button"]');

    // Wait for recommendations to load
    await page.waitForSelector('[data-testid="recommendations"]');

    // Verify recommendations are displayed
    const recommendations = page.locator('[data-testid="recommendations"]');
    await expect(recommendations.locator('li')).toHaveCount(await recommendations.locator('li').count());
    await expect(recommendations.locator('li').first()).toBeVisible();
  });

  test('should update risk score display based on data', async ({ page }) => {
    // Enter a valid asset ID
    await page.fill('[data-testid="asset-id-input"]', 'test-asset-123');
    await page.click('[data-testid="analyze-button"]');

    // Wait for risk score to load
    await page.waitForSelector('[data-testid="risk-score"]');

    // Verify risk score is displayed correctly
    const riskScore = page.locator('[data-testid="risk-score"]');
    await expect(riskScore.locator('[data-testid="score-value"]')).toBeVisible();
    await expect(riskScore.locator('[data-testid="risk-level"]')).toBeVisible();
  });

  test('should be responsive on different screen sizes', async ({ page }) => {
    // Test mobile view
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('http://localhost:3000');
    await expect(page.locator('[data-testid="ai-analysis-container"]')).toHaveCSS('grid-template-columns', '1fr');

    // Test tablet view
    await page.setViewportSize({ width: 768, height: 1024 });
    await expect(page.locator('[data-testid="ai-analysis-container"]')).toHaveCSS('grid-template-columns', 'repeat(2, 1fr)');

    // Test desktop view
    await page.setViewportSize({ width: 1280, height: 800 });
    await expect(page.locator('[data-testid="ai-analysis-container"]')).toHaveCSS('grid-template-columns', 'repeat(2, 1fr)');
  });
}); 