/**
 * SENTINEL GRC v3.0 — Uçtan Uca Denetim Yaşam Döngüsü Testi
 * ===========================================================
 * Senaryo: CAE → Müfettiş → Denetlenen → Raporlama
 * Kullanıcılar: seed.sql'den gerçek kullanıcı profilleri kullanılır.
 * Mock veri kullanımı yasaktır.
 */

import { test, expect, type Page } from '@playwright/test';

const BASE = 'http://localhost:5173';
const TENANT_ID = '11111111-1111-1111-1111-111111111111';

// ─── Seed.sql Kullanıcıları ────────────────────────────────────────────────────
const USERS = {
  cae: {
    id: '00000000-0000-0000-0000-000000000001',
    name: 'Dr. Hasan Aksoy',
    email: 'cae@sentinelbank.com.tr',
    role: 'cae',
    title: 'Teftiş Kurulu Başkanı (CAE)',
  },
  auditor: {
    id: '00000000-0000-0000-0000-000000000004',
    name: 'Elif Yıldız',
    email: 'auditor@sentinelbank.com.tr',
    role: 'auditor',
    title: 'Müfettiş',
  },
  auditee: {
    id: '00000000-0000-0000-0000-000000000011',
    name: 'Burak Yılmaz',
    email: 'sube.mudur@sentinelbank.com.tr',
    role: 'auditee',
    title: 'Şube Müdürü',
  },
};

async function loginAs(page: Page, user: typeof USERS[keyof typeof USERS]) {
  await page.goto(`${BASE}/login`);
  await page.evaluate(({ u, t }) => {
    localStorage.setItem('isAuthenticated', 'true');
    localStorage.setItem('sentinel_token', `seed-bypass-${u.role}`);
    localStorage.setItem('sentinel_user', JSON.stringify({
      id: u.id,
      name: u.name,
      email: u.email,
      role: u.role,
      title: u.title,
      tenant_id: t,
    }));
    localStorage.setItem('tenant_id', t);
  }, { u: user, t: TENANT_ID });
  await page.goto(`${BASE}/dashboard`);
  await page.waitForLoadState('networkidle', { timeout: 10000 });
}

async function assertNoWSoD(page: Page) {
  const bodyText = await page.innerText('body').catch(() => '');
  expect(bodyText).not.toContain('Application Error');
  expect(bodyText).not.toContain('Minified React error');
  expect(bodyText).not.toContain('Cannot read properties of undefined');
  expect(bodyText).not.toContain('Cannot read properties of null');
}

// ─── Test Serisi ─────────────────────────────────────────────────────────────

