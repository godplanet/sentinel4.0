import { test, expect } from '@playwright/test';

// ============================================================================
// QA PROTOCOL: Wave 71 — BoD Evaluation & Skill Matrix
// ============================================================================
// 1. Page loads without WSOD.
// 2. Skill Matrix KPI components load gracefully.
// 3. User can click a board member and rendering updates.
// 4. Supabase seed text elements (IT Odaklı, Siber Güvenlik) are displayed.
// ============================================================================

test.describe('📊 BoD EVALUATION & SKILL MATRIX E2E TEST', () => {
  test.use({ viewport: { width: 1440, height: 900 } });

  test('Board Evaluation Skill Matrix page loads without WSOD', async ({ page }) => {
    await page.goto('/governance/board-evaluation');
    await page.waitForTimeout(3000);
    await expect(page.locator('body')).not.toBeEmpty();
    await expect(page.getByText('BoD Evaluation & Skill Matrix')).toBeVisible({ timeout: 10000 });
  });

  test('Board Members list and Radar logic loads from Supabase', async ({ page }) => {
    await page.goto('/governance/board-evaluation');
    await page.waitForTimeout(3500);

    // Assert Board Member profile button exists
    await expect(page.getByText('Mehmet Öztürk')).toBeVisible({ timeout: 10000 });
    await expect(page.getByText('YK Üyeleri Profilleri')).toBeVisible();

    // Click the IT focused member
    await page.getByText('Mehmet Öztürk').click();
    await page.waitForTimeout(1000);

    // Verify individual radar view header matches name
    await expect(page.getByText('Bireysel Yetkinlik Matrisi')).toBeVisible();
    await expect(page.getByText('Siber Güvenlik')).first().toBeVisible();
  });
});
