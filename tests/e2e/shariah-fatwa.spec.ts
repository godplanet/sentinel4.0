import { test, expect } from '@playwright/test';

// ─── HELPER: AUTHENTICATED LOGIN (MOCK CACHE) ────────────────────────────────
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

test.describe('🕌 SENTINEL V3.0 FATWA-GPT RAG ENGINE E2E TEST', () => {

  test.beforeEach(async ({ page }) => {
    // Navigate to local instance via bypass login
    await loginAndSaveState(page);
  });

  test('Fatwa-GPT should render correctly and process queries using live Supabase standards', async ({ page }) => {
    // 1. Navigate to FatwaGPT Page
    await page.goto('http://localhost:5173/shariah/fatwa-gpt');

    // 2. Validate no Error Title (WSOD Crash Check)
    await expect(page).not.toHaveTitle(/Error/i);

    // 3. Wait for the page content to load
    await expect(page.locator('h1', { hasText: 'Fetva-GPT' })).toBeVisible({ timeout: 10000 });

    // 4. Validate that the React Query successfully loaded live data count from Supabase
    // If we have "17 Standart", it means it read our seeded data.
    // It shouldn't get stuck at "..." or throw NaN
    await expect(page.locator('span', { hasText: /^\d+ Standart$/ })).toBeVisible();

    // 5. Test the Input mechanics by typing a risky question concerning Ribaa
    const queryInput = page.locator('textarea[placeholder*="Örnek: Arabayı"]');
    await expect(queryInput).toBeVisible();
    await queryInput.fill('Organize Teverruk sistemini uygulayabilir miyiz?');
    
    // 6. Submit the Fatwa inquiry via Enter key (which fires handleSubmit)
    await queryInput.press('Enter');

    // 7. Verify the output rendering (Checking for defensive design breaking points)
    // Should clearly show the answer and it shouldn't crash
    const answerContainer = page.locator('text=CAİZ DEĞİLDİR').first();
    await expect(answerContainer).toBeVisible({ timeout: 15000 });

    // 8. Verify risk tagging (Critical Risk label must show up given our seed data)
    await expect(page.locator('text=KRİTİK RİSK').first()).toBeVisible();

    // 9. Check the citation card references
    await expect(page.locator('text=AAOIFI Standard No. 30: Teverruk').first()).toBeVisible();

    // 10. Check sidebar history rendering to ensure state hooks didn't crash
    await expect(page.locator('h3', { hasText: 'Son Sorgular' })).toBeVisible();
  });
});
