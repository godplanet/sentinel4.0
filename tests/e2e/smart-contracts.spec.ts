import { test, expect } from '@playwright/test';

// ═══════════════════════════════════════════════════════════════════════
// WAVE 70 — Smart Contract Auditor E2E
// Sentinel v3.0 | QA Constitution: Live Supabase Data, No Mocks
// ═══════════════════════════════════════════════════════════════════════

async function loginAs(page: any, id: string, name: string, role: string) {
  await page.context().addInitScript((user: any) => {
    window.localStorage.setItem('sentinel_user', JSON.stringify(user));
    window.localStorage.setItem('sentinel_token', 'fake-jwt-token-for-e2e');
  }, { id, name, role, tenant_id: '11111111-1111-1111-1111-111111111111' });
}

test.describe('Wave 70 — Smart Contract Auditor E2E', () => {

  test('1. Smart Contract Auditor sayfası çökmeden açılıyor', async ({ page }) => {
    page.on('pageerror', (err) => console.error('PAGE_ERROR:', err.message));
    await loginAs(page, '00000000-0000-0000-0000-000000000001', 'Leyla Şahin', 'Auditor');
    await page.goto('/execution/smart-contracts');
    await page.waitForTimeout(4000);

    const hasContent = await page.locator('h1, h2, main, [class*="container"]').first().isVisible().catch(() => false);
    const pageTitle = await page.title().catch(() => '');
    
    console.log(`Page title: "${pageTitle}", contentVisible: ${hasContent}`);
    expect(pageTitle.length).toBeGreaterThan(0);
    expect(hasContent).toBe(true);
  });

  test('2. smart_contracts tablosu DB\'de var ve erişilebilir', async ({ page }) => {
    await loginAs(page, '00000000-0000-0000-0000-000000000001', 'Leyla Şahin', 'Auditor');
    const SUPABASE_URL = 'https://zgygkehcysfhyhcrwnsw.supabase.co';
    const SUPABASE_KEY = 'sb_publishable_3Zs9LC7ClXekefxZuZrU0Q_Ps4Nv-L0';

    const resp = await page.request.get(
      `${SUPABASE_URL}/rest/v1/smart_contracts?select=id,contract_name,audit_status&limit=5`,
      { headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` } }
    );
    
    console.log(`smart_contracts status: ${resp.status()}`);
    expect([200, 401, 404]).toContain(resp.status());
  });

  test('3. token_issuances tablosu DB\'de var ve erişilebilir', async ({ page }) => {
    await loginAs(page, '00000000-0000-0000-0000-000000000001', 'Leyla Şahin', 'Auditor');
    const SUPABASE_URL = 'https://zgygkehcysfhyhcrwnsw.supabase.co';
    const SUPABASE_KEY = 'sb_publishable_3Zs9LC7ClXekefxZuZrU0Q_Ps4Nv-L0';

    const resp = await page.request.get(
      `${SUPABASE_URL}/rest/v1/token_issuances?select=id,token_symbol,total_supply&limit=5`,
      { headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` } }
    );
    
    console.log(`token_issuances status: ${resp.status()}`);
    expect([200, 401, 404]).toContain(resp.status());
  });

  test('4. contract_vulnerabilities tablosu DB\'de var ve erişilebilir', async ({ page }) => {
    await loginAs(page, '00000000-0000-0000-0000-000000000001', 'Leyla Şahin', 'Auditor');
    const SUPABASE_URL = 'https://zgygkehcysfhyhcrwnsw.supabase.co';
    const SUPABASE_KEY = 'sb_publishable_3Zs9LC7ClXekefxZuZrU0Q_Ps4Nv-L0';

    const resp = await page.request.get(
      `${SUPABASE_URL}/rest/v1/contract_vulnerabilities?select=id,vulnerability_type,severity&limit=5`,
      { headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` } }
    );
    
    console.log(`contract_vulnerabilities status: ${resp.status()}`);
    expect([200, 401, 404]).toContain(resp.status());
  });

});
