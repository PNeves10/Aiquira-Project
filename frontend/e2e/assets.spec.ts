import { test, expect } from '@playwright/test';

test.describe('Assets Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/assets');
  });

  test('should display the assets page title', async ({ page }) => {
    await expect(page).toHaveTitle(/Assets/);
  });

  test('should display asset cards', async ({ page }) => {
    const assetCards = page.locator('[data-testid="asset-card"]');
    await expect(assetCards).toHaveCount(12); // Default page size
  });

  test('should filter assets by type', async ({ page }) => {
    await page.selectOption('[data-testid="type-filter"]', 'business');
    await page.waitForLoadState('networkidle');

    const assetCards = page.locator('[data-testid="asset-card"]');
    for (const card of await assetCards.all()) {
      await expect(card.locator('[data-testid="asset-type"]')).toHaveText('business');
    }
  });

  test('should search assets', async ({ page }) => {
    await page.fill('[data-testid="search-input"]', 'test');
    await page.waitForLoadState('networkidle');

    const assetCards = page.locator('[data-testid="asset-card"]');
    await expect(assetCards).toHaveCount(1); // Assuming one test asset
  });

  test('should navigate to asset details', async ({ page }) => {
    const firstAssetCard = page.locator('[data-testid="asset-card"]').first();
    const assetTitle = await firstAssetCard.locator('[data-testid="asset-title"]').textContent();
    
    await firstAssetCard.click();
    await page.waitForLoadState('networkidle');

    await expect(page.locator('h1')).toHaveText(assetTitle);
  });

  test('should handle pagination', async ({ page }) => {
    await page.click('[data-testid="next-page"]');
    await page.waitForLoadState('networkidle');

    const assetCards = page.locator('[data-testid="asset-card"]');
    await expect(assetCards).toHaveCount(12);
  });
}); 