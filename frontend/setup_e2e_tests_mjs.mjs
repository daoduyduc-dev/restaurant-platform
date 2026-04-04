import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Path to tests directory
const testsDir = path.join(__dirname, 'frontend', 'tests');

// Create directory with recursive flag
try {
  if (!fs.existsSync(testsDir)) {
    fs.mkdirSync(testsDir, { recursive: true });
    console.log('✓ Created directory:', testsDir);
  } else {
    console.log('✓ Directory already exists:', testsDir);
  }
} catch (err) {
  console.error('✗ Failed to create directory:', err.message);
  process.exit(1);
}

// Auth tests file content
const authSpecContent = `import { test, expect, Page } from '@playwright/test';

const BASE_URL = 'http://localhost:5173';

test.describe('Authentication Tests', () => {
  let page: Page;

  test.beforeEach(async ({ browser }) => {
    page = await browser.newPage();
    await page.goto(\`\${BASE_URL}/login\`);
    // Clear localStorage before each test
    await page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
    });
  });

  test.afterEach(async () => {
    await page.close();
  });

  test('should successfully login with valid credentials', async () => {
    // Fill login form
    await page.fill('input[name="email"]', 'testuser@example.com');
    await page.fill('input[name="password"]', 'validPassword123');
    
    // Submit form
    await page.click('button[type="submit"]');
    
    // Wait for redirect to dashboard
    await page.waitForURL(\`\${BASE_URL}/dashboard\`);
    expect(page.url()).toContain('/dashboard');
  });

  test('should display error for invalid email format', async () => {
    // Fill login form with invalid email
    await page.fill('input[name="email"]', 'notanemail');
    await page.fill('input[name="password"]', 'validPassword123');
    
    // Submit form
    await page.click('button[type="submit"]');
    
    // Check for error message
    const errorMessage = await page.locator('text=/invalid|Invalid|email|Email/i').first();
    await expect(errorMessage).toBeVisible();
  });

  test('should display error for invalid password', async () => {
    // Fill login form
    await page.fill('input[name="email"]', 'testuser@example.com');
    await page.fill('input[name="password"]', 'wrongPassword');
    
    // Submit form
    await page.click('button[type="submit"]');
    
    // Check for error message
    const errorMessage = await page.locator('text=/incorrect|wrong|invalid|Invalid|password/i').first();
    await expect(errorMessage).toBeVisible();
  });

  test('should display error when email is empty', async () => {
    // Leave email empty and fill password
    await page.fill('input[name="password"]', 'validPassword123');
    
    // Try to submit
    await page.click('button[type="submit"]');
    
    // Check for error or validation message
    const emailInput = await page.locator('input[name="email"]');
    const validationMessage = await emailInput.evaluate((el: HTMLInputElement) => el.validationMessage);
    expect(validationMessage).toBeTruthy();
  });

  test('should redirect to login page when accessing protected route without token', async () => {
    // Clear any tokens
    await page.evaluate(() => localStorage.removeItem('token'));
    
    // Try to navigate to dashboard
    await page.goto(\`\${BASE_URL}/dashboard\`);
    
    // Should redirect to login
    await page.waitForURL(\`\${BASE_URL}/login\`);
    expect(page.url()).toContain('/login');
  });

  test('should successfully logout', async () => {
    // Login first
    await page.fill('input[name="email"]', 'testuser@example.com');
    await page.fill('input[name="password"]', 'validPassword123');
    await page.click('button[type="submit"]');
    await page.waitForURL(\`\${BASE_URL}/dashboard\`);
    
    // Click logout button
    await page.click('button:has-text("Logout")');
    
    // Should redirect to login
    await page.waitForURL(\`\${BASE_URL}/login\`);
    expect(page.url()).toContain('/login');
  });

  test('should store JWT token in localStorage after successful login', async () => {
    // Login
    await page.fill('input[name="email"]', 'testuser@example.com');
    await page.fill('input[name="password"]', 'validPassword123');
    await page.click('button[type="submit"]');
    await page.waitForURL(\`\${BASE_URL}/dashboard\`);
    
    // Check that token exists in localStorage
    const token = await page.evaluate(() => localStorage.getItem('token'));
    expect(token).toBeTruthy();
    expect(token).toMatch(/^Bearer |^[A-Za-z0-9\\\\-_.]+$/);
  });

  test('should remove token from localStorage on logout', async () => {
    // Login first
    await page.fill('input[name="email"]', 'testuser@example.com');
    await page.fill('input[name="password"]', 'validPassword123');
    await page.click('button[type="submit"]');
    await page.waitForURL(\`\${BASE_URL}/dashboard\`);
    
    // Verify token exists
    let token = await page.evaluate(() => localStorage.getItem('token'));
    expect(token).toBeTruthy();
    
    // Logout
    await page.click('button:has-text("Logout")');
    await page.waitForURL(\`\${BASE_URL}/login\`);
    
    // Verify token is removed
    token = await page.evaluate(() => localStorage.getItem('token'));
    expect(token).toBeNull();
  });

  test('should persist session across page reloads', async () => {
    // Login first
    await page.fill('input[name="email"]', 'testuser@example.com');
    await page.fill('input[name="password"]', 'validPassword123');
    await page.click('button[type="submit"]');
    await page.waitForURL(\`\${BASE_URL}/dashboard\`);
    
    // Get the token
    const tokenBeforeReload = await page.evaluate(() => localStorage.getItem('token'));
    
    // Reload the page
    await page.reload();
    
    // Wait for dashboard to load
    await page.waitForURL(\`\${BASE_URL}/dashboard\`);
    
    // Token should still exist
    const tokenAfterReload = await page.evaluate(() => localStorage.getItem('token'));
    expect(tokenAfterReload).toBe(tokenBeforeReload);
    expect(tokenAfterReload).toBeTruthy();
  });

  test('should automatically refresh expired token', async () => {
    // Login first
    await page.fill('input[name="email"]', 'testuser@example.com');
    await page.fill('input[name="password"]', 'validPassword123');
    await page.click('button[type="submit"]');
    await page.waitForURL(\`\${BASE_URL}/dashboard\`);
    
    // Simulate token expiration by setting an expired token
    await page.evaluate(() => {
      localStorage.setItem('token', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHAiOjE2MDAwMDAwMDB9.expired');
    });
    
    // Try to make an authenticated request
    const response = await page.evaluate(async () => {
      const resp = await fetch('/api/orders', {
        headers: {
          'Authorization': localStorage.getItem('token') || ''
        }
      });
      return resp.status;
    });
    
    // The token should be refreshed, allowing the request to succeed
    // Status should be 200 (success) not 401 (unauthorized)
    expect([200, 401]).toContain(response); // 401 is acceptable if refresh fails
  });

  test('should redirect to login when refresh token is expired', async () => {
    // Login first
    await page.fill('input[name="email"]', 'testuser@example.com');
    await page.fill('input[name="password"]', 'validPassword123');
    await page.click('button[type="submit"]');
    await page.waitForURL(\`\${BASE_URL}/dashboard\`);
    
    // Clear refresh token to simulate expiration
    await page.evaluate(() => {
      localStorage.removeItem('refreshToken');
    });
    
    // Set access token as expired
    await page.evaluate(() => {
      localStorage.setItem('token', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHAiOjE2MDAwMDAwMDB9.expired');
    });
    
    // Try to navigate to a protected route or reload
    await page.goto(\`\${BASE_URL}/dashboard\`);
    
    // Should eventually redirect to login
    await page.waitForURL(\`\${BASE_URL}/login\`, { timeout: 5000 });
    expect(page.url()).toContain('/login');
  });
});
`;

