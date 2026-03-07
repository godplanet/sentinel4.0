import { test, expect } from '@playwright/test';

// Yardımcı Fonksiyon: Sahte Oturum Açma
async function loginAs(page: any, personaId: string, name: string, role: string) {
  await page.context().addInitScript((user) => {
    window.localStorage.setItem('sentinel_user', JSON.stringify(user));
    window.localStorage.setItem('sentinel_token', 'fake-jwt-token-for-e2e');
  }, {
    id: personaId,
    name: name,
    role: role,
    tenant_id: '11111111-1111-1111-1111-111111111111',
  });
}

test.describe('CAE Escalation Desk - Wave 14 E2E', () => {
  test('Yönetim Kurulu Eskalasyon Masası beyaz ekran hatası olmadan açılıyor', async ({ page }) => {
    // CAE (Hasan Aksoy) olarak giriş yap (Supabase bypass)
    await loginAs(page, '00000000-0000-0000-0000-000000000001', 'Dr. Hasan Aksoy', 'CAE');
    
    // Uygulamaya git
    await page.goto('/');
    
    // Escalation Desk sayfasına git (Menüden bağımsız direkt link, route garantisi)
    await page.goto('/governance/escalation-desk');

    // 1. Sayfanın çökmediğini (White Screen olmadığını) ve başlığın geldiğini doğrula
    await expect(page.locator('h2', { hasText: 'CAE Karar Masası' })).toBeVisible({ timeout: 15000 });

    // 2. Sayfada eskalasyonların listelendiğini bekle (Ekranda "Bulgu" veya "Bekleyen SLA" yazısı olmalı)
    // Eğer bekleyen eskalasyon yoksa boş ekran uyarısı da sayılır. İkisi de çökmediğini kanıtlar.
    const emptyMessage = page.locator('text=Bekleyen SLA eskalasyonu bulunmamaktadır');
    const findingRecord = page.locator('text=Bulgu · Level 3').first();
    
    await Promise.race([
      expect(emptyMessage).toBeVisible({ timeout: 15000 }),
      expect(findingRecord).toBeVisible({ timeout: 15000 })
    ]);

    // 3. Eğer bulgu kaydı varsa, tıklayıp Super Drawer'ın sorunsuz açıldığını doğrula
    if (await findingRecord.isVisible()) {
      await findingRecord.click();
      await expect(page.locator('span', { hasText: 'RESMİ DİSİPLİN DOSYASI' }).first()).toBeVisible();
      await expect(page.locator('text=DOSYA REF:')).toBeVisible();
    }
  });
});
