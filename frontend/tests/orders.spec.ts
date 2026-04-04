import { test, expect, Page } from '@playwright/test';

const BASE_URL = 'http://localhost:5173';

test.describe('Order Management Tests', () => {
  let page: Page;

  test.beforeEach(async ({ browser }) => {
    page = await browser.newPage();
    
    // Set up localStorage with a valid token
    await page.goto(`${BASE_URL}/login`);
    await page.evaluate(() => {
      // Mock token for testing
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

  test('should navigate to orders page', async () => {
    // Click on Orders navigation link
    await page.click('a:has-text("Orders"), button:has-text("Orders")');
    
    // Wait for orders page to load
    await page.waitForURL(/\/orders/);
    expect(page.url()).toContain('/orders');
  });

  test('should display list of orders', async () => {
    // Navigate to orders
    await page.goto(`${BASE_URL}/orders`);
    
    // Wait for orders to load
    await page.waitForSelector('[data-testid="order-list"], table, .order-item, [class*="order"]', { timeout: 5000 });
    
    // Check that orders are displayed
    const orderItems = await page.locator('[data-testid="order-item"], .order-item, tr[data-testid*="order"]').count();
    expect(orderItems).toBeGreaterThan(0);
  });

  test('should create new order successfully', async () => {
    // Navigate to orders
    await page.goto(`${BASE_URL}/orders`);
    
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
    await page.goto(`${BASE_URL}/orders`);
    
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
    await page.goto(`${BASE_URL}/orders`);
    
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
    await page.goto(`${BASE_URL}/orders`);
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
    await page.goto(`${BASE_URL}/orders`);
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
    await page.goto(`${BASE_URL}/orders`);
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
    await page.goto(`${BASE_URL}/orders`);
    
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
    await page.goto(`${BASE_URL}/orders`);
    await page.click('[data-testid="order-item"], .order-item');
    
    // Wait for details
    await page.waitForSelector('[data-testid="order-details"]');
    
    // Check for total price
    const totalElement = await page.locator('[data-testid="order-total"], [class*="total"]').first();
    await expect(totalElement).toBeVisible();
    
    // Verify it shows a price
    const totalText = await totalElement.textContent();
    expect(totalText).toMatch(/\$|€|£|\d+\.\d{2}/);
  });

  test('should filter orders by status', async () => {
    // Navigate to orders
    await page.goto(`${BASE_URL}/orders`);
    
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