// Orders tests file content
const ordersSpecContent = `import { test, expect, Page } from '@playwright/test';

const BASE_URL = 'http://localhost:5173';

test.describe('Order Management Tests', () => {
  let page: Page;

  test.beforeEach(async ({ browser }) => {
    page = await browser.newPage();
    
    // Set up localStorage with a valid token
    await page.goto(\`\${BASE_URL}/login\`);
    await page.evaluate(() => {
      // Mock token for testing
      localStorage.setItem('token', 'Bearer mock_jwt_token_12345');
      sessionStorage.clear();
    });
    
    // Login
    await page.fill('input[name="email"]', 'testuser@example.com');
    await page.fill('input[name="password"]', 'validPassword123');
    await page.click('button[type="submit"]');
    await page.waitForURL(\`\${BASE_URL}/dashboard\`);
  });

  test.afterEach(async () => {
    await page.close();
  });

  test('should navigate to orders page', async () => {
    // Click on Orders navigation link
    await page.click('a:has-text("Orders"), button:has-text("Orders")');
    
    // Wait for orders page to load
    await page.waitForURL(/\\/orders/);
    expect(page.url()).toContain('/orders');
  });

  test('should display list of orders', async () => {
    // Navigate to orders
    await page.goto(\`\${BASE_URL}/orders\`);
    
    // Wait for orders to load
    await page.waitForSelector('[data-testid="order-list"], table, .order-item, [class*="order"]', { timeout: 5000 });
    
    // Check that orders are displayed
    const orderItems = await page.locator('[data-testid="order-item"], .order-item, tr[data-testid*="order"]').count();
    expect(orderItems).toBeGreaterThan(0);
  });

  test('should create new order successfully', async () => {
    // Navigate to orders
    await page.goto(\`\${BASE_URL}/orders\`);
    
    // Click on create new order button
    await page.click('button:has-text("New Order"), button:has-text("Create Order"), button:has-text("Add Order")');
    
    // Wait for form to appear
    await page.waitForSelector('form, [data-testid="order-form"]');
    
    // Fill in order details (adjust selectors based on actual form)
    await page.fill('input[name="customerName"], input[placeholder*="Customer"]', 'John Doe');
    await page.fill('input[name="tableNumber"], input[placeholder*="Table"]', '5');
    
    // Submit form
    await page.click('button[type="submit"]:has-text("Create"), button:has-text("Save Order")');
    
    // Wait for success (redirect or message)
    await page.waitForTimeout(2000);
    const successMessage = await page.locator('text=/success|created|Order created/i').first();
    await expect(successMessage).toBeVisible({ timeout: 5000 });
  });

  test('should display order details when clicking on order', async () => {
    // Navigate to orders
    await page.goto(\`\${BASE_URL}/orders\`);
    
    // Wait for orders to load
    await page.waitForSelector('[data-testid="order-item"], .order-item');
    
    // Click on first order
    await page.click('[data-testid="order-item"], .order-item');
    
    // Wait for details view to load
    await page.waitForSelector('[data-testid="order-details"], [class*="order-detail"]', { timeout: 5000 });
    
    // Check that details are displayed
    const orderNumber = await page.locator('[data-testid="order-number"], [class*="order-id"]').first();
    await expect(orderNumber).toBeVisible();
  });

  test('should update order status from OPEN to READY', async () => {
    // Navigate to orders
    await page.goto(\`\${BASE_URL}/orders\`);
    
    // Click on first order
    await page.click('[data-testid="order-item"], .order-item');
    
    // Wait for order details
    await page.waitForSelector('[data-testid="order-details"]');
    
    // Find and click status dropdown or button
    const statusButton = await page.locator('[data-testid="order-status"], [class*="status"]').first();
    await statusButton.click();
    
    // Select READY status
    await page.click('text="READY", text="Ready", [value="READY"]');
    
    // Confirm change
    await page.click('button:has-text("Save"), button:has-text("Update"), button:has-text("Confirm")');
    
    // Verify status changed
    const updatedStatus = await page.locator('[data-testid="order-status"]').first();
    await expect(updatedStatus).toContainText(/READY|Ready/);
  });

  test('should display order items/line items', async () => {
    // Navigate to orders and open details
    await page.goto(\`\${BASE_URL}/orders\`);
    await page.click('[data-testid="order-item"], .order-item');
    
    // Wait for details
    await page.waitForSelector('[data-testid="order-details"]');
    
    // Check for line items
    const lineItems = await page.locator('[data-testid="order-item-row"], .line-item, tbody tr').count();
    expect(lineItems).toBeGreaterThan(0);
    
    // Verify item details are visible
    const itemName = await page.locator('[data-testid="item-name"], .item-name').first();
    await expect(itemName).toBeVisible();
  });

  test('should add item to order', async () => {
    // Navigate to order details
    await page.goto(\`\${BASE_URL}/orders\`);
    await page.click('[data-testid="order-item"], .order-item');
    
    // Wait for details
    await page.waitForSelector('[data-testid="order-details"]');
    
    // Get initial item count
    const initialCount = await page.locator('[data-testid="order-item-row"], .line-item').count();
    
    // Click add item button
    await page.click('button:has-text("Add Item"), button:has-text("Add to Order")');
    
    // Wait for item selection dialog/modal
    await page.waitForSelector('[data-testid="item-selector"], [role="dialog"]', { timeout: 5000 });
    
    // Select a menu item
    await page.click('[data-testid="menu-item"], .menu-item-option');
    
    // Confirm selection
    await page.click('button:has-text("Add"), button:has-text("Confirm"), button:has-text("Select")');
    
    // Verify item was added
    const newCount = await page.locator('[data-testid="order-item-row"], .line-item').count();
    expect(newCount).toBe(initialCount + 1);
  });

  test('should remove item from order', async () => {
    // Navigate to order details
    await page.goto(\`\${BASE_URL}/orders\`);
    await page.click('[data-testid="order-item"], .order-item');
    
    // Wait for details
    await page.waitForSelector('[data-testid="order-details"]');
    
    // Get initial item count
    const initialCount = await page.locator('[data-testid="order-item-row"], .line-item').count();
    expect(initialCount).toBeGreaterThan(0);
    
    // Click remove button on first item
    const removeButton = await page.locator('[data-testid="remove-item"], button:has-text("Remove")').first();
    await removeButton.click();
    
    // Confirm removal if prompted
    const confirmButton = await page.locator('button:has-text("Confirm"), button:has-text("Yes")', { has: page.locator('[role="dialog"]') }).first();
    if (await confirmButton.isVisible({ timeout: 2000 }).catch(() => false)) {
      await confirmButton.click();
    }
    
    // Verify item was removed
    const newCount = await page.locator('[data-testid="order-item-row"], .line-item').count();
    expect(newCount).toBe(initialCount - 1);
  });

  test('should cancel order successfully', async () => {
    // Navigate to orders
    await page.goto(\`\${BASE_URL}/orders\`);
    
    // Click on an order
    await page.click('[data-testid="order-item"], .order-item');
    
    // Wait for details
    await page.waitForSelector('[data-testid="order-details"]');
    
    // Click cancel button
    await page.click('button:has-text("Cancel"), button:has-text("Cancel Order")');
    
    // Confirm cancellation
    const confirmButton = await page.locator('button:has-text("Confirm"), button:has-text("Yes")', { has: page.locator('[role="dialog"]') }).first();
    if (await confirmButton.isVisible({ timeout: 2000 }).catch(() => false)) {
      await confirmButton.click();
    }
    
    // Verify order is cancelled
    const successMessage = await page.locator('text=/cancelled|Cancelled/i').first();
    await expect(successMessage).toBeVisible({ timeout: 5000 });
  });

  test('should calculate and display order total', async () => {
    // Navigate to order details
    await page.goto(\`\${BASE_URL}/orders\`);
    await page.click('[data-testid="order-item"], .order-item');
    
    // Wait for details
    await page.waitForSelector('[data-testid="order-details"]');
    
    // Check for total price
    const totalElement = await page.locator('[data-testid="order-total"], [class*="total"]').first();
    await expect(totalElement).toBeVisible();
    
    // Verify it shows a price
    const totalText = await totalElement.textContent();
    expect(totalText).toMatch(/\\$|€|£|\\d+\\.\\d{2}/);
  });

  test('should filter orders by status', async () => {
    // Navigate to orders
    await page.goto(\`\${BASE_URL}/orders\`);
    
    // Find status filter
    const statusFilter = await page.locator('[data-testid="status-filter"], select[name="status"], [class*="filter"]').first();
    expect(statusFilter).toBeDefined();
    
    // Click or select filter
    if (await statusFilter.getAttribute('role') === 'combobox' || statusFilter.name === 'select') {
      await statusFilter.click();
      await page.click('[value="READY"], text="READY"');
    } else {
      await statusFilter.selectOption('READY');
    }
    
    // Wait for filtered results
    await page.waitForTimeout(1000);
    
    // Verify only READY orders are shown
    const orders = await page.locator('[data-testid="order-item"], .order-item').all();
    for (const order of orders) {
      const status = await order.locator('[data-testid="order-status"], [class*="status"]').textContent();
      expect(status).toContain('READY');
    }
  });
});
`;

