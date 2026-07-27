import { expect, test } from '@playwright/test';

test('public site routes render successfully', async ({ page }) => {
  for (const pathname of ['/', '/projects', '/blog', '/contact', '/admin/login']) {
    const response = await page.goto(pathname);

    expect(response?.ok(), `Expected ${pathname} to respond successfully`).toBe(true);
  }
});

test('health endpoint is available for uptime monitoring', async ({ request }) => {
  const response = await request.get('/api/health');

  expect(response.status()).toBe(200);
  expect(response.headers()['cache-control']).toBe('no-store, max-age=0');
});

test('CRM workbench blocks unauthenticated visitors', async ({ page }) => {
  await page.goto('/admin/crm/dashboard');

  await expect(page).toHaveURL(/\/(?:admin\/login|api\/auth\/error)/u);
});
