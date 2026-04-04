import { chromium } from 'playwright';
import path from 'path';

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  try {
    await page.goto('http://localhost:5173/login', { waitUntil: 'load' });
    // Screen resolution
    await page.setViewportSize({ width: 1280, height: 800 });
    
    // Fill in credentials
    await page.fill('input[type="email"]', 'admin@servegenius.com');
    await page.fill('input[type="password"]', 'admin123');
    
    await page.screenshot({ path: path.join(process.cwd(), '../../../.gemini/antigravity/brain/d399dc8e-443d-4bf5-b50a-d915d14d14a1/login_page.png') });
    
    // Click submit
    await page.click('button[type="submit"]');
    await page.waitForTimeout(2000);
    
    await page.screenshot({ path: path.join(process.cwd(), '../../../.gemini/antigravity/brain/d399dc8e-443d-4bf5-b50a-d915d14d14a1/dashboard_light.png') });
    
    console.log('Screenshots saved!');
  } catch(e) {
    console.error('Nav error:', e);
  }
  
  await browser.close();
})();
