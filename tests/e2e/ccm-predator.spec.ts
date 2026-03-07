import { test, expect } from '@playwright/test';

// ─── HELPER: AUTHENTICATED LOGIN ─────────────────────────────────────────────
async function loginAndSaveState(page: any) {
  // Navigate to root first to ensure origin exists for localStorage
  await page.goto('http://localhost:5173', { waitUntil: 'domcontentloaded' });
  
  await page.evaluate(() => {
    localStorage.setItem('sentinel-tenant-id', '11111111-1111-1111-1111-111111111111');
    localStorage.setItem('isAuthenticated', 'true');
    localStorage.setItem('sentinel_token', 'mock-token');
  });
}

// Ekranları görebilmeniz için yavaşlatıldı
test.use({ launchOptions: { slowMo: 3000 } });

test.describe('🔄 SENTINEL V3.0 CCM PREDATOR COCKPIT E2E TEST', () => {

  test.beforeEach(async ({ page }) => {
    // Navigate to local instance (assuming the frontend is running on localhost:5173)
    await loginAndSaveState(page);
  });

  test('Predator Cockpit should load without WSOD (White Screen of Death) and display real signals', async ({ page }) => {
    // 1. Navigate to CCM Predator
    await page.goto('http://localhost:5173/ccm/predator');

    // 2. Validate no Error Title (Crash Check)
    await expect(page).not.toHaveTitle(/Error/i);

    // 3. Ensure the main title is visible
    await expect(page.locator('text=Predator Cockpit')).toBeVisible({ timeout: 10000 });

    // 4. Verify that live stats are rendering successfully (no NaN)
    await expect(page.locator('text=NaN')).toHaveCount(0);

    // Wait for the data to load before attempting to scan
    await expect(page.getByText('Uyarılar yükleniyor...')).toHaveCount(0, { timeout: 15000 });
    
    // Check that we have stats (meaning data has loaded, not 0 if possible, but at least IDLE is there)
    await expect(page.getByText('IDLE', { exact: true })).toBeVisible();

    // The data fetch might still be happening in the background. Wait for a seeded alert to appear in the table:
    await expect(page.getByText('Unusual Hours', { exact: true }).first()).toBeVisible({ timeout: 15000 });


    // 5. Test the Live Scanner
    // The LiveScanner button should be visible
    const scanButton = page.locator('button', { hasText: 'Start Scan' });
    await expect(scanButton).toBeVisible();
    await scanButton.click();

    // 6. After the click, the scan runs. Because of slowMo: 3000, 
    // the short scan finishes before Playwright executes the next assertion.
    // Instead of checking 'ACTIVE', we check for the successful completion message.
    // 6. Check for the successful completion message.
    await expect(page.getByText('Tarama Tamamlandı')).toBeVisible({ timeout: 15000 });
  });
});
