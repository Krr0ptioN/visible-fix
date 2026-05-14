import type { AuthUser } from '@visiblefix/shared/types';
import type { Locale } from '@/lib/i18n/config';
import { AuthNavigation } from './auth-navigation';
import { LocaleSelector } from './locale-selector';
import { NavigationLinks } from './navigation-links';
import type { ActivePage, Translate } from './types';

export type { ActivePage } from './types';

export function HeaderNavigation({
  activePage,
  resolvedUser,
  signedInLabel,
  locale,
  locales,
  localeLabel,
  setLocale,
  t,
}: {
  activePage: ActivePage;
  resolvedUser: AuthUser | null | undefined;
  signedInLabel?: string;
  locale: Locale;
  locales: readonly Locale[];
  localeLabel: (locale: Locale) => string;
  setLocale: (locale: Locale) => void;
  t: Translate;
}) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <NavigationLinks activePage={activePage} t={t} />

      <div className="flex flex-wrap items-center gap-2">
        <LocaleSelector locale={locale} locales={locales} localeLabel={localeLabel} setLocale={setLocale} t={t} />
        <AuthNavigation resolvedUser={resolvedUser} signedInLabel={signedInLabel} t={t} />
      </div>
    </div>
  );
}
