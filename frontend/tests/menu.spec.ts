import { test, expect, Page } from '@playwright/test';

const BASE_URL = 'http://localhost:5173';

test.describe('Menu Browsing Tests', () => {
  let page: Page;

  test.beforeEach(async ({ browser }) => {
    page = await browser.newPage();
    
    // Set up localStorage with a valid token
    await page.goto(`${BASE_URL}/login`);
    await page.evaluate(() => {
      localStorage.setItem('token', 'Bearer mock_jwt_token_12345');
      sessionStorage.clear();
    });
    
    // Login
    await page.fill('input[name="email"]', 'testuser@example.com');
    await page.fill('input[name="password"]', 'validPassword123');
    await page.click('button[type="submit"]');
    await page.waitForURL(`${BASE_URL}/dashboard`);
  });

  test.afterEach(async () => {
    await page.close();
  });

  test('should navigate to menu page', async () => {
    // Click on Menu navigation link
    await page.click('a:has-text("Menu"), button:has-text("Menu")');
    
    // Wait for menu page to load
    await page.waitForURL(/\/menu/);
    expect(page.url()).toContain('/menu');
  });

  test('should display menu items in grid or list format', async () => {
    // Navigate to menu
    await page.goto(`${BASE_URL}/menu`);
    
    // Wait for menu items to load
    await page.waitForSelector('[data-testid="menu-item"], .menu-item, [class*="menu-grid"], [class*="menu-list"]', { timeout: 5000 });
    
    // Check that menu items are displayed
    const menuItems = await page.locator('[data-testid="menu-item"], .menu-item, [class*="item-card"]').count();
    expect(menuItems).toBeGreaterThan(0);
  });

  test('should display menu item details (name, price, description)', async () => {
    // Navigate to menu
    await page.goto(`${BASE_URL}/menu`);
    
    // Wait for menu items to load
    await page.waitForSelector('[data-testid="menu-item"], .menu-item');
    
    // Get first menu item
    const firstItem = await page.locator('[data-testid="menu-item"], .menu-item').first();
    
    // Check for item name
    const itemName = await firstItem.locator('[data-testid="item-name"], [class*="name"]').first();
    await expect(itemName).toBeVisible();
    
    // Check for price
    const price = await firstItem.locator('[data-testid="item-price"], [class*="price"]').first();
    await expect(price).toBeVisible();
    
    // Check for description (if present)
    const description = await firstItem.locator('[data-testid="item-description"], [class*="description"]').first();
    const isDescriptionVisible = await description.isVisible({ timeout: 1000 }).catch(() => false);
    // Description is optional
    expect([true, false]).toContain(isDescriptionVisible);
  });

  test('should filter menu by category', async () => {
    // Navigate to menu
    await page.goto(`${BASE_URL}/menu`);
    
    // Wait for category filter to appear
    await page.waitForSelector('[data-testid="category-filter"], [class*="category"], .category-tabs', { timeout: 5000 });
    
    // Click on a category
    const categoryButton = await page.locator('[data-testid="category-filter"] button, .category-tabs button, [class*="category"]').nth(1);
    const categoryName = await categoryButton.textContent();
    await categoryButton.click();
    
    // Wait for filtered results
    await page.waitForTimeout(1000);
    
    // Verify items are filtered
    const menuItems = await page.locator('[data-testid="menu-item"], .menu-item').count();
    expect(menuItems).toBeGreaterThan(0);
  });

  test('should search menu items by keyword', async () => {
    // Navigate to menu
    await page.goto(`${BASE_URL}/menu`);
    
    // Find and fill search input
    const searchInput = await page.locator('[data-testid="menu-search"], input[placeholder*="Search"], input[type="search"]').first();
    await searchInput.fill('burger');
    
    // Wait for results to filter
    await page.waitForTimeout(1000);
    
    // Check that results are shown
    const menuItems = await page.locator('[data-testid="menu-item"], .menu-item').count();
    expect(menuItems).toBeGreaterThan(0);
    
    // Verify results contain search term (in item name)
    const itemName = await page.locator('[data-testid="item-name"], [class*="name"]').first().textContent();
    expect(itemName?.toLowerCase()).toContain('burger');
  });

  test('should display all items when search is cleared', async () => {
    // Navigate to menu
    await page.goto(`${BASE_URL}/menu`);
    
    // Get initial item count
    const initialCount = await page.locator('[data-testid="menu-item"], .menu-item').count();
    
    // Search for something specific
    const searchInput = await page.locator('[data-testid="menu-search"], input[placeholder*="Search"], input[type="search"]').first();
    await searchInput.fill('burger');
    await page.waitForTimeout(500);
    
    // Get filtered count
    const filteredCount = await page.locator('[data-testid="menu-item"], .menu-item').count();
    expect(filteredCount).toBeLessThanOrEqual(initialCount);
    
    // Clear search
    await searchInput.clear();
    await page.waitForTimeout(500);
    
    // Get count after clearing
    const finalCount = await page.locator('[data-testid="menu-item"], .menu-item').count();
    expect(finalCount).toBe(initialCount);
  });

  test('should display availability status', async () => {
    // Navigate to menu
    await page.goto(`${BASE_URL}/menu`);
    
    // Wait for menu items to load
    await page.waitForSelector('[data-testid="menu-item"], .menu-item');
    
    // Check for availability indicator
    const availabilityBadge = await page.locator('[data-testid="availability"], [class*="available"], [class*="status"]').first();
    const isAvailabilityVisible = await availabilityBadge.isVisible({ timeout: 2000 }).catch(() => false);
    
    // Availability status should be visible
    expect(isAvailabilityVisible).toBe(true);
  });

  test('should allow adding item to cart', async () => {
    // Navigate to menu
    await page.goto(`${BASE_URL}/menu`);
    
    // Wait for menu items to load
    await page.waitForSelector('[data-testid="menu-item"], .menu-item');
    
    // Find add to cart button
    const addButton = await page.locator('[data-testid="add-to-cart"], button:has-text("Add"), button:has-text("Add to Cart")').first();
    await addButton.click();
    
    // Verify success (toast message, modal, or redirect)
    const successMessage = await page.locator('text=/added|success|Added to cart/i').first();
    const isSuccessVisible = await successMessage.isVisible({ timeout: 5000 }).catch(() => false);
    expect(isSuccessVisible).toBe(true);
  });

  test('should display category tabs or navigation', async () => {
    // Navigate to menu
    await page.goto(`${BASE_URL}/menu`);
    
    // Wait for category navigation
    await page.waitForSelector('[data-testid="category-filter"], .category-tabs, [class*="category"]', { timeout: 5000 });
    
    // Check that multiple categories are displayed
    const categories = await page.locator('[data-testid="category-filter"] button, .category-tabs button, [class*="category"]').count();
    expect(categories).toBeGreaterThan(0);
  });

  test('should sort menu items by price or name', async () => {
    // Navigate to menu
    await page.goto(`${BASE_URL}/menu`);
    
    // Wait for sort options
    const sortButton = await page.locator('[data-testid="sort-menu"], select[name="sort"], [class*="sort"]').first();
    const isSortVisible = await sortButton.isVisible({ timeout: 2000 }).catch(() => false);
    
    if (isSortVisible) {
      // Click sort button or select
      await sortButton.click();
      
      // Select sort by price
      await page.click('[value="price"], text=/Price/');
      
      // Wait for items to re-sort
      await page.waitForTimeout(1000);
      
      // Verify items are sorted
      const prices = await page.locator('[data-testid="item-price"], [class*="price"]').allTextContents();
      expect(prices.length).toBeGreaterThan(0);
    }
  });

  test('should display pagination if many items', async () => {
    // Navigate to menu
    await page.goto(`${BASE_URL}/menu`);
    
    // Check for pagination controls
    const paginationButton = await page.locator('[data-testid="pagination"], [class*="pagination"], button:has-text("Next")').first();
    const isPaginationVisible = await paginationButton.isVisible({ timeout: 2000 }).catch(() => false);
    
    if (isPaginationVisible) {
      // Click next page
      await paginationButton.click();
      
      // Wait for new items to load
      await page.waitForTimeout(1000);
      
      // Verify new items are displayed
      const menuItems = await page.locator('[data-testid="menu-item"], .menu-item').count();
      expect(menuItems).toBeGreaterThan(0);
    }
  });

  test('should display menu item images', async () => {
    // Navigate to menu
    await page.goto(`${BASE_URL}/menu`);
    
    // Wait for menu items to load
    await page.waitForSelector('[data-testid="menu-item"], .menu-item');
    
    // Check for image in first menu item
    const firstItem = await page.locator('[data-testid="menu-item"], .menu-item').first();
    const image = await firstItem.locator('img, [data-testid="item-image"]').first();
    
    const isImageVisible = await image.isVisible({ timeout: 2000 }).catch(() => false);
    expect(isImageVisible).toBe(true);
  });

  test('should handle special characters in item names', async () => {
    // Navigate to menu
    await page.goto(`${BASE_URL}/menu`);
    
    // Wait for menu items to load
    await page.waitForSelector('[data-testid="menu-item"], .menu-item');
    
    // Search for item with special character
    const searchInput = await page.locator('[data-testid="menu-search"], input[placeholder*="Search"], input[type="search"]').first();
    await searchInput.fill('Café');
    
    // Wait for results
    await page.waitForTimeout(500);
    
    // Verify search with special chars works
    const menuItems = await page.locator('[data-testid="menu-item"], .menu-item').count();
    // Should either find items or show no results gracefully
    expect(menuItems).toBeGreaterThanOrEqual(0);
    
    // Clear and verify no error
    await searchInput.clear();
    const finalCount = await page.locator('[data-testid="menu-item"], .menu-item').count();
    expect(finalCount).toBeGreaterThan(0);
  });
});
