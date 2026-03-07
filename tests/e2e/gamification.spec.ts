import { test, expect } from '@playwright/test';

// ============================================================================
// QA PROTOCOL: Wave 84 — The Hunter's Guild Gamification
// ============================================================================
// 1. Page loads without WSOD.
// 2. Leaderboard Grid, Podium and Global Feed render.
// 3. User Seed ("Kritik Kara Para Aklama..." & "Deepfake...") visibly loads.
// ============================================================================

test.describe('🎮 HUNTERS GUILD GAMIFICATION E2E TEST', () => {
  test.use({ viewport: { width: 1440, height: 900 } });

  test('Gamification page loads without WSOD', async ({ page }) => {
    await page.goto('/academy/gamification');
    await page.waitForTimeout(3000);
    await expect(page.locator('body')).not.toBeEmpty();
    await expect(page.getByText('Müfettiş Performans Ligi')).toBeVisible({ timeout: 10000 });
  });

  test('Leaderboard and XP Streams render correctly from Supabase', async ({ page }) => {
    await page.goto('/academy/gamification');
    await page.waitForTimeout(3500);

    // Look for Podium 1st place Profile
    await expect(page.getByText('Ayşe Demir')).first().toBeVisible();
    await expect(page.getByText('Sentinel')).first().toBeVisible(); // Rarity/Rank
    
    // Look for Global XP streams explicitly checking for the specific seeds
    await expect(page.getByText('Kritik Kara Para Aklama')).first().toBeVisible();
    await expect(page.getByText('Deepfake Biyometrik Vakasını')).first().toBeVisible();
  });
});
