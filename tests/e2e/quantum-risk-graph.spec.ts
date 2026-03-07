import { test, expect } from '@playwright/test';

// ============================================================================
// QA PROTOCOL: Wave 43 — Quantum Risk Graph
// ============================================================================
// 1. Page loads without WSOD.
// 2. NeuralMap / RiskNetwork page shows the Force Graph canvas.
// 3. Node count badge is visible.
// 4. Searching for a node highlights correctly.
// ============================================================================

test.describe('🕸️ QUANTUM RISK GRAPH E2E TEST', () => {
  test.use({ viewport: { width: 1440, height: 900 } });

  test('Risk Network page loads without WSOD', async ({ page }) => {
    await page.goto('/strategy/neural-map');
    await page.waitForTimeout(4000);

    // No WSOD
    await expect(page.locator('body')).not.toBeEmpty();

    // Loading spinner should disappear
    await expect(page.getByText('Risk ağı yükleniyor...')).not.toBeVisible({ timeout: 10000 });
  });

  test('ForceGraph canvas renders with node count badge', async ({ page }) => {
    await page.goto('/strategy/neural-map');
    await page.waitForTimeout(5000);

    // Canvas element rendered by react-force-graph-2d
    const canvas = page.locator('canvas').first();
    await expect(canvas).toBeVisible({ timeout: 10000 });

    // Node count badge (bottom center)
    await expect(page.getByText(/nodes/i)).toBeVisible({ timeout: 8000 });
  });

  test('Legend panel is visible', async ({ page }) => {
    await page.goto('/strategy/neural-map');
    await page.waitForTimeout(4000);

    await expect(page.getByText('Legend')).toBeVisible({ timeout: 8000 });
    await expect(page.getByText('Process')).toBeVisible();
  });
});
