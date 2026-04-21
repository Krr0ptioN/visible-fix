import { expect, test, type Page } from '@playwright/test';

const BASE_URL = process.env['BASE_URL'] || 'http://localhost:3001';

const ISSUE_FIXTURE = {
  id: '501',
  title: 'Flooded crosswalk after pipe burst',
  description: 'Pedestrian route is blocked by standing water.',
  category: 'water_leak',
  status: 'acknowledged',
  imageUrl: null,
  latitude: 41.0137,
  longitude: 28.9612,
  address: 'Besiktas Pier',
  reportedAt: '2026-04-08T09:00:00.000Z',
  acknowledgedAt: '2026-04-08T10:00:00.000Z',
  inProgressAt: null,
  resolvedAt: null,
  rejectedAt: null,
  rejectReason: null,
  upvoteCount: 5,
  cityId: '34',
};

async function mockIssueEndpoints(
  page: Page,
  options: {
    upvotes: Array<{ id: string; issueId: string; deviceId: string; createdAt: string }>;
    onUpvotePost?: () => { status: number; body: unknown };
  }
) {
  await page.route('**/api/v1/**', async (route) => {
    const requestUrl = new URL(route.request().url());

    if (requestUrl.pathname === '/api/v1/issues/501') {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ success: true, data: ISSUE_FIXTURE }),
      });
      return;
    }

    if (requestUrl.pathname === '/api/v1/issues/501/upvotes') {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ success: true, data: options.upvotes }),
      });
      return;
    }

    if (requestUrl.pathname === '/api/v1/upvotes' && route.request().method() === 'POST') {
      const postResult = options.onUpvotePost?.() || {
        status: 201,
        body: {
          success: true,
          data: {
            id: 'upvote-created',
            issueId: '501',
            deviceId: 'device-alpha',
            createdAt: new Date().toISOString(),
          },
        },
      };

      await route.fulfill({
        status: postResult.status,
        contentType: 'application/json',
        body: JSON.stringify(postResult.body),
      });
      return;
    }

    await route.continue();
  });
}

test.beforeEach(async ({ context }) => {
  await context.addCookies([
    {
      name: 'vf_locale',
      value: 'en',
      url: BASE_URL,
      path: '/',
      sameSite: 'Lax',
    },
  ]);
});

test('existing upvote remains idempotent across reloads', async ({ page }) => {
  let postCount = 0;

  await mockIssueEndpoints(page, {
    upvotes: [
      {
        id: 'u-1',
        issueId: '501',
        deviceId: 'device-alpha',
        createdAt: '2026-04-12T10:00:00.000Z',
      },
    ],
    onUpvotePost: () => {
      postCount += 1;
      return {
        status: 201,
        body: { success: true },
      };
    },
  });

  await page.addInitScript(() => {
    localStorage.setItem('visiblefix-device-id', 'device-alpha');
  });

  await page.goto('/issues/501');
  await expect(page.getByRole('button', { name: '✓ Supported (5)' })).toBeDisabled();

  await page.reload();
  await expect(page.getByRole('button', { name: '✓ Supported (5)' })).toBeDisabled();
  expect(postCount).toBe(0);
});

test('duplicate/failed upvote path surfaces API error and preserves state', async ({ page }) => {
  await mockIssueEndpoints(page, {
    upvotes: [],
    onUpvotePost: () => ({
      status: 409,
      body: { success: false, message: 'You already supported this issue.' },
    }),
  });

  await page.addInitScript(() => {
    localStorage.setItem('visiblefix-device-id', 'device-beta');
  });

  await page.goto('/issues/501');
  await page.getByRole('button', { name: '👍 Support (5)' }).click();

  await expect(page.getByText('You already supported this issue.')).toBeVisible();
  await expect(page.getByRole('button', { name: '👍 Support (5)' })).toBeVisible();
});

test('share fallback copies expected deep-link payload', async ({ page }) => {
  await mockIssueEndpoints(page, {
    upvotes: [],
  });

  await page.addInitScript(() => {
    localStorage.setItem('visiblefix-device-id', 'device-gamma');
    (window as Window & { __copiedText?: string }).__copiedText = '';

    Object.defineProperty(navigator, 'share', {
      configurable: true,
      value: undefined,
    });

    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: {
        writeText: async (text: string) => {
          (window as Window & { __copiedText?: string }).__copiedText = text;
        },
      },
    });

    window.alert = () => undefined;
  });

  await page.goto('/issues/501');
  await page.getByRole('button', { name: 'Share issue' }).click();

  const copiedText = await page.evaluate(() => (window as Window & { __copiedText?: string }).__copiedText || '');
  expect(copiedText).toContain('Flooded crosswalk after pipe burst');
  expect(copiedText).toContain('View on VisibleFix:');
  expect(copiedText).toContain('/issues/501');
});