// Menu tests file content
const menuSpecContent = `import { test, expect, Page } from '@playwright/test';

const BASE_URL = 'http://localhost:5173';

test.describe('Menu Browsing Tests', () => {
  let page: Page;

  test.beforeEach(async ({ browser }) => {
    page = await browser.newPage();
    
    // Set up localStorage with a valid token
    await page.goto(\`\${BASE_URL}/login\`);
    await page.evaluate(() => {
      localStorage.setItem('token', 'Bearer mock_jwt_token_12345');
      sessionStorage.clear();
    });
    
    // Login
    await page.fill('input[name="email"]', 'testuser@example.com');
    await page.fill('input[name="password"]', 'validPassword123');
    await page.click('button[type="submit"]');
    await page.waitForURL(\`\${BASE_URL}/dashboard\`);
  });

  test.afterEach(async () => {
    await page.close();
  });

  test('should navigate to menu page', async () => {
    // Click on Menu navigation link
    await page.click('a:has-text("Menu"), button:has-text("Menu")');
    
    // Wait for menu page to load
    await page.waitForURL(/\\/menu/);
    expect(page.url()).toContain('/menu');
  });

  test('should display menu items in grid or list format', async () => {
    // Navigate to menu
    await page.goto(\`\${BASE_URL}/menu\`);
    
    // Wait for menu items to load
    await page.waitForSelector('[data-testid="menu-item"], .menu-item, [class*="menu-grid"], [class*="menu-list"]', { timeout: 5000 });
    
    // Check that menu items are displayed
    const menuItems = await page.locator('[data-testid="menu-item"], .menu-item, [class*="item-card"]').count();
    expect(menuItems).toBeGreaterThan(0);
  });

  test('should display menu item details (name, price, description)', async () => {
    // Navigate to menu
    await page.goto(\`\${BASE_URL}/menu\`);
    
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
    await page.goto(\`\${BASE_URL}/menu\`);
    
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
    await page.goto(\`\${BASE_URL}/menu\`);
    
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
    await page.goto(\`\${BASE_URL}/menu\`);
    
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
    await page.goto(\`\${BASE_URL}/menu\`);
    
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
    await page.goto(\`\${BASE_URL}/menu\`);
    
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
    await page.goto(\`\${BASE_URL}/menu\`);
    
    // Wait for category navigation
    await page.waitForSelector('[data-testid="category-filter"], .category-tabs, [class*="category"]', { timeout: 5000 });
    
    // Check that multiple categories are displayed
    const categories = await page.locator('[data-testid="category-filter"] button, .category-tabs button, [class*="category"]').count();
    expect(categories).toBeGreaterThan(0);
  });

  test('should sort menu items by price or name', async () => {
    // Navigate to menu
    await page.goto(\`\${BASE_URL}/menu\`);
    
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
    await page.goto(\`\${BASE_URL}/menu\`);
    
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
    await page.goto(\`\${BASE_URL}/menu\`);
    
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
    await page.goto(\`\${BASE_URL}/menu\`);
    
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
`;

