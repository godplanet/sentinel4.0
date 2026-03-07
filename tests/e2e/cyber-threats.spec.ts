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

test.describe('Wave 53: CTI & Dark Web Monitor E2E Tests', () => {
  test('Cyber Threat page loads without crashing', async ({ page }) => {
    await loginAsCAE(page);
    await page.goto(`${BASE}/monitoring/cyber-threats`);
    await page.waitForLoadState('load', { timeout: 15000 });

    const body = await page.locator('body').innerHTML();
    expect(body).not.toContain('NaN');
    expect(body).not.toMatch(/undefined<\//);
    expect(body).not.toContain('Sayfa Bulunamadı');

    await expect(page.locator('#root')).not.toBeEmpty();
  });

  test('ThreatRadar renders no NaN risk scores', async ({ page }) => {
    await loginAsCAE(page);
    await page.goto(`${BASE}/monitoring/cyber-threats`);
    await page.waitForLoadState('load', { timeout: 15000 });
    await page.waitForTimeout(2000);

    const text = await page.locator('body').textContent() ?? '';
    expect(text).not.toContain('NaN');
    expect(text).not.toContain('[object Object]');

    await expect(page.locator('#root')).not.toBeEmpty();
  });

  test('Dark web tab renders without crashing', async ({ page }) => {
    await loginAsCAE(page);
    await page.goto(`${BASE}/monitoring/cyber-threats`);
    await page.waitForLoadState('load', { timeout: 15000 });
    await page.waitForTimeout(1500);

    // Dark web sekmesine geç
    const darkwebTab = page.getByText('Dark Web Uyarıları').first();
    const visible = await darkwebTab.isVisible().catch(() => false);
    if (visible) {
      await darkwebTab.click();
      await page.waitForTimeout(1000);
    }

    const body = await page.locator('body').innerHTML();
    expect(body).not.toContain('NaN');
    expect(body).not.toMatch(/undefined<\//);
    await expect(page.locator('#root')).not.toBeEmpty();
  });
});
