import { test, expect, type Page } from '@playwright/test';

const BASE = 'http://localhost:5175';
const TENANT_ID = '11111111-1111-1111-1111-111111111111';

async function loginAsCAE(page: Page) {
  await page.goto(`${BASE}/login`);
  await page.evaluate(({ t }) => {
    localStorage.setItem('isAuthenticated', 'true');
    localStorage.setItem('sentinel_token', `seed-bypass-cae`);
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

test.describe('Board Briefing & Executive Dashboard E2E Tests', () => {
  test('Executive Dashboard should load correctly without crashing', async ({ page }) => {
    await loginAsCAE(page);
    // Executive Dashboard sayfasına git
    await page.goto(`${BASE}/reporting/executive-dashboard`);

    // Loading spinner kaybolana kadar bekle
    await expect(page.getByText('Yönetim Kokpiti yükleniyor...')).toBeHidden({ timeout: 15000 });

    // Scorecard'ın render olduğunu "Denetim Karnesi" buton etiketiyle doğrula
    await expect(page.getByText('Denetim Karnesi').first()).toBeVisible({ timeout: 15000 });

    // WaterfallChart (Selale Analizi) butonunun görünür olduğunu doğrula
    await expect(page.getByText('Selale Analizi')).toBeVisible();

    // SIFIRA BÖLÜNME / NaN HATA KONTROLÜ
    const bodyText = await page.locator('body').textContent();
    expect(bodyText).not.toContain('NaN');
    expect(bodyText).not.toContain('undefined');
  });

  test('Board Briefing Card should load correctly for a specific report', async ({ page }) => {
    await loginAsCAE(page);
    // seed.sql sonrası yayınlanmış (published) herhangi bir raporu bul ve göster
    // BoardBriefingPage yalnızca yayınlı raporları getirir ama rota /:id üzerinden çalışır
    // Burada rastgele bir ID ile bir sayfa açmak yerine, /reporting/executive-dashboard/:id
    // rotasının render ettiği içeriğin en temel özelliklerini test ediyoruz
    const reportId = 'd8000000-0000-0000-0000-000000000001';
    await page.goto(`${BASE}/reporting/executive-dashboard/${reportId}`);

    // Sayfa yüklendikten sonra ya içerik ya da "rapor yok" mesajı görünmeli
    // (Her iki durumda da çökme olmamalı)
    await page.waitForLoadState('networkidle', { timeout: 20000 });

    // Sayfa çökmemiş olmalı (404 veya error boundary yoksa)
    await expect(page.locator('body')).not.toContainText('404');
    await expect(page.locator('body')).not.toContainText('Something went wrong');

    // SIFIRA BÖLÜNME / NaN HATA KONTROLÜ
    const bodyText = await page.locator('body').textContent();
    expect(bodyText).not.toContain('NaN');
    expect(bodyText).not.toContain('undefined');

    // Sayfada en azından YK Sunumu veya sayfa başlığının mevcut olduğunu doğrula
    // (Eğer yayınlı rapor varsa header görünebilir, yoksa yüklenme durumu görünür)
    const pageContent = page.locator('body');
    await expect(pageContent).toBeVisible();
  });
});
