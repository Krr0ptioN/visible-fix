import { test, expect } from '@playwright/test';

test('home page exposes main entry points', async ({ page }) => {
  await page.goto('/');

  await expect(page.getByRole('heading', { level: 1 })).toContainText('Report city issues');
  await expect(page.getByRole('link', { name: 'Start a report' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Browse issues' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Admin console' })).toBeVisible();
});

test('report page renders required controls', async ({ page }) => {
  await page.goto('/report');

  await expect(page.getByRole('heading', { name: 'Report an issue' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Use my current location' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Submit issue' })).toBeVisible();
});

test('admin page renders token + status management shell', async ({ page }) => {
  await page.goto('/admin');

  await expect(page.getByRole('heading', { name: 'Admin status management' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Save token' })).toBeVisible();
});

test('issue detail timeline and upvote interaction work with API responses', async ({ page }) => {
  const fulfillJson = async (route: Parameters<Parameters<typeof page.route>[1]>[0], body: unknown, status = 200) => {
    await route.fulfill({
      status,
      contentType: 'application/json',
      headers: {
        'access-control-allow-origin': '*',
        'access-control-allow-methods': 'GET,POST,OPTIONS',
        'access-control-allow-headers': 'Content-Type',
      },
      body: JSON.stringify(body),
    });
  };

  await page.route('**/api/v1/**', async (route) => {
    const url = route.request().url();
    const method = route.request().method();

    if (method === 'OPTIONS') {
      await route.fulfill({
        status: 204,
        headers: {
          'access-control-allow-origin': '*',
          'access-control-allow-methods': 'GET,POST,OPTIONS',
          'access-control-allow-headers': 'Content-Type',
        },
      });
      return;
    }

    if (url.includes('/api/v1/issues/42/upvotes')) {
      await fulfillJson(route, {
        success: true,
        data: [],
      });
      return;
    }

    if (url.includes('/api/v1/issues/42')) {
      await fulfillJson(route, {
        success: true,
        data: {
          id: '42',
          title: 'Broken street light near school',
          description: 'Lamp has been off for 3 nights.',
          category: 'streetlight',
          status: 'in_progress',
          imageUrl: null,
          latitude: 40.1234,
          longitude: 29.5678,
          address: 'Atatürk Cd. No:10',
          reportedAt: '2026-04-10T09:00:00.000Z',
          acknowledgedAt: '2026-04-10T12:00:00.000Z',
          inProgressAt: '2026-04-11T08:30:00.000Z',
          resolvedAt: null,
          rejectedAt: null,
          rejectReason: null,
          upvoteCount: 3,
          cityId: '1',
        },
      });
      return;
    }

    if (url.includes('/api/v1/upvotes')) {
      await fulfillJson(route, {
        success: true,
        data: {
          id: 'up-1',
          issueId: '42',
          deviceId: 'test-device',
          createdAt: '2026-04-12T10:00:00.000Z',
        },
      });
      return;
    }

    await route.continue();
  });

  await page.goto('/issues/42');

  await expect(page.getByRole('heading', { name: 'Broken street light near school' })).toBeVisible();
  await expect(page.getByText('Status timeline')).toBeVisible();
  await expect(page.getByRole('button', { name: '👍 Support (3)' })).toBeVisible();

  await page.getByRole('button', { name: '👍 Support (3)' }).click();
  await expect(page.getByRole('button', { name: '✓ Supported (4)' })).toBeVisible();
});

test('issue detail renders not-found error from API', async ({ page }) => {
  await page.route('**/api/v1/**', async (route) => {
    const url = route.request().url();

    if (url.includes('/api/v1/issues/404/upvotes')) {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ success: true, data: [] }),
      });
      return;
    }

    if (url.includes('/api/v1/issues/404')) {
      await route.fulfill({
        status: 404,
        contentType: 'application/json',
        body: JSON.stringify({ success: false, message: 'Issue not found' }),
      });
      return;
    }

    await route.continue();
  });

  await page.goto('/issues/404');

  await expect(page.getByText('Issue not found.')).toBeVisible();
});
