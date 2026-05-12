import { renderToStaticMarkup } from 'react-dom/server';
import React from 'react';
import { SiteShell } from './site-shell';

jest.mock('next/link', () => {
  return function MockLink({
    href,
    children,
    ...props
  }: {
    href: string;
    children: React.ReactNode;
    [key: string]: unknown;
  }) {
    return React.createElement('a', { href, ...props }, children);
  };
});

jest.mock('@/components/i18n-provider', () => ({
  useI18n: () => ({
    locale: 'en',
    locales: ['en'],
    localeLabel: () => 'English',
    setLocale: jest.fn(),
    t: (key: string, params?: Record<string, string | number>) => {
      if (!params) return key;

      return Object.entries(params).reduce(
        (translated, [paramKey, value]) => translated.replace(`{${paramKey}}`, String(value)),
        key
      );
    },
  }),
}));

describe('SiteShell', () => {
  it('shows signed-in identity instead of auth entry links when a user is present', () => {
    const html = renderToStaticMarkup(
      React.createElement(
        SiteShell,
        {
          activePage: 'home',
          currentUser: {
            id: 'user-1',
            email: 'casey@example.com',
            name: 'Casey Admin',
            role: 'admin',
            municipalityId: null,
          },
        },
        React.createElement('p', null, 'Page body')
      )
    );

    expect(html).toContain('Signed in as');
    expect(html).toContain('Casey Admin');
    expect(html).toContain('casey@example.com');
    expect(html).not.toContain('Sign in');
    expect(html).not.toContain('Create account');
  });
});
