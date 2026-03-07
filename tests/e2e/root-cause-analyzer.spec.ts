import { test, expect } from '@playwright/test';

// ============================================================================
// QA PROTOCOL: Wave 55 — Root Cause & 5-Whys Analyzer
// ============================================================================
// 1. RCA list page loads without WSOD.
// 2. "Yetkisiz Erişim" analysis appears in the list from Supabase.
// 3. Opening an analysis shows the numbered Why steps tree.
// 4. Root cause highlight panel appears for completed step 5.
// ============================================================================

test.describe('🔍 ROOT CAUSE 5-WHYS ANALYZER E2E TEST', () => {
  test.use({ viewport: { width: 1440, height: 900 } });

  test('Root Cause Analyzer page loads without WSOD', async ({ page }) => {
    await page.goto('/root-cause');
    await page.waitForTimeout(3000);
    await expect(page.locator('body')).not.toBeEmpty();
  });

  test('Analysis list shows seeded data from Supabase', async ({ page }) => {
    await page.goto('/root-cause');
    await page.waitForTimeout(3500);
    await expect(page.getByText('Yetkisiz Sistem Erişimi')).toBeVisible({ timeout: 10000 });
  });

  test('Five Whys tabular tree renders with numbered steps', async ({ page }) => {
    await page.goto('/root-cause');
    await page.waitForTimeout(3000);

    const analysisCard = page.getByText('Yetkisiz Sistem Erişimi').first();
    if (await analysisCard.isVisible()) {
      await analysisCard.click();
      await page.waitForTimeout(2500);

      // Step number badges should appear
      await expect(page.getByText('Neden #1')).toBeVisible({ timeout: 8000 });
      await expect(page.getByText('Neden #5')).toBeVisible();

      // Root cause highlight panel
      await expect(page.getByText('Tespit Edilen Kök Neden')).toBeVisible();
    }
  });
});
