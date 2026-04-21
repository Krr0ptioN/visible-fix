'use client';

import Link from 'next/link';
import type { AuthUser } from '@visiblefix/shared/types';
import { useI18n } from '@/components/i18n-provider';
import { AdminSignOutButton } from './admin-sign-out-button';

const NAV_ITEMS = [
  { href: '/admin', key: 'Dashboard' },
  { href: '/issues', key: 'Public issues' },
  { href: '/report', key: 'New report' },
];

export function AdminShell({
  user,
  children,
}: {
  user: AuthUser;
  children: React.ReactNode;
}) {
  const { t } = useI18n();

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#f6f2eb_0%,#ebe5db_100%)] text-foreground">
      <div className="mx-auto grid max-w-[1440px] gap-6 px-4 py-6 sm:px-6 lg:grid-cols-[280px_minmax(0,1fr)] lg:px-8">
        <aside className="vf-grid-panel border border-border bg-[rgba(15,16,18,0.96)] p-5 text-white shadow-tight lg:sticky lg:top-6 lg:h-[calc(100vh-3rem)]">
          <div className="relative z-10 flex h-full flex-col">
            <div className="flex items-start justify-between gap-4 border-b border-white/10 pb-5">
              <div>
                <p className="text-[11px] uppercase tracking-[0.24em] text-white/55">VisibleFix</p>
                <h1 className="vf-display mt-2 text-3xl font-bold">{t('Admin')}</h1>
                <p className="mt-2 text-sm leading-6 text-white/65">{t('Municipal operations dashboard with authenticated workflow controls.')}</p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center border border-white/15 bg-white/5 text-sm font-semibold">
                VF
              </div>
            </div>

            <div className="mt-6 border border-white/10 bg-white/5 p-4">
              <p className="text-[11px] uppercase tracking-[0.2em] text-white/45">{t('Signed in')}</p>
              <p className="mt-2 text-lg font-semibold">{user.name || user.email}</p>
              <p className="mt-1 text-sm text-white/65">{user.email}</p>
              <div className="mt-4 grid gap-2 text-xs uppercase tracking-[0.18em] text-white/48">
                <span>{t('Role')}: {user.role.replace('_', ' ')}</span>
                <span>{t('Scope')}: {user.municipalityId ? t('Municipality {id}', { id: user.municipalityId }) : t('Global')}</span>
              </div>
            </div>

            <nav className="mt-6 grid gap-2">
              {NAV_ITEMS.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="border border-white/10 px-4 py-3 text-sm font-semibold text-white/72 transition hover:border-white/30 hover:bg-white/8 hover:text-white"
                >
                  {t(item.key)}
                </Link>
              ))}
            </nav>

            <div className="mt-auto grid gap-3 border-t border-white/10 pt-5">
              <Link href="/" className="text-sm text-white/65 transition hover:text-white">
                {t('Return to public experience')}
              </Link>
              <AdminSignOutButton />
            </div>
          </div>
        </aside>

        <main className="min-w-0">{children}</main>
      </div>
    </div>
  );
}
