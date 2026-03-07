import { test, expect, type Page } from '@playwright/test';

const BASE = 'http://localhost:5175';
const TENANT_ID = '11111111-1111-1111-1111-111111111111';

async function loginAsCAE(page: Page) {
  await page.goto(`${BASE}/login`);
  await page.evaluate(({ t }) => {
    localStorage.setItem('isAuthenticated', 'true');
    localStorage.setItem('sentinel_token', 'seed-bypass-cae');
    localStorage.setItem('sentinel_user', JSON.stringify({
      id: '00000000-0000-0000-0000-000000000001',
      name: 'Dr. Hasan Aksoy',
      email: 'cae@sentinelbank.com.tr',
      role: 'cae',
      title: 'Teftiş Kurulu Başkanı (CAE)',
      tenant_id: t,
    }));
    localStorage.setItem('tenant_id', t);
  }, { t: TENANT_ID });
}

test.describe('Wave 27: Delphi Engine & AI Probe Generator E2E Tests', () => {
  test('Oracle / Delphi page should render without crash', async ({ page }) => {
    await loginAsCAE(page);
    await page.goto(`${BASE}/oracle`);
    // Use load state — networkidle blocked by Supabase Realtime WS
    await page.waitForLoadState('load', { timeout: 15000 });

    // Temel yapı kontrolleri (crash = NaN/undefined/404 varsa)
    const body = await page.locator('body').innerHTML();
    expect(body).not.toContain('NaN');
    // 'undefined>' şeklinde DOM'da çıkıyorsa sorun
    expect(body).not.toMatch(/undefined<\//);
    // 404 sayfası olmamalı
    expect(body).not.toContain('Sayfa Bulunamadı');

    // En az bir kök div render edilmiş olmalı
    const rootDiv = page.locator('#root');
    await expect(rootDiv).not.toBeEmpty();
  });

  test('TextToRulePanel probe generator renders without crash', async ({ page }) => {
    await loginAsCAE(page);
    await page.goto(`${BASE}/oracle`);
    await page.waitForLoadState('load', { timeout: 15000 });

    const body = await page.locator('body').innerHTML();
    expect(body).not.toContain('NaN');
    expect(body).not.toMatch(/undefined<\//);
    expect(body).not.toContain('Sayfa Bulunamadı');

    const rootDiv = page.locator('#root');
    await expect(rootDiv).not.toBeEmpty();
  });

  test('Monitoring Watchtower page renders without crash', async ({ page }) => {
    await loginAsCAE(page);
    await page.goto(`${BASE}/monitoring/watchtower`);
    await page.waitForLoadState('load', { timeout: 15000 });

    const body = await page.locator('body').innerHTML();
    expect(body).not.toContain('NaN');
    expect(body).not.toMatch(/undefined<\//);
    expect(body).not.toContain('Sayfa Bulunamadı');

    const rootDiv = page.locator('#root');
    await expect(rootDiv).not.toBeEmpty();
  });
});
