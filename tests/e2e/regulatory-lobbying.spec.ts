import { test, expect } from '@playwright/test';

// ============================================================================
// QA PROTOCOL: Wave 81 — Regulatory Lobbying AI (Auto-Responder)
// ============================================================================
// 1. Page loads without WSOD.
// 2. Draft inbox and AI responder modules exist.
// 3. Sentimental LLM synthesis (BDDK message) renders from Supabase securely.
// ============================================================================

test.describe('⚖️ REGULATORY LOBBYING AI E2E TEST', () => {
  test.use({ viewport: { width: 1440, height: 900 } });

  test('Regulatory Lobbying page loads without WSOD', async ({ page }) => {
    await page.goto('/compliance/lobbying');
    await page.waitForTimeout(3000);
    await expect(page.locator('body')).not.toBeEmpty();
    await expect(page.getByText('Regulatory Lobbying AI')).toBeVisible({ timeout: 10000 });
  });

  test('AI Responder pulls Draft title and Synthesized Feedback text', async ({ page }) => {
    await page.goto('/compliance/lobbying');
    await page.waitForTimeout(3500);

    // Look for the loaded Draft Title and inbox mechanism
    await expect(page.getByText('Bilgi Sistemleri Tebliği Yönetmeliği')).first().toBeVisible({ timeout: 10000 });
    await expect(page.getByText('Sentinel LLM Devrede')).toBeVisible();

    // Look for actual injected rich AI text feedback mapping
    await expect(page.getByText('Katılım Bankalarına özel esnetilmesini')).toBeVisible();
  });
});
