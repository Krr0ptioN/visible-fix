import { expect, test } from '@playwright/test';

const BASE_URL = process.env['BASE_URL'] || 'http://localhost:3001';

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

test('report flow submits expected payload under 60 seconds', async ({ page }) => {
  let submitCount = 0;
  let capturedPayload: Record<string, unknown> | null = null;

  await page.route('**/api/v1/issues', async (route) => {
    if (route.request().method() !== 'POST') {
      await route.continue();
      return;
    }

    submitCount += 1;
    capturedPayload = JSON.parse(route.request().postData() || '{}') as Record<string, unknown>;

    await route.fulfill({
      status: 201,
      contentType: 'application/json',
      body: JSON.stringify({
        success: true,
        data: { id: 'issue-1' },
      }),
    });
  });

  const startedAt = Date.now();

  await page.goto('/report');
  await page.getByRole('button', { name: 'Pothole', exact: true }).click();
  await page.getByLabel('Title').fill('Road collapse near ferry terminal');
  await page.getByLabel('Description').fill('The asphalt has sunk and cars are swerving.');
  await page.getByPlaceholder('40.987654').fill('41.008200');
  await page.getByPlaceholder('29.123456').fill('28.978400');
  await page.getByRole('button', { name: 'Submit issue' }).click();

  await expect(page.getByText('Report submitted successfully.')).toBeVisible();

  const completedInMs = Date.now() - startedAt;
  expect(completedInMs).toBeLessThan(60_000);
  expect(submitCount).toBe(1);
  expect(capturedPayload).toMatchObject({
    title: 'Road collapse near ferry terminal',
    description: 'The asphalt has sunk and cars are swerving.',
    category: 'pothole',
    latitude: 41.0082,
    longitude: 28.9784,
  });
  expect(capturedPayload?.deviceId).toEqual(expect.any(String));
});

test('report flow blocks out-of-bounds coordinates before API submit', async ({ page }) => {
  let submitCount = 0;

  await page.route('**/api/v1/issues', async (route) => {
    if (route.request().method() === 'POST') {
      submitCount += 1;
      await route.fulfill({
        status: 201,
        contentType: 'application/json',
        body: JSON.stringify({ success: true, data: { id: 'unexpected' } }),
      });
      return;
    }
    await route.continue();
  });

  await page.goto('/report');
  await page.getByLabel('Title').fill('Out-of-bounds test');
  await page.getByPlaceholder('40.987654').fill('41.900000');
  await page.getByPlaceholder('29.123456').fill('28.978400');
  await page.getByRole('button', { name: 'Submit issue' }).click();

  await expect(page.getByText('This deployment accepts report locations in Istanbul bounds only.')).toBeVisible();
  expect(submitCount).toBe(0);
});