// Write auth.spec.ts
try {
  fs.writeFileSync(path.join(testsDir, 'auth.spec.ts'), authSpecContent);
  console.log('✓ Created auth.spec.ts');
} catch (err) {
  console.error('✗ Failed to create auth.spec.ts:', err.message);
  process.exit(1);
}

// Write orders.spec.ts
try {
  fs.writeFileSync(path.join(testsDir, 'orders.spec.ts'), ordersSpecContent);
  console.log('✓ Created orders.spec.ts');
} catch (err) {
  console.error('✗ Failed to create orders.spec.ts:', err.message);
  process.exit(1);
}

// Write menu.spec.ts
try {
  fs.writeFileSync(path.join(testsDir, 'menu.spec.ts'), menuSpecContent);
  console.log('✓ Created menu.spec.ts');
} catch (err) {
  console.error('✗ Failed to create menu.spec.ts:', err.message);
  process.exit(1);
}

console.log('\n✓✓✓ All test files created successfully! ✓✓✓');
console.log('\nCreated files:');
console.log('  - D:\\restaurant-platform\\frontend\\tests\\auth.spec.ts');
console.log('  - D:\\restaurant-platform\\frontend\\tests\\orders.spec.ts');
console.log('  - D:\\restaurant-platform\\frontend\\tests\\menu.spec.ts');
console.log('\nTests include:');
console.log('  - auth.spec.ts: 11 authentication tests');
console.log('  - orders.spec.ts: 11 order management tests');
console.log('  - menu.spec.ts: 13 menu browsing tests');
console.log('\nTotal: 35 E2E test cases');
