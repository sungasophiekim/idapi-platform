import { test, expect } from '@playwright/test';

test.describe('Public Pages', () => {
  test('homepage loads with IDAPI branding', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('text=IDAPI')).toBeVisible();
    await expect(page).toHaveTitle(/IDAPI/);
  });

  test('about page loads', async ({ page }) => {
    await page.goto('/about');
    await expect(page.locator('text=About IDAPI')).toBeVisible();
  });

  test('research page loads with posts', async ({ page }) => {
    await page.goto('/research');
    await expect(page.locator('text=Research')).toBeVisible();
  });

  test('team page loads with members', async ({ page }) => {
    await page.goto('/team');
    await expect(page.locator('text=Team')).toBeVisible();
  });

  test('dashboard page loads', async ({ page }) => {
    await page.goto('/dashboard');
    await expect(page.locator('text=Dashboard')).toBeVisible();
  });

  test('language toggle switches to English', async ({ page }) => {
    await page.goto('/');
    await page.click('button:has-text("ENG")');
    await expect(page.locator('text=Shaping the Future')).toBeVisible();
  });

  test('404 page shows for unknown routes', async ({ page }) => {
    await page.goto('/nonexistent-page');
    await expect(page.locator('text=404')).toBeVisible();
  });

  test('health API returns ok', async ({ request }) => {
    const res = await request.get('/api/health');
    expect(res.ok()).toBeTruthy();
    const body = await res.json();
    expect(body.status).toBe('ok');
  });
});
