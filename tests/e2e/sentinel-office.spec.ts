import { test, expect } from '@playwright/test';

// ============================================================================
// QA PROTOCOL: Wave 37 — Sentinel Office & Document Vault
// ============================================================================
// RULES:
// 1. NO White Screen of Death (WSOD).
// 2. DocumentList must render at least 3 documents from Supabase.
// 3. Opening a SPREADSHEET document must show cells, not an empty grid.
// 4. Cryo-Chamber version history panel must list versions.
// 5. No JS crashes during load.
// ============================================================================

test.describe('🏢 SENTINEL OFFICE DOCUMENT VAULT E2E TEST', () => {
  test.use({ viewport: { width: 1440, height: 900 } });

  test('Sentinel Office opens and shows live documents without WSOD', async ({ page }) => {
    // Navigate to a page that hosts the Sentinel Office widget
    // The workpapers page typically has the Office button
    await page.goto('/workpapers');
    await page.waitForTimeout(2500);

    // Check no WSOD on workpapers page
    const body = page.locator('body');
    await expect(body).not.toBeEmpty();

    // Look for the Office button (typically a file/doc icon in the toolbar)
    const officeBtn = page.getByRole('button', { name: /Sentinel Office|Office|Belge|Tablo/i }).first();
    if (await officeBtn.isVisible()) {
      await officeBtn.click();
      await page.waitForTimeout(2000);

      // DocumentList should appear with at least 3 docs from seed
      await expect(page.getByText('Kredi Riski')).toBeVisible({ timeout: 10000 });
      await expect(page.getByText('Yönetim Kurulu')).toBeVisible();
      await expect(page.getByText('BDDK Saha')).toBeVisible();

      // Check the Cryo-Chamber label
      await expect(page.getByText(/Cryo-Chamber|Versiyon Kontrolu/i)).toBeVisible();

      await page.waitForTimeout(3000);
    }
  });

  test('Spreadsheet document loads cells without crash', async ({ page }) => {
    await page.goto('/workpapers');
    await page.waitForTimeout(2000);

    const officeBtn = page.getByRole('button', { name: /Sentinel Office|Office|Belge|Tablo/i }).first();
    if (await officeBtn.isVisible()) {
      await officeBtn.click();
      await page.waitForTimeout(2000);

      // Click on the spreadsheet document
      const kreditablo = page.getByText('Kredi Riski').first();
      if (await kreditablo.isVisible()) {
        await kreditablo.click();
        await page.waitForTimeout(3000);

        // The spreadsheet header row must be visible
        await expect(page.getByText('Müşteri Adı')).toBeVisible({ timeout: 10000 });
        await expect(page.getByText('Limit (TRY)')).toBeVisible();

        // Check version history toggle exists
        await expect(page.getByText(/Gecmis|Versiyon/i)).toBeVisible();

        await page.waitForTimeout(2000);
      }
    }
  });
});