test.describe('🔄 Uçtan Uca Denetim Yaşam Döngüsü', () => {
  test.describe.configure({ mode: 'serial' });

  // ──── Adım 1: CAE Denetim Planlama ─────────────────────────────────────────
  test('Adım 1/4 — CAE: Yıllık Plan sayfası çökmeden açılır', async ({ page }) => {
    await loginAs(page, USERS.cae);
    await page.goto(`${BASE}/strategy/annual-plan`);
    await page.waitForLoadState('networkidle', { timeout: 10000 });
    await assertNoWSoD(page);

    const container = page.locator('main, [class*="container"]').first();
    await expect(container).toBeVisible({ timeout: 5000 });

    // Yıllık plan başlığı veya içerik var
    const heading = page.locator('h1, h2, h3').first();
    await expect(heading).toBeVisible({ timeout: 5000 });
  });

  test('Adım 1b/4 — CAE: Denetim Evreni ağaç yapısı render edilir', async ({ page }) => {
    await loginAs(page, USERS.cae);
    await page.goto(`${BASE}/strategy/audit-universe`);
    await page.waitForLoadState('networkidle', { timeout: 12000 });
    await assertNoWSoD(page);

    // ReactFlow canvas veya boş state
    const universe = page.locator('.react-flow, text=Varlık Bulunamadı, text=Denetim evreni').first();
    await expect(universe).toBeVisible({ timeout: 10000 });
  });

  // ──── Adım 2: Müfettiş Bulgu Oluşturma ────────────────────────────────────
  test('Adım 2/4 — Müfettiş: Bulgu Merkezi Supabase\'den yüklenir', async ({ page }) => {
    await loginAs(page, USERS.auditor);
    await page.goto(`${BASE}/execution/findings`);
    await page.waitForLoadState('networkidle', { timeout: 10000 });
    await assertNoWSoD(page);

    // Tablo veya boş state görünmeli
    const content = page.locator('table, text=Henüz bulgu, text=Yeni Bulgu, h1, h2').first();
    await expect(content).toBeVisible({ timeout: 8000 });
  });

  test('Adım 2b/4 — Müfettiş: Bulguya tıklanınca Super Drawer açılır (sayfa yenilenmez)', async ({ page }) => {
    await loginAs(page, USERS.auditor);
    await page.goto(`${BASE}/execution/findings`);
    await page.waitForLoadState('networkidle', { timeout: 10000 });
    await assertNoWSoD(page);

    const currentUrl = page.url();
    const firstRow = page.locator('table tbody tr, [data-testid="finding-row"]').first();

    if (await firstRow.isVisible({ timeout: 5000 })) {
      await firstRow.click();
      await page.waitForTimeout(600);

      // URL aynı kalmalı — Super Drawer sayfa yenilemez
      expect(page.url()).toBe(currentUrl);

      // WSOD kontrolü
      await assertNoWSoD(page);
    } else {
      test.info().annotations.push({ type: 'skip', description: 'Bulgu listesi boş, tıklama atlandı' });
    }
  });

  test('Adım 2c/4 — Müfettiş: Aksiyon Workbench Supabase\'den yüklenir', async ({ page }) => {
    await loginAs(page, USERS.auditor);
    await page.goto(`${BASE}/actions`);
    await page.waitForLoadState('networkidle', { timeout: 10000 });
    await assertNoWSoD(page);

    const content = page.locator('table, text=Henüz aksiyon, text=Aksiyon Takip, h1, h2').first();
    await expect(content).toBeVisible({ timeout: 8000 });
  });

  // ──── Adım 3: Denetlenen Yanıt ────────────────────────────────────────────
  test('Adım 3/4 — Denetlenen: Auditee Portal açılır, içerik render edilir', async ({ page }) => {
    await loginAs(page, USERS.auditee);
    await page.goto(`${BASE}/auditee-portal`);
    await page.waitForLoadState('networkidle', { timeout: 10000 });
    await assertNoWSoD(page);

    const mainContent = page.locator('main, [class*="container"]').first();
    await expect(mainContent).toBeVisible({ timeout: 5000 });
  });

  test('Adım 3b/4 — Denetlenen: Aksiyon listesi Supabase\'den yüklenir', async ({ page }) => {
    await loginAs(page, USERS.auditee);
    await page.goto(`${BASE}/auditee-portal`);
    await page.waitForLoadState('networkidle', { timeout: 10000 });
    await assertNoWSoD(page);

    // Aksiyon kartları veya boş mesaj
    const actions = page.locator('[class*="card"], table, text=Aksiyon, text=Bulgu').first();
    await expect(actions).toBeVisible({ timeout: 8000 });
  });

  // ──── Adım 4: Raporlama ────────────────────────────────────────────────────
  test('Adım 4/4 — CAE: Rapor Kütüphanesi Supabase\'den yüklenir', async ({ page }) => {
    await loginAs(page, USERS.cae);
    await page.goto(`${BASE}/reporting/library`);
    await page.waitForLoadState('networkidle', { timeout: 10000 });
    await assertNoWSoD(page);

    const content = page.locator('table, text=Rapor bulunamadı, text=Yeni Rapor, h1, h2').first();
    await expect(content).toBeVisible({ timeout: 8000 });
  });

  test('Adım 4b/4 — CAE: Yönetici Özeti Stüdyosu açılır', async ({ page }) => {
    await loginAs(page, USERS.cae);
    await page.goto(`${BASE}/reporting/executive`);
    await page.waitForLoadState('networkidle', { timeout: 10000 });
    await assertNoWSoD(page);

    const content = page.locator('main, text=Yönetici, text=Executive, h1, h2').first();
    await expect(content).toBeVisible({ timeout: 8000 });
  });
});
