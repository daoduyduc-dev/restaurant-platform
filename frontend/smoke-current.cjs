const { chromium } = require('playwright');

const BASE_URL = process.env.E2E_BASE_URL || 'http://localhost:3000';

async function expectVisible(page, selector, label) {
  const locator = page.locator(selector).first();
  await locator.waitFor({ state: 'visible', timeout: 10000 });
  console.log(`OK: ${label}`);
}

async function expectText(page, text, label) {
  await expectVisible(page, `text=${text}`, label);
}

async function login(page, email, password, expectedText) {
  await page.goto(`${BASE_URL}/login`, { waitUntil: 'networkidle' });
  await page.locator('input[type="email"]').fill(email);
  await page.locator('input[type="password"]').fill(password);
  await page.locator('button[type="submit"]').click();
  await page.waitForLoadState('networkidle');
  await expectText(page, expectedText, `login ${email}`);
}

async function run() {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
  const consoleErrors = [];
  const pageErrors = [];

  page.on('console', (msg) => {
    if (msg.type() === 'error') consoleErrors.push(msg.text());
  });
  page.on('pageerror', (error) => pageErrors.push(error.message));

  try {
    await page.goto(BASE_URL, { waitUntil: 'networkidle' });
    await expectText(page, 'ServeGenius Restaurant', 'public landing renders');
    await expectText(page, 'Dang nhap', 'public login action renders');

    await page.goto(`${BASE_URL}/orders`, { waitUntil: 'networkidle' });
    await expectText(page, 'ServeGenius Restaurant', 'unauthenticated protected route stays public');

    await page.goto(`${BASE_URL}/register`, { waitUntil: 'networkidle' });
    await expectText(page, 'Tao tai khoan customer', 'register page renders');
    const email = `customer${Date.now()}@example.com`;
    await page.locator('input[placeholder="Nguyen Van A"]').fill('Customer Smoke Test');
    await page.locator('input[type="email"]').fill(email);
    await page.locator('input[placeholder="0901234567"]').fill('0901234567');
    await page.locator('input[type="password"]').fill('customer123');
    await page.locator('button[type="submit"]').click();
    await page.waitForLoadState('networkidle');
    await expectText(page, 'Huong dan dat ban va dat mon', 'registered customer dashboard');

    await page.locator('button:has-text("Dang xuat")').click();
    await page.waitForLoadState('networkidle');
    await expectText(page, 'ServeGenius Restaurant', 'logout returns to public landing');

    await login(page, 'customer@servegenius.com', 'customer123', 'Huong dan dat ban va dat mon');
    await page.locator('button:has-text("Dang xuat")').click();
    await page.waitForLoadState('networkidle');

    await login(page, 'staff@servegenius.com', 'staff123', 'Ca lam hom nay');
    await expectText(page, 'Order & bep', 'staff nav contains operational order flow');
    await page.locator('button:has-text("Dang xuat")').click();
    await page.waitForLoadState('networkidle');

    await login(page, 'admin@servegenius.com', 'admin123', 'Admin Dashboard');
    await expectText(page, 'Bao cao', 'admin nav contains reports');

    const screenshot = await page.screenshot({ fullPage: false });
    if (screenshot.length < 10000) {
      throw new Error(`Screenshot appears too small (${screenshot.length} bytes)`);
    }

    if (pageErrors.length) {
      throw new Error(`Page errors:\n${pageErrors.join('\n')}`);
    }

    const actionableConsoleErrors = consoleErrors.filter((msg) => (
      !msg.includes('Failed to load resource') &&
      !msg.includes('WebSocket')
    ));
    if (actionableConsoleErrors.length) {
      throw new Error(`Console errors:\n${actionableConsoleErrors.join('\n')}`);
    }

    console.log('SMOKE PASS');
  } finally {
    await browser.close();
  }
}

run().catch((error) => {
  console.error('SMOKE FAIL');
  console.error(error);
  process.exit(1);
});
