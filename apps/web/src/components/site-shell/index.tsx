'use client';

import Link from 'next/link';
import type { AuthUser } from '@visiblefix/shared/types';
import { useCurrentUserQuery } from '@/components/auth/api';
import { cn } from '@/components/ui';
import { useI18n } from '@/components/i18n-provider';
import { Footer } from './footer';
import { HeaderNavigation, type ActivePage } from './header-navigation';

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
  const { data: resolvedUser } = useCurrentUserQuery(currentUser);
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

          <HeaderNavigation
            activePage={activePage}
            resolvedUser={resolvedUser}
            signedInLabel={signedInLabel}
            locale={locale}
            locales={locales}
            localeLabel={localeLabel}
            setLocale={setLocale}
            t={t}
          />
        </div>
      </header>

      <main 
        className={cn('mx-auto max-w-[1180px] px-4 py-8 sm:px-6 lg:px-8', mainClassName)}
      >
        {children}
      </main>

      <Footer className={footerClassName} t={t} />
    </div>
  );
}
