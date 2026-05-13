import type { Locale } from '@/lib/i18n/config';
import type { Translate } from './types';

export function LocaleSelector({
  locale,
  locales,
  localeLabel,
  setLocale,
  t,
}: {
  locale: Locale;
  locales: readonly Locale[];
  localeLabel: (locale: Locale) => string;
  setLocale: (locale: Locale) => void;
  t: Translate;
}) {
  return (
    <>
      <label className="sr-only" htmlFor="site-locale-select">
        {t('Language')}
      </label>
      <select
        id="site-locale-select"
        value={locale}
        onChange={(event) => setLocale(event.target.value as Locale)}
        className="min-h-10 border border-border bg-card px-3 text-sm font-semibold text-foreground outline-none transition hover:bg-secondary focus:border-foreground"
      >
        {locales.map((supportedLocale) => (
          <option key={supportedLocale} value={supportedLocale}>
            {localeLabel(supportedLocale)}
          </option>
        ))}
      </select>
    </>
  );
}
