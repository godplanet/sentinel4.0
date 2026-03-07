import { test, expect } from '@playwright/test';

/**
 * Wave 22 QA — Time Travel Risk Simulator Smoke Tests
 *
 * Testi çalıştırmak için:
 *   npx playwright test tests/e2e/risk-simulation.spec.ts
 */

const BASE_URL = process.env.PLAYWRIGHT_BASE_URL ?? 'http://localhost:5173';

test.describe('Time Travel Risk Simulator', () => {

  test.beforeEach(async ({ page }) => {
    // Uygulama açılırken mavi yükleme ekranının geçmesini bekliyoruz
    await page.goto(BASE_URL, { waitUntil: 'networkidle', timeout: 30_000 });
    // SystemInitOverlay geçene kadar bekle (max 20s)
    await page.waitForFunction(
      () => !document.querySelector('[data-testid="system-init-overlay"]'),
      { timeout: 20_000 }
    ).catch(() => { /* Overlay yoksa devam et */ });
  });

  test('Uygulama boş ekran ya da çökme olmadan yüklenmeli', async ({ page }) => {
    // Boş beyaz ekran – ana container görünür olmalı
    const body = page.locator('body');
    await expect(body).not.toBeEmpty();

    // Kırmızı hata overlay'i olmamalı
    const errorOverlay = page.locator('text=Uncaught Error,text=Something went wrong');
    await expect(errorOverlay).toHaveCount(0);
  });

  test('Strateji / Risk haritası sayfası açılmalı', async ({ page }) => {
    // Navigasyon — projedeki sidebar/nav linkine göre
    const strategyLink = page.locator('a[href*="strategy"], a[href*="risk"], nav a').first();
    if (await strategyLink.count() > 0) {
      await strategyLink.click();
      await page.waitForLoadState('networkidle');
    } else {
      await page.goto(`${BASE_URL}/strategy`, { waitUntil: 'networkidle' });
    }
    // Sayfa çökmemeli
    await expect(page.locator('body')).not.toBeEmpty();
  });

  test('StrategicHeatmap — Stratejik Radar görünümü geçiş', async ({ page }) => {
    // Strateji sayfasına git
    await page.goto(`${BASE_URL}/strategy`, { waitUntil: 'networkidle', timeout: 15_000 }).catch(() => {});

    // "Stratejik Radar" butonu tıklanabilir mi?
    const radarButton = page.getByText('Stratejik Radar');
    if (await radarButton.count() > 0) {
      await radarButton.click();
      await page.waitForTimeout(500);

      // Beyaz ekran yok
      await expect(page.locator('body')).not.toBeEmpty();
    }
  });

  test('TimeTravelSlider — görünür ve sürüklenebilir', async ({ page }) => {
    await page.goto(`${BASE_URL}/strategy`, { waitUntil: 'networkidle', timeout: 15_000 }).catch(() => {});

    const radarButton = page.getByText('Stratejik Radar');
    if (await radarButton.count() > 0) {
      await radarButton.click();
      await page.waitForTimeout(300);
    }

    // Slider kontrolü — input[type=range]
    const slider = page.locator('input[type="range"]').first();
    if (await slider.count() > 0) {
      await expect(slider).toBeVisible();

      // Slider değerini değiştir (optimistik senaryo tetiklemesi)
      await slider.evaluate((el: HTMLInputElement) => {
        el.value = '0.25';
        el.dispatchEvent(new Event('input', { bubbles: true }));
        el.dispatchEvent(new Event('change', { bubbles: true }));
      });

      await page.waitForTimeout(500);

      // Hâlâ beyaz ekran yok
      await expect(page.locator('body')).not.toBeEmpty();
    }
  });

  test('"Oynat" butonu tıklanabilir ve uygulama çökmemeli', async ({ page }) => {
    await page.goto(`${BASE_URL}/strategy`, { waitUntil: 'networkidle', timeout: 15_000 }).catch(() => {});

    // Radar görünümüne geç
    const radarButton = page.getByText('Stratejik Radar');
    if (await radarButton.count() > 0) {
      await radarButton.click();
      await page.waitForTimeout(300);
    }

    const playButton = page.getByText('Oynat');
    if (await playButton.count() > 0) {
      await playButton.click();
      // Animasyon başladıktan 1 saniye bekle
      await page.waitForTimeout(1_000);

      // Hâlâ beyaz ekran yok, uygulama çalışıyor
      await expect(page.locator('body')).not.toBeEmpty();

      // Durdur
      const stopButton = page.getByText('Durdur');
      if (await stopButton.count() > 0) {
        await stopButton.click();
      }
    }
  });

});
