import Link from 'next/link';
import { SiteShell } from '@/components/site-shell';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, SectionEyebrow } from '@/components/ui';
import { getCurrentSession } from '@/lib/auth-api';
import { getServerI18n } from '@/lib/i18n/server';

export default async function IndexPage() {
  const [{ t }, currentUser] = await Promise.all([getServerI18n(), getCurrentSession()]);
  const metrics = [
    { label: t('Report time'), value: '<60s' },
    { label: t('Public status flow'), value: t('4 states') },
    { label: t('Map-first scan'), value: t('Live') },
  ];

  return (
    <SiteShell activePage="home" currentUser={currentUser}>
      <section className="grid gap-6">
        <Card className="overflow-hidden">
          <CardHeader className="border-b border-border bg-[linear-gradient(180deg,rgba(255,255,255,0.72),rgba(255,255,255,0.2))]">
            <SectionEyebrow>{t('VisibleFix / Civic trust-powered reporting')}</SectionEyebrow>
            <CardTitle className="mt-3 max-w-4xl text-5xl sm:text-6xl">
              {t('Report city issues. Track their progress. Drive real change.')}
            </CardTitle>
            <CardDescription className="max-w-3xl text-base">
              {t(
                'VisibleFix is a public platform for reporting infrastructure problems like potholes and broken lights. By making every issue and its status transparent, we empower citizens and help municipalities respond to what matters.'
              )}
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-6">
              <div className="grid gap-px border border-border bg-border sm:grid-cols-3">
                {metrics.map((metric) => (
                  <div key={metric.label} className="bg-card p-4">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">{metric.label}</p>
                    <p className="vf-display mt-3 text-3xl font-semibold">{metric.value}</p>
                  </div>
                ))}
              </div>

              <div className="flex flex-wrap gap-3">
                <Link
                  href="/report"
                  className="inline-flex min-h-11 items-center justify-center border border-primary bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground transition hover:bg-[#1a1a1d]"
                >
                  {t('Open report intake')}
                </Link>
                <Link
                  href="/issues"
                  className="inline-flex min-h-11 items-center justify-center border border-border bg-card px-5 py-3 text-sm font-semibold text-foreground transition hover:bg-secondary"
                >
                  {t('View issue grid')}
                </Link>
                <Link
                  href="/admin"
                  className="inline-flex min-h-11 items-center justify-center border border-border bg-card px-5 py-3 text-sm font-semibold text-foreground transition hover:bg-secondary"
                >
                  {t('Open operations')}
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>
    </SiteShell>
  );
}
