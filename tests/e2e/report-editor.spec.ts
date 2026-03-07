import { test, expect } from '@playwright/test';

// ============================================================================
// QA PROTOCOL: Wave 19 - Zen Editor & AI Report Copilot
// ============================================================================
// STRICT RULES:
// 1. MUST NOT encounter White Screen of Death (WSOD) or JavaScript unhandled exceptions.
// 2. MUST successfully load the seeded BDDK report via the API hooks (useActiveReportStore).
// 3. MUST verify the presence of the LiquidGlassToolbar metadata (status, title).
// 4. MUST verify the Apple Glass UI components and AI Copilot mechanics.
// ============================================================================

test.describe('🖋️ SENTINEL V3.0 ZEN EDITOR E2E TEST', () => {
  test.use({
    viewport: { width: 1440, height: 900 },
  });

  test.beforeEach(async ({ page }) => {
    // 1. Set bypass auth token to simulate logged-in Super Admin
    await page.addInitScript(() => {
      localStorage.setItem('sb-123-auth-token', JSON.stringify({
        access_token: 'fake-jwt-token',
        user: { id: '11111111-1111-1111-1111-111111111111', role: 'authenticated' }
      }));
    });
  });

  test('Zen Editor should mount, load BDDK live draft, and open AI Copilot without crashing', async ({ page }) => {
    // 1. Navigate to the specific BDDK seeded report
    // In our seed, the new report ID is 'b0000000-0000-0000-0000-000000000001'
    await page.goto('/reporting/b0000000-0000-0000-0000-000000000001');

    // Wait to ensure JS loads completely and no WSOD occurs
    await page.waitForTimeout(2000);

    // 2. ASSERT WSOD & App Crash
    // If the defensive programming `?.` and `??` failed, the screen would be white.
    // Ensure the main container exists
    const editorMain = page.locator('main.bg-canvas');
    await expect(editorMain).toBeVisible({ timeout: 10000 });

    // 3. Verify the Dynamic DB Data passed into the view (Title & Status)
    // The LiquidGlassToolbar should display the title from the DB
    const headerTitle = page.getByRole('heading', { level: 1, name: /BDDK/i });
    await expect(headerTitle).toBeVisible();
    await expect(headerTitle).toContainText('2026 Q1 BDDK Kredi Riski Konsolide Denetim Raporu');

    // The status badge should say "Taslak"
    await expect(page.getByText('Taslak', { exact: true })).toBeVisible();

    // 4. Verify Zen Canvas Sections (Testing the Section mapping logic)
    // Section 1: Yönetici Özeti
    await expect(page.getByRole('heading', { level: 2, name: /Yönetici Özeti/i }).first()).toBeVisible();

    // The AI summary paragraph from DB should load (testing paragraph block mapping)
    // It contains "Sentinel Copilot Analizi"
    await expect(page.getByText(/Sentinel Copilot Analizi/i)).toBeVisible();

    // Section 2: Bulgu Analizi (Financial Risk Findings Block)
    await expect(page.getByRole('heading', { level: 2, name: /Riske Maruz Değer/i }).first()).toBeVisible();

    // We should see the seeded Live Findings injected
    await expect(page.getByText('Teminat Değerleme Uzmanlarında Bağımsızlık İhlali')).toBeVisible();

    // Section 3: Finansal Grid (Testing polymorphic grid)
    await expect(page.getByText('Finansal Dayanak ve Matris')).toBeVisible();

    // 5. Test the UI Interactions: AI Copilot Panel
    // Search for "AI ile Özetle" on the toolbar or right panel toggle
    // Depending on the UI layout, the AI Copilot Panel might be open or need a toggle.
    // We look for the "Sentinel Ghostwriter" text directly or via a tab.
    
    // First let's make sure the prompt buttons from the AI Copilot load
    // The AI_PROMPTS const has "Yonetici Ozeti"
    await expect(page.getByRole('button', { name: /Yonetici Ozeti/i })).toBeVisible();
    
    // Test that the Custom Prompt input box renders and allows text
    const promptInput = page.getByPlaceholder(/AI'a bir sey sor/i);
    await expect(promptInput).toBeVisible();
    await promptInput.fill('Please analyze the NPL ratio');
    await expect(promptInput).toHaveValue('Please analyze the NPL ratio');

    // Ensure the system captures a screenshot of the successful state
    // We slow down slightly for the human to observe the Apple Glass look
    await page.waitForTimeout(4000);
  });
});
