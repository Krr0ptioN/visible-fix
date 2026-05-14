import Link from 'next/link';
import type { AuthUser } from '@visiblefix/shared/types';
import type { Translate } from './types';

export function AuthNavigation({
  resolvedUser,
  signedInLabel,
  t,
}: {
  resolvedUser: AuthUser | null | undefined;
  signedInLabel?: string;
  t: Translate;
}) {
  if (resolvedUser) {
    return (
      <div className="min-h-10 border border-border bg-card px-3 py-2 text-sm shadow-razor">
        <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">{t('Signed in as')}</p>
        <p className="max-w-[180px] truncate font-semibold text-foreground" title={resolvedUser.email}>
          {signedInLabel}
        </p>
      </div>
    );
  }

  if (resolvedUser === null) {
    return (
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
    );
  }

  return null;
}
