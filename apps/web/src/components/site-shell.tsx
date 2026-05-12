'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import type { AuthUser } from '@visiblefix/shared/types';
import { cn } from '@/components/ui';
import { useI18n } from '@/components/i18n-provider';

type ActivePage = 'home' | 'issues' | 'report' | 'admin';

const NAV_ITEMS: Array<{ key: ActivePage; href: string; translationKey: string }> = [
  { key: 'home', href: '/', translationKey: 'Overview' },
  { key: 'issues', href: '/issues', translationKey: 'Discovery' },
  { key: 'report', href: '/report', translationKey: 'Report' },
];

export function SiteShell({
  activePage,
  currentUser,
  children,
  mainClassName,
  footerClassName,
}: {
  activePage: ActivePage;
  currentUser?: AuthUser | null;
  children: React.ReactNode;
  mainClassName?: string;
  footerClassName?: string;
}) {
  const { locale, locales, localeLabel, setLocale, t } = useI18n();
  const [resolvedUser, setResolvedUser] = useState<AuthUser | null | undefined>(currentUser);

  useEffect(() => {
    if (currentUser !== undefined) {
      setResolvedUser(currentUser);
      return;
    }

    let isActive = true;

    const loadCurrentUser = async () => {
      try {
        const response = await fetch('/api/v1/auth/me', {
          credentials: 'include',
          headers: {
            accept: 'application/json',
          },
        });

        if (!isActive) return;

        if (response.status === 401) {
          setResolvedUser(null);
          return;
        }

        if (!response.ok) {
          setResolvedUser(null);
          return;
        }

        const body = (await response.json()) as { data?: AuthUser };
        setResolvedUser(body.data ?? null);
      } catch {
        if (isActive) {
          setResolvedUser(null);
        }
      }
    };

    void loadCurrentUser();

    return () => {
      isActive = false;
    };
  }, [currentUser]);

  const signedInLabel = resolvedUser?.name || resolvedUser?.email;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header id="site-shell-header" className="sticky top-0 z-40 border-b border-border bg-[rgba(243,243,241,0.88)] backdrop-blur-xl">
        <div className="mx-auto flex max-w-[1180px] flex-wrap items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center border border-foreground bg-primary text-sm font-semibold text-primary-foreground shadow-razor">
              VF
            </span>
            <div>
              <p className="vf-display text-lg font-bold leading-none">VisibleFix</p>
              <p className="text-[11px] uppercase tracking-[0.22em] text-muted-foreground">{t('Civic control surface')}</p>
            </div>
          </Link>

          <div className="flex flex-wrap items-center gap-3">
            <nav className="flex flex-wrap items-center gap-0 border border-border bg-card shadow-razor">
              {NAV_ITEMS.map((item) => {
                const isActive = item.key === activePage;
                return (
                  <Link
                    key={item.key}
                    href={item.href}
                    className={cn(
                      'inline-flex min-h-10 items-center border-r border-border px-4 text-sm font-semibold transition last:border-r-0',
                      isActive ? 'bg-primary text-primary-foreground' : 'bg-card text-muted-foreground hover:bg-secondary hover:text-foreground'
                    )}
                  >
                    {t(item.translationKey)}
                  </Link>
                );
              })}
            </nav>

            <div className="flex flex-wrap items-center gap-2">
              <label className="sr-only" htmlFor="site-locale-select">
                {t('Language')}
              </label>
              <select
                id="site-locale-select"
                value={locale}
                onChange={(event) => setLocale(event.target.value as typeof locale)}
                className="min-h-10 border border-border bg-card px-3 text-sm font-semibold text-foreground outline-none transition hover:bg-secondary focus:border-foreground"
              >
                {locales.map((supportedLocale) => (
                  <option key={supportedLocale} value={supportedLocale}>
                    {localeLabel(supportedLocale)}
                  </option>
                ))}
              </select>
              {resolvedUser ? (
                <div className="min-h-10 border border-border bg-card px-3 py-2 text-sm shadow-razor">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">{t('Signed in as')}</p>
                  <p className="max-w-[180px] truncate font-semibold text-foreground" title={resolvedUser.email}>
                    {signedInLabel}
                  </p>
                </div>
              ) : resolvedUser === null ? (
                <>
                  <Link
                    href="/sign-in"
                    className="inline-flex min-h-10 items-center justify-center border border-border bg-card px-4 text-sm font-semibold text-foreground transition hover:bg-secondary"
                  >
                    {t('Sign in')}
                  </Link>
                  <Link
                    href="/sign-up"
                    className="inline-flex min-h-10 items-center justify-center border border-primary bg-primary px-4 text-sm font-semibold text-primary-foreground transition hover:bg-[#1a1a1d]"
                  >
                    {t('Create account')}
                  </Link>
                </>
              ) : null}
            </div>
          </div>
        </div>
      </header>

      <main className={cn('mx-auto max-w-[1180px] px-4 py-8 sm:px-6 lg:px-8', mainClassName)}>{children}</main>

      <footer className={cn('mt-10 border-t border-border bg-primary text-primary-foreground sm:mt-16', footerClassName)}>
        <div className="mx-auto grid max-w-[1180px] gap-6 px-4 py-8 sm:gap-10 sm:px-6 sm:py-12 lg:grid-cols-[1.3fr_1fr] lg:px-8">
          <div className="max-w-xl">
            <p className="vf-display text-xl font-bold sm:text-2xl">{t('A sharper public interface for civic trust.')}</p>
            <p className="mt-2 text-sm leading-6 text-white/70 sm:mt-3">
              {t(
                "VisibleFix blends Linear's operational clarity with Uber's monochrome confidence. The result is faster scanning, clearer state, and less ornamental noise."
              )}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-2 text-sm text-white/72">
            <Link href="/issues" className="hover:text-white">
              {t('Explore issues')}
            </Link>
            <Link href="/report" className="hover:text-white">
              {t('Submit report')}
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
