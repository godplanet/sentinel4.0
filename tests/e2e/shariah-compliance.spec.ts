import { test, expect } from '@playwright/test';

// Yardımcı Fonksiyon: Sahte Oturum Açma
async function loginAs(page: any, personaId: string, name: string, role: string) {
  await page.context().addInitScript((user: any) => {
    window.localStorage.setItem('sentinel_user', JSON.stringify(user));
    window.localStorage.setItem('sentinel_token', 'fake-jwt-token-for-e2e');
  }, {
    id: personaId,
    name: name,
    role: role,
    tenant_id: '11111111-1111-1111-1111-111111111111',
  });
}

test.describe('Shariah Compliance (Fatwa-GPT RAG) - Wave 17 E2E', () => {
  test('Fatwa-GPT sayfası çökmeden açılıyor ve RAG motoru Supabase verisiyle yanıt veriyor', async ({ page }) => {
    // Tarayıcıdaki console hatalarını yakala
    page.on('console', msg => console.log('BROWSER_CONSOLE:', msg.text()));
    page.on('pageerror', error => console.log('BROWSER_PAGE_ERROR:', error.message));

    // CAE (Hasan Aksoy) olarak giriş yap (Supabase bypass)
    await loginAs(page, '00000000-0000-0000-0000-000000000001', 'Dr. Hasan Aksoy', 'CAE');
    
    // Uygulamaya git
    await page.goto('/');
    
    // Fatwa-GPT sayfasına git
    await page.goto('/shariah/fatwa-gpt');

    // 1. Sayfanın çökmediğini (White Screen olmadığını) ve başlığın geldiğini doğrula
    await expect(page.locator('h1', { hasText: 'Fetva-GPT' })).toBeVisible({ timeout: 15000 });
    await expect(page.locator('text=AAOIFI Standartları Kütüphanesi')).toBeVisible();

    // 2. Veritabanından (Supabase) standartların yüklendiğini bekle
    // "17 Standart" gibi dinamik yüklemeyi bekle, çünkü seed datasında 17 kural pushladık.
    await expect(page.getByText('17 Standart', { exact: true })).toBeVisible({ timeout: 15000 });

    // 3. Soru Sor
    const searchInput = page.locator('textarea[placeholder*="Örnek:"]');
    await expect(searchInput).toBeVisible();
    await searchInput.fill('Arabayı galeriden satın almadan müşteriye satabilir miyiz?');
    
    // Gönder
    await page.keyboard.press('Enter');

    // 4. Yanıtın (FatwaResponse) geldiğini ve ilgili standardı gösterdiğini doğrula
    await expect(page.getByText('ŞARTLI CAİZ', { exact: false }).first()).toBeVisible({ timeout: 15000 });
    
    // Gerekçe ve kaynakların yüklenmesi
    await expect(page.getByText('KRİTİK RİSK', { exact: true }).first()).toBeVisible();
    await expect(page.getByText('AAOIFI Standard No. 8', { exact: false }).first()).toBeVisible();

    // Kullanıcının sonucu görebilmesi için 4 saniye bekle
    await page.waitForTimeout(4000);
  });
});
