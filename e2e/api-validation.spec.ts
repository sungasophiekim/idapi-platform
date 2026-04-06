import { test, expect } from '@playwright/test';

test.describe('API Input Validation', () => {
  let authCookie: string;

  test.beforeAll(async ({ request }) => {
    const res = await request.post('/api/auth/login', {
      data: { email: 'admin@idapi.kr', password: 'admin123!' },
    });
    const cookies = res.headers()['set-cookie'];
    authCookie = cookies || '';
  });

  test('POST /api/posts rejects invalid data', async ({ request }) => {
    const res = await request.post('/api/posts', {
      headers: { Cookie: authCookie },
      data: { title: '' }, // empty title should fail
    });
    expect(res.status()).toBe(400);
  });

  test('GET /api/posts returns published posts', async ({ request }) => {
    const res = await request.get('/api/posts');
    expect(res.ok()).toBeTruthy();
    const body = await res.json();
    expect(body.posts).toBeDefined();
    expect(Array.isArray(body.posts)).toBeTruthy();
  });

  test('GET /api/team returns team members', async ({ request }) => {
    const res = await request.get('/api/team');
    expect(res.ok()).toBeTruthy();
    const body = await res.json();
    expect(body.team).toBeDefined();
  });

  test('GET /api/regulations returns regulations', async ({ request }) => {
    const res = await request.get('/api/regulations');
    expect(res.ok()).toBeTruthy();
    const body = await res.json();
    expect(body.regulations).toBeDefined();
  });

  test('GET /api/trends returns trends', async ({ request }) => {
    const res = await request.get('/api/trends');
    expect(res.ok()).toBeTruthy();
  });

  test('sitemap.xml is accessible', async ({ request }) => {
    const res = await request.get('/sitemap.xml');
    expect(res.ok()).toBeTruthy();
  });

  test('robots.txt is accessible', async ({ request }) => {
    const res = await request.get('/robots.txt');
    expect(res.ok()).toBeTruthy();
    const text = await res.text();
    expect(text).toContain('Disallow: /admin/');
  });
});
