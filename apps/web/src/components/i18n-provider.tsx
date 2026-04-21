'use client';

import { createContext, useContext, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { type IssueCategory, type IssueStatus } from '@visiblefix/shared/types';
import {
  CATEGORY_LABELS,
  LOCALE_COOKIE_NAME,
  LOCALE_TO_HTML_LANG,
  LOCALE_LABELS,
  STATUS_LABELS,
  SUPPORTED_LOCALES,
  createTranslator,
  formatDateTime,
  formatNumber,
  getDirection,
  type Locale,
} from '@/lib/i18n/config';

type TranslationParams = Record<string, string | number>;

type I18nContextValue = {
  locale: Locale;
  dir: 'ltr' | 'rtl';
  locales: readonly Locale[];
  localeLabel: (locale: Locale) => string;
  setLocale: (locale: Locale) => void;
  t: (key: string, params?: TranslationParams) => string;
  categoryLabel: (category: IssueCategory) => string;
  statusLabel: (status: IssueStatus) => string;
  formatDateTime: (value: string | number | Date) => string;
  formatNumber: (value: number) => string;
};

const I18nContext = createContext<I18nContextValue | null>(null);

export function I18nProvider({
  initialLocale,
  children,
}: {
  initialLocale: Locale;
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [locale, setLocaleState] = useState<Locale>(initialLocale);

  const contextValue = useMemo<I18nContextValue>(() => {
    const t = createTranslator(locale);
    return {
      locale,
      dir: getDirection(locale),
      locales: SUPPORTED_LOCALES,
      localeLabel: (selectedLocale) => LOCALE_LABELS[selectedLocale],
      setLocale: (nextLocale) => {
        if (nextLocale === locale) return;
        setLocaleState(nextLocale);
        document.cookie = `${LOCALE_COOKIE_NAME}=${nextLocale}; path=/; max-age=31536000; samesite=lax`;
        document.documentElement.lang = LOCALE_TO_HTML_LANG[nextLocale];
        document.documentElement.dir = getDirection(nextLocale);
        router.refresh();
      },
      t,
      categoryLabel: (category) => CATEGORY_LABELS[locale][category],
      statusLabel: (status) => STATUS_LABELS[locale][status],
      formatDateTime: (value) => formatDateTime(locale, value),
      formatNumber: (value) => formatNumber(locale, value),
    };
  }, [locale, router]);

  return <I18nContext.Provider value={contextValue}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const context = useContext(I18nContext);
  if (!context) throw new Error('useI18n must be used within I18nProvider.');
  return context;
}
