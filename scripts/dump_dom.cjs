const { chromium } = require('@playwright/test');

async function run() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  await page.context().addInitScript((user) => {
    window.localStorage.setItem('sentinel_user', JSON.stringify(user));
    window.localStorage.setItem('sentinel_token', 'fake-jwt-token-for-e2e');
  }, {
    id: '00000000-0000-0000-0000-000000000001',
    name: 'Dr. Hasan Aksoy',
    role: 'CAE',
    tenant_id: '11111111-1111-1111-1111-111111111111',
  });

  await page.goto('http://localhost:5173/shariah/fatwa-gpt');
  
  await page.waitForSelector('text=17 Standart');
  
  const searchInput = page.locator('textarea');
  await searchInput.fill('Arabayı galeriden satın almadan müşteriye satabilir miyiz?');
  
  const sendButton = page.locator('div.relative button').first();
  await sendButton.click();

  // Yükleme geçene kadar bekle
  await page.waitForTimeout(2000);

  // Sayfanın text içeriğini al
  const bodyText = await page.evaluate(() => document.body.innerText);
  console.log("------- PAGE TEXT START -------");
  console.log(bodyText);
  console.log("------- PAGE TEXT END -------");

  await browser.close();
}

run().catch(console.error);
