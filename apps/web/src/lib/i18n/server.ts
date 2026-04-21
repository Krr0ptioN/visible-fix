import { cookies } from 'next/headers';
import { type IssueCategory, type IssueStatus } from '@visiblefix/shared/types';
import {
  CATEGORY_LABELS,
  DEFAULT_LOCALE,
  LOCALE_COOKIE_NAME,
  LOCALE_TO_HTML_LANG,
  LOCALE_TO_INTL_LANG,
  STATUS_LABELS,
  createTranslator,
  formatDateTime,
  formatNumber,
  getDirection,
  isLocale,
  type Locale,
} from './config';

export async function getServerLocale(): Promise<Locale> {
  const cookieStore = await cookies();
  const cookieLocale = cookieStore.get(LOCALE_COOKIE_NAME)?.value;
  if (isLocale(cookieLocale)) return cookieLocale;
  return DEFAULT_LOCALE;
}

export async function getServerI18n() {
  const locale = await getServerLocale();
  const t = createTranslator(locale);

  return {
    locale,
    htmlLang: LOCALE_TO_HTML_LANG[locale],
    intlLang: LOCALE_TO_INTL_LANG[locale],
    dir: getDirection(locale),
    t,
    categoryLabel: (category: IssueCategory) => CATEGORY_LABELS[locale][category],
    statusLabel: (status: IssueStatus) => STATUS_LABELS[locale][status],
    formatDateTime: (value: string | number | Date) => formatDateTime(locale, value),
    formatNumber: (value: number) => formatNumber(locale, value),
  };
}

