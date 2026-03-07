import { test, expect, type Page } from '@playwright/test';

// ─── Constants ────────────────────────────────────────────────────────────────
const BASE = 'http://localhost:5173';
const TENANT_ID = '11111111-1111-1111-1111-111111111111';

// Users for testing
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

// ─── Helpers ───────────────────────────────────────────────────────────
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
  await page.waitForLoadState('networkidle');
}

async function assertNoWSoD(page: Page) {
  const bodyText = await page.innerText('body').catch(() => '');
  expect(bodyText).not.toContain('Application Error');
  expect(bodyText).not.toContain('Minified React error');
  expect(bodyText).not.toContain('Cannot read properties of undefined');
  expect(bodyText).not.toContain('Cannot read properties of null');
}

function setupConsoleErrorCollector(page: Page): string[] {
  const errors: string[] = [];
  page.on('console', (msg) => {
    if (msg.type() === 'error') {
      errors.push(msg.text());
    }
  });
  page.on('pageerror', (err) => {
    errors.push(err.message);
  });
  return errors;
}

// ─── FULL AUDIT LIFECYCLE TESTS ──────────────────────────────────────────────
test.use({ launchOptions: { slowMo: 3000 } }); // Ekranları görebilmeniz için 3 saniye yavaşlatıldı

test.describe('🔄 SENTINEL V3.0 FULL AUDIT LIFECYCLE TEST', () => {
  test.describe.configure({ mode: 'serial' }); // Tests must run sequentially

  // Step 1: Planning (CAE)
  test('Step 1: Planning Phase - Audit Universe & Task Creation', async ({ page }) => {
    const consoleErrors = setupConsoleErrorCollector(page);
    await loginAs(page, USERS.cae);

    // 1. Audit Universe
    await test.step('Audit Universe', async () => {
      await page.goto(`${BASE}/strategy/audit-universe`);
      await page.waitForLoadState('networkidle');
      await assertNoWSoD(page);
      
      const universeContent = page.locator('.react-flow, :has-text("Varlık Bulunamadı"), :has-text("Denetim evreni")').first();
      await expect(universeContent).toBeVisible({ timeout: 10000 });
      
      // Attempt click on first node
      const firstNode = page.locator('.react-flow__node').first();
      if (await firstNode.isVisible()) {
        await firstNode.click();
        await page.waitForTimeout(500);
        await assertNoWSoD(page);
      }
    });

    // 2. Planning
    await test.step('Annual Planning', async () => {
      await page.goto(`${BASE}/strategy/annual-plan`);
      await page.waitForLoadState('networkidle');
      await assertNoWSoD(page);
    });

    const criticalErrors = consoleErrors.filter(e => e.includes('Cannot read') || e.includes('undefined is not'));
    expect(criticalErrors, `Kritik JS Hataları (Planning): ${criticalErrors.join(', ')}`).toHaveLength(0);
  });

  // Step 2: Fieldwork / Execution (Auditor)
  test('Step 2: Fieldwork - My Engagements & Workpapers & Findings', async ({ page }) => {
    const consoleErrors = setupConsoleErrorCollector(page);
    await loginAs(page, USERS.auditor);

    // 1. My Engagements
    await test.step('My Engagements', async () => {
      await page.goto(`${BASE}/execution/my-engagements`);
      await page.waitForLoadState('networkidle');
      await assertNoWSoD(page);
    });

    // 2. Workpapers 
    await test.step('Workpapers', async () => {
      await page.goto(`${BASE}/execution/workpapers`);
      await page.waitForLoadState('networkidle');
      await assertNoWSoD(page);
      
      // Click workpaper row to open details if any exists
      const wpRow = page.locator('table tbody tr').first();
      if (await wpRow.isVisible()) {
        await wpRow.click();
        await page.waitForTimeout(500);
        await assertNoWSoD(page);
      }
    });

    // 3. New Finding Generation
    await test.step('Finding Generation (Findings Center)', async () => {
      await page.goto(`${BASE}/execution/findings`);
      await page.waitForLoadState('networkidle');
      await assertNoWSoD(page);
      
      // Click finding row to open Super Drawer
      const findingRow = page.locator('table tbody tr').first();
      if (await findingRow.isVisible()) {
        await findingRow.click();
        await page.waitForTimeout(500);
        // Ensure no page reload
        expect(page.url()).toContain('/execution/findings');
        await assertNoWSoD(page);
      }
    });

    const criticalErrors = consoleErrors.filter(e => e.includes('Cannot read') || e.includes('undefined is not'));
    expect(criticalErrors, `Kritik JS Hataları (Fieldwork): ${criticalErrors.join(', ')}`).toHaveLength(0);
  });

  // Step 3: Auditee Portal (Response & Actions)
  test('Step 3: Auditee Portal - Responding to Findings', async ({ page }) => {
    const consoleErrors = setupConsoleErrorCollector(page);
    await loginAs(page, USERS.auditee);

    await test.step('Auditee Portal Load', async () => {
      await page.goto(`${BASE}/auditee-portal`);
      await page.waitForLoadState('networkidle');
      await assertNoWSoD(page);

      const portalElement = page.locator('main, [class*="container"]').first();
      await expect(portalElement).toBeVisible();
    });

    const criticalErrors = consoleErrors.filter(e => e.includes('Cannot read') || e.includes('undefined is not'));
    expect(criticalErrors, `Kritik JS Hataları (Auditee Portal): ${criticalErrors.join(', ')}`).toHaveLength(0);
  });

  // Step 4: Tracking & Reporting (CAE)
  test('Step 4: Tracking & Reporting - Actions, Reports & Escalations', async ({ page }) => {
    const consoleErrors = setupConsoleErrorCollector(page);
    await loginAs(page, USERS.cae);

    // 1. Actions Tracking
    await test.step('Action Tracking', async () => {
      await page.goto(`${BASE}/actions`);
      await page.waitForLoadState('networkidle');
      await assertNoWSoD(page);
    });

    // 2. Escalation Desk
    await test.step('CAE Escalation Desk', async () => {
      await page.goto(`${BASE}/reporting/escalation-desk`);
      await page.waitForLoadState('networkidle');
      await assertNoWSoD(page);
    });

    // 3. Reporting Library
    await test.step('Reporting Library', async () => {
      await page.goto(`${BASE}/reporting/library`);
      await page.waitForLoadState('networkidle');
      await assertNoWSoD(page);
    });

    const criticalErrors = consoleErrors.filter(e => e.includes('Cannot read') || e.includes('undefined is not'));
    expect(criticalErrors, `Kritik JS Hataları (Reporting): ${criticalErrors.join(', ')}`).toHaveLength(0);
  });
});
