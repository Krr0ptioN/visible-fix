import './global.css';
import { Changa } from 'next/font/google';
import { GoogleAnalytics } from '@next/third-parties/google';
import { Analytics } from '@vercel/analytics/next';
import { I18nProvider } from '@/components/i18n-provider';
import { QueryProvider } from '@/components/query-provider';
import { getServerI18n } from '@/lib/i18n/server';

const changa = Changa({
  subsets: ['arabic'],
  weight: ['400', '500', '600', '700', '800'],
  display: 'swap',
  variable: '--font-fa',
});

export const metadata = {
  title: 'VisibleFix',
  description: 'Canlı harita bağlamı ve net durum akışlarıyla modern kent sorunu bildirimi.',
  icons: {
    icon: '/icon.svg',
  },
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const i18n = await getServerI18n();
  const gaMeasurementId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;

  return (
    <html lang={i18n.htmlLang} dir={i18n.dir}>
      <body className={changa.variable}>
        <QueryProvider>
          <I18nProvider initialLocale={i18n.locale}>
            {children}
          </I18nProvider>
        </QueryProvider>
        <Analytics />
        {gaMeasurementId ? <GoogleAnalytics gaId={gaMeasurementId} /> : null}
      </body>
    </html>
  );
}
