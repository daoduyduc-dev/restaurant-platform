const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  page.on('pageerror', error => console.error('PAGE ERROR:', error.message));
  
  try {
    await page.goto('http://localhost:5173/login', { waitUntil: 'networkidle' });
    
    // Fill in credentials
    await page.fill('input[type="email"]', 'admin@servegenius.com');
    await page.fill('input[type="password"]', 'admin123');
    
    // Click submit
    await page.click('button[type="submit"]');
    
    // Wait for navigation or crash
    await page.waitForTimeout(3000);
    
    const content = await page.content();
    console.log('HTML length after login:', content.length);
  } catch(e) {
    console.error('Nav error:', e);
  }
  
  await browser.close();
})();
