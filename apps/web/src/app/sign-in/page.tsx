import Link from 'next/link';
import { redirect } from 'next/navigation';
import { SignInForm } from '@/components/auth/sign-in-form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, SectionEyebrow } from '@/components/ui';
import { getCurrentSession } from '@/lib/auth-api';
import { getPostAuthRedirectPath } from '@/lib/auth-redirect';
import { getServerI18n } from '@/lib/i18n/server';

type SearchValue = string | string[] | undefined;

type SignInPageProps = {
  searchParams: Promise<Record<string, SearchValue>>;
};

function getSingleValue(value: SearchValue) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function SignInPage({
  searchParams,
}: SignInPageProps) {
  const rawParams = await searchParams;
  const nextPath = getSingleValue(rawParams.next);
  const { t } = await getServerI18n();
  const session = await getCurrentSession();

  if (session) {
    redirect(getPostAuthRedirectPath(session, nextPath));
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[linear-gradient(180deg,#f7f1e7_0%,#ece4d7_100%)] px-4 py-10 sm:px-6 lg:px-8">
      <div className="w-full max-w-[480px]">
        <Card>
          <CardHeader>
            <SectionEyebrow>{t('Sign in')}</SectionEyebrow>
            <CardTitle className="mt-3 text-4xl">{t('Access your account.')}</CardTitle>
            <CardDescription>{t('Use your VisibleFix credentials to continue.')}</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-5">
            <SignInForm nextPath={nextPath} />
            <p className="text-sm text-muted-foreground">
              {t("Don't have an account?")}{' '}
              <Link href={nextPath ? `/sign-up?next=${encodeURIComponent(nextPath)}` : '/sign-up'} className="font-semibold text-foreground">
                {t('Create one')}
              </Link>
              .
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
