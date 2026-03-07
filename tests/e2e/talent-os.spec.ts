import { test, expect, type Page } from '@playwright/test';

const BASE = 'http://localhost:5173';

const SEED_USER = {
  id:    '00000000-0000-0000-0000-000000000001',
  email: 'cae@sentinelbank.com.tr',
  role:  'cae',
  name:  'Dr. Hasan Aksoy',
};

async function prepareAppEnvironment(page: Page): Promise<void> {
  await page.goto(BASE, { waitUntil: 'domcontentloaded' });
  await page.evaluate((u) => {
    localStorage.setItem('sentinel-tenant-id', '11111111-1111-1111-1111-111111111111');
    localStorage.setItem('isAuthenticated', 'true');
    localStorage.setItem('sentinel_token', 'mock-token');
    localStorage.setItem('skip_seed', 'true');
    localStorage.setItem('sentinel_user', JSON.stringify(u));
  }, SEED_USER);
}

test.describe('Talent OS - E2E Visual Demonstration', () => {
  test('should load the page visually and demonstrate real data', async ({ page }) => {
    // 1. Ekran boyutunu demoya uygun ayarla
    await page.setViewportSize({ width: 1440, height: 900 });

    // 2. Auth ve yonlendirme on-hazirlik
    await prepareAppEnvironment(page);

    // 3. Talent OS Sayfasina Git (Yeni rotasi: /resources?tab=pool)
    await page.goto(`${BASE}/resources?tab=pool`, { waitUntil: 'domcontentloaded' });
    
    // 4. Skeletons vs Data load'u bekle (Veritabani yuklenene kadar)
    await expect(page.locator('text=Kaynak Yönetimi').first()).toBeVisible({ timeout: 30000 });
    
    // 5. Gorsel bekleme (Her ekran 4 saniye)
    await page.waitForTimeout(4000);

    // Istatistiklerin gelmesini dogrula
    await expect(page.locator('text=Toplam').first()).toBeVisible({ timeout: 15000 });
    await expect(page.locator('text=Musait').first()).toBeVisible();
    await expect(page.locator('text=Kritik').first()).toBeVisible();
    await page.waitForTimeout(4000); // Istatistikleri gorme

    // Havuz tabindan sonra Eslestirmeye gecis
    await page.click('button:has-text("Akıllı Eşleştirme")');
    await expect(page.locator('text=Akıllı Eşleştirme Motoru').first()).toBeVisible({ timeout: 15000 });
    await expect(page.locator('text=En Uygun Eslestirme').first()).toBeVisible();
    
    // Yeni verileri izleme (Aciklama, Eslestirme listesi vs)
    await page.waitForTimeout(5000); 

    // Final white-screen check
    const bodyText = await page.innerHTML('body');
    expect(bodyText.length).toBeGreaterThan(100);
  });
});
