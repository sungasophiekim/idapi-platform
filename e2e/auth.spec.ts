import { test, expect } from '@playwright/test';

test.describe('Authentication', () => {
  test('login page renders', async ({ page }) => {
    await page.goto('/admin/login');
    await expect(page.locator('text=IDAPI Admin')).toBeVisible();
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
  });

  test('login with valid credentials redirects to admin', async ({ page }) => {
    await page.goto('/admin/login');
    await page.fill('input[type="email"]', 'admin@idapi.kr');
    await page.fill('input[type="password"]', 'admin123!');
    await page.click('button:has-text("Sign In")');
    await page.waitForURL(/\/admin/, { timeout: 5000 });
    await expect(page.locator('text=Dashboard')).toBeVisible();
  });

  test('login with invalid credentials shows error', async ({ page }) => {
    await page.goto('/admin/login');
    await page.fill('input[type="email"]', 'admin@idapi.kr');
    await page.fill('input[type="password"]', 'wrongpassword');
    await page.click('button:has-text("Sign In")');
    await expect(page.locator('text=Invalid')).toBeVisible({ timeout: 5000 });
  });

  test('login API rate limiting', async ({ request }) => {
    // Send 6 login attempts rapidly (limit is 5/min)
    for (let i = 0; i < 5; i++) {
      await request.post('/api/auth/login', {
        data: { email: 'test@test.com', password: 'wrong' },
      });
    }
    const res = await request.post('/api/auth/login', {
      data: { email: 'test@test.com', password: 'wrong' },
    });
    expect(res.status()).toBe(429);
  });

  test('protected API returns 401 without auth', async ({ request }) => {
    const res = await request.post('/api/posts', {
      data: { title: 'test' },
    });
    expect(res.status()).toBe(401);
  });
});
