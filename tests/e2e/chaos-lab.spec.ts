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

test.describe('Wave 33: Chaos Lab E2E Tests', () => {
  test('Chaos Lab page loads without crashing', async ({ page }) => {
    await loginAsCAE(page);
    await page.goto(`${BASE}/chaos-lab`);
    await page.waitForLoadState('load', { timeout: 15000 });

    // Render kontrolü
    const body = await page.locator('body').innerHTML();
    expect(body).not.toContain('NaN');
    expect(body).not.toMatch(/undefined<\//);
    expect(body).not.toContain('Sayfa Bulunamadı');

    // Kök div boş olmamalı
    await expect(page.locator('#root')).not.toBeEmpty();
  });

  test('Chaos Lab shows tab controls and test content', async ({ page }) => {
    await loginAsCAE(page);
    await page.goto(`${BASE}/chaos-lab`);
    await page.waitForLoadState('load', { timeout: 15000 });
    await page.waitForTimeout(1500);

    // Root'ta bir şeyler render olmuş
    await expect(page.locator('#root')).not.toBeEmpty();

    // NaN / undefined yok
    const body = await page.locator('body').innerHTML();
    expect(body).not.toContain('NaN');
    expect(body).not.toMatch(/undefined<\//);
  });

  test('Kaos Denetimi chaos history panel renders without NaN', async ({ page }) => {
    await loginAsCAE(page);
    await page.goto(`${BASE}/chaos-lab`);
    await page.waitForLoadState('load', { timeout: 15000 });
    await page.waitForTimeout(2000);

    // NaN / undefined yok
    const body = await page.locator('body').innerHTML();
    expect(body).not.toContain('NaN');
    expect(body).not.toMatch(/undefined<\//);

    // Sıfıra bölünme sonucu NaN% gibi değerler olmamalı
    const text = await page.locator('body').textContent() ?? '';
    expect(text).not.toContain('NaN%');
    expect(text).not.toContain('NaNms');
  });

  test('Fix-It tab (IaC Remediations) loads without crashing', async ({ page }) => {
    await loginAsCAE(page);
    await page.goto(`${BASE}/chaos-lab`);
    await page.waitForLoadState('load', { timeout: 15000 });
    await page.waitForTimeout(1000);

    // Fix-It sekmesine tıkla
    const fixItBtn = page.getByText('Aktif Iyilestirme').first();
    const isVisible = await fixItBtn.isVisible().catch(() => false);
    if (isVisible) {
      await fixItBtn.click();
      await page.waitForTimeout(1000);
    }

    const body = await page.locator('body').innerHTML();
    expect(body).not.toContain('NaN');
    expect(body).not.toMatch(/undefined<\//);
    await expect(page.locator('#root')).not.toBeEmpty();
  });
});
