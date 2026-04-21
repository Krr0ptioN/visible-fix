import Link from 'next/link';
import { redirect } from 'next/navigation';
import { SignUpForm } from '@/components/auth/sign-up-form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, SectionEyebrow } from '@/components/ui';
import { getCurrentSession } from '@/lib/auth-api';
import { getPostAuthRedirectPath } from '@/lib/auth-redirect';
import { getServerI18n } from '@/lib/i18n/server';

type SearchValue = string | string[] | undefined;

type SignUpPageProps = {
  searchParams: Promise<Record<string, SearchValue>>;
};

function getSingleValue(value: SearchValue) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function SignUpPage({
  searchParams,
}: SignUpPageProps) {
  const rawParams = await searchParams;
  const nextPath = getSingleValue(rawParams.next);
  const { t } = await getServerI18n();
  const session = await getCurrentSession();

  if (session) {
    redirect(getPostAuthRedirectPath(session, nextPath));
  }

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#f7f1e7_0%,#ece4d7_100%)] px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto grid max-w-[1180px] gap-6 lg:grid-cols-[1.15fr_520px]">
        <section className="border border-border bg-[rgba(15,16,18,0.98)] p-6 text-white shadow-tight sm:p-8">
          <SectionEyebrow>{t('Create account')}</SectionEyebrow>
          <h1 className="vf-display mt-4 text-5xl font-bold tracking-[-0.07em]">{t('Create your VisibleFix account in one step.')}</h1>
          <p className="mt-4 max-w-xl text-base leading-7 text-white/68">
            {t(
              'New accounts are created as standard application users. Elevated access stays controlled on the backend and redirects into the dashboard only when the role allows it.'
            )}
          </p>

          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            <div className="border border-white/10 bg-white/5 p-4">
              <p className="text-[11px] uppercase tracking-[0.18em] text-white/45">{t('Default role')}</p>
              <p className="mt-2 text-lg font-semibold">{t('Citizen account')}</p>
              <p className="mt-2 text-sm leading-6 text-white/62">{t('Fresh sign-ups enter the public issue reporting flow by default.')}</p>
            </div>
            <div className="border border-white/10 bg-white/5 p-4">
              <p className="text-[11px] uppercase tracking-[0.18em] text-white/45">{t('Controlled elevation')}</p>
              <p className="mt-2 text-lg font-semibold">{t('Backend-managed roles')}</p>
              <p className="mt-2 text-sm leading-6 text-white/62">{t('Admin-capable roles are assigned outside the public sign-up form.')}</p>
            </div>
          </div>
        </section>

        <Card className="self-center">
          <CardHeader>
            <SectionEyebrow>{t('Create account')}</SectionEyebrow>
            <CardTitle className="mt-3 text-4xl">{t('Create your account.')}</CardTitle>
            <CardDescription>{t('Start reporting, tracking, and supporting civic issues.')}</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-5">
            <SignUpForm nextPath={nextPath} />
            <p className="text-sm text-muted-foreground">
              {t('Already have an account?')}{' '}
              <Link href={nextPath ? `/sign-in?next=${encodeURIComponent(nextPath)}` : '/sign-in'} className="font-semibold text-foreground">
                {t('Sign in')}
              </Link>
              .
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
