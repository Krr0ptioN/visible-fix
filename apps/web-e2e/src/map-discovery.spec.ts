import { expect, test } from '@playwright/test';

const BASE_URL = process.env['BASE_URL'] || 'http://localhost:3001';

const ISSUE_FIXTURES = [
  {
    id: '101',
    title: 'Road collapse near ferry terminal',
    description: 'Lane narrowed due to severe pothole.',
    category: 'pothole',
    status: 'in_progress',
    imageUrl: null,
    latitude: 41.0105,
    longitude: 28.9732,
    address: 'Karakoy Ferry',
    reportedAt: '2026-04-10T09:00:00.000Z',
    acknowledgedAt: '2026-04-10T11:00:00.000Z',
    inProgressAt: '2026-04-11T08:00:00.000Z',
    resolvedAt: null,
    rejectedAt: null,
    rejectReason: null,
    upvoteCount: 7,
    cityId: '34',
  },
  {
    id: '202',
    title: 'Streetlight outage at square',
    description: 'Central square lights are out at night.',
    category: 'streetlight',
    status: 'reported',
    imageUrl: null,
    latitude: 41.0152,
    longitude: 28.9798,
    address: 'Taksim Square',
    reportedAt: '2026-04-12T07:30:00.000Z',
    acknowledgedAt: null,
    inProgressAt: null,
    resolvedAt: null,
    rejectedAt: null,
    rejectReason: null,
    upvoteCount: 2,
    cityId: '34',
  },
];

test.beforeEach(async ({ context }) => {
  await context.addCookies([
    {
      name: 'vf_locale',
      value: 'en',
      url: BASE_URL,
      sameSite: 'Lax',
    },
  ]);
});

test('discovery applies category/status filters', async ({ page }) => {
  const queryHistory: string[] = [];

  await page.route('**/api/v1/issues**', async (route) => {
    const requestUrl = new URL(route.request().url());

    if (requestUrl.pathname !== '/api/v1/issues') {
      await route.continue();
      return;
    }

    queryHistory.push(requestUrl.search);

    const category = requestUrl.searchParams.get('category');
    const status = requestUrl.searchParams.get('status');

    const filtered = ISSUE_FIXTURES.filter((issue) => {
      const categoryOk = !category || issue.category === category;
      const statusOk = !status || issue.status === status;
      return categoryOk && statusOk;
    });

    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ success: true, data: filtered }),
    });
  });

  await page.goto('/issues');
  await expect(page.getByRole('button', { name: 'Road collapse near ferry terminal' })).toBeVisible();

  await page.getByRole('button', { name: 'Pothole', exact: true }).click();
  await expect.poll(() => queryHistory.at(-1) || '').toContain('category=pothole');

  await page.getByRole('button', { name: 'In progress', exact: true }).click();
  await expect.poll(() => queryHistory.at(-1) || '').toContain('category=pothole');
  await expect.poll(() => queryHistory.at(-1) || '').toContain('status=in_progress');

  await expect(page.getByText('Streetlight outage at square')).toHaveCount(0);
});

test('discovery issue selection navigates reliably to detail route', async ({ page }) => {
  await page.route('**/api/v1/**', async (route) => {
    const requestUrl = new URL(route.request().url());

    if (requestUrl.pathname === '/api/v1/issues') {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ success: true, data: [ISSUE_FIXTURES[0]] }),
      });
      return;
    }

    if (requestUrl.pathname === '/api/v1/issues/101') {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ success: true, data: ISSUE_FIXTURES[0] }),
      });
      return;
    }

    if (requestUrl.pathname === '/api/v1/issues/101/upvotes') {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ success: true, data: [] }),
      });
      return;
    }

    await route.continue();
  });

  await page.goto('/issues');
  await page.getByRole('button', { name: /Road collapse near ferry terminal Pothole In progress/ }).click();
  await page.getByRole('link', { name: 'Open full issue' }).click();

  await expect(page).toHaveURL(/\/issues\/101$/);
  await expect(page.getByRole('heading', { name: 'Road collapse near ferry terminal' })).toBeVisible();
  await expect(page.getByText('Status timeline')).toBeVisible();
});
