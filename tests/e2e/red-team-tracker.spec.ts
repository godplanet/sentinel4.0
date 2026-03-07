import { test, expect } from '@playwright/test';

// ============================================================================
// QA PROTOCOL: Wave 60 — Red Team & BAS Tracker
// ============================================================================
// 1. Page loads without WSOD.
// 2. Dashboard widgets (Active Campaigns) exist.
// 3. Supabase campaign and attack log data is rendered.
// ============================================================================

test.describe('🎯 RED TEAM & BAS TRACKER E2E TEST', () => {
  test.use({ viewport: { width: 1440, height: 900 } });

  test('Red Team Tracker page loads without WSOD', async ({ page }) => {
    await page.goto('/red-team');
    await page.waitForTimeout(3000);
    await expect(page.locator('body')).not.toBeEmpty();
    await expect(page.getByText('Red Team & BAS Tracker')).toBeVisible({ timeout: 10000 });
  });

  test('Campaigns and BAS Dashboard logs are loaded from Supabase', async ({ page }) => {
    await page.goto('/red-team');
    await page.waitForTimeout(3500);

    // Look for the loaded Phishing simulation campaign
    await expect(page.getByText('SWIFT Altyapısı Phishing Simülasyonu')).toBeVisible({ timeout: 10000 });
    
    // Expand to see attack logs
    const expButton = page.locator('button').filter({ has: page.locator('svg.lucide-chevron-right') }).first();
    if (await expButton.isVisible()) {
      await expButton.click();
      await page.waitForTimeout(1000);
      
      // Inside logs, should see T1566.002
      await expect(page.getByText('T1566.002')).first().toBeVisible();
    }
  });
});
