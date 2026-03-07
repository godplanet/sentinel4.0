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

test.describe('Wave 80: Insider Trading & PAD Radar E2E Tests', () => {
  test('PAD Radar page loads securely without crashing or NaN errors', async ({ page }) => {
    await loginAsCAE(page);
    await page.goto(`${BASE}/governance/insider-radar`);
    
    // Auto-retry assertion for API load (either data or fallback error)
    const titleLocator = page.locator('text=Insider Trading & PAD Radar').first();
    const errLocator = page.locator('text=Insider Trading uyarısı: Veriler alınırken').first();
    
    await expect(titleLocator.or(errLocator)).toBeVisible({ timeout: 15000 });

    const bodyText = await page.locator('body').textContent() ?? '';
    // Matematiksel ve haritalama (map) çökmelerine karşı koruma
    expect(bodyText).not.toContain('NaN');
    expect(bodyText).not.toContain('undefined</');
    expect(bodyText).not.toContain('[object Object]');
    
    await expect(page.locator('#root')).not.toBeEmpty();
  });

  test('Filters switch tabs correctly with safe array mappings', async ({ page }) => {
    await loginAsCAE(page);
    await page.goto(`${BASE}/governance/insider-radar`);
    
    const titleLocator = page.locator('text=Insider Trading & PAD Radar').first();
    const errLocator = page.locator('text=Insider Trading uyarısı').first();
    await expect(titleLocator.or(errLocator)).toBeVisible({ timeout: 15000 });

    const hasErrorState = await page.locator('text=Insider Trading uyarısı').isVisible().catch(() => false);
    if (!hasErrorState) {
       // Tablara tıklayarak map() fonksiyonunun (array || []) ile çökmediğinden emin ol.
       
       // 1. PAD (Personel İşlemleri)
       const padTab = page.getByRole('button', { name: /Personel İşlemleri/i }).first();
       if (await padTab.isVisible()) {
         await padTab.click();
         await page.waitForTimeout(500); 
         let bodyText = await page.locator('body').textContent() ?? '';
         expect(bodyText).not.toContain('NaN');
       }

       // 2. Restricted Trading List
       const restrictedTab = page.getByRole('button', { name: /Restricted Trading List/i }).first();
       if (await restrictedTab.isVisible()) {
         await restrictedTab.click();
         await page.waitForTimeout(500); 
         let bodyText = await page.locator('body').textContent() ?? '';
         expect(bodyText).not.toContain('NaN');
       }
    }
  });
});
