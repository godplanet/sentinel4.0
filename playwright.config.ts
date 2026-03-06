import { defineConfig, devices } from '@playwright/test';

/**
 * SENTINEL GRC v3.0 — Playwright Konfigürasyonu
 *
 * Çalıştırma:
 *   npx playwright test                    # tüm testler
 *   npx playwright test global-smoke       # sadece smoke testler
 *   npx playwright test --headed           # görsel mod
 *   npx playwright test --reporter=html    # HTML raporu
 */
export default defineConfig({
  // Test dosyalarının konumu
  testDir: './tests/e2e',

  // Paralel çalıştırma (audit-lifecycle serial olduğu için kendi içinde sıralı)
  fullyParallel: true,

  // CI ortamında retry — yerel olarak 0 retry
  retries: process.env.CI ? 2 : 0,

  // Workers — CI'da tek, yerel 2
  workers: process.env.CI ? 1 : 2,

  // Reporter
  reporter: [
    ['list'],
    ['html', { outputFolder: 'playwright-report', open: 'never' }],
  ],

  // Global test ayarları
  use: {
    baseURL: 'http://localhost:5173',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'off',
    // Supabase API timeout'larını karşılamak için
    actionTimeout: 15_000,
    navigationTimeout: 20_000,
  },

  // Tarayıcı profilları — sadece Chrome ile test yapıyoruz (CI hızı)
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    // Mobile viewport smoke (opsiyonel — CI'da kapalı)
    // {
    //   name: 'mobile-chrome',
    //   use: { ...devices['iPhone 14'] },
    //   testMatch: '**/global-smoke.spec.ts',
    // },
  ],

  // Dev sunucusunu otomatik başlatma
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:5173',
    reuseExistingServer: !process.env.CI,
    timeout: 60_000,
  },

  // Global timeout (yavaş Supabase cold start için)
  timeout: 45_000,

  // Expect timeout
  expect: {
    timeout: 10_000,
  },
});
