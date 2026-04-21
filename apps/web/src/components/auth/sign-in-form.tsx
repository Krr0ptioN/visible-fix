'use client';

import { startTransition, useState } from 'react';
import { useRouter } from 'next/navigation';
import type { AuthUser } from '@visiblefix/shared/types';
import { getPostAuthRedirectPath } from '@/lib/auth-redirect';
import { useI18n } from '@/components/i18n-provider';
import { Button, Input } from '@/components/ui';

export function SignInForm({
  nextPath,
}: {
  nextPath?: string | null;
}) {
  const router = useRouter();
  const { t } = useI18n();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      const response = await fetch('/api/v1/auth/sign-in', {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
        },
        body: JSON.stringify({
          email,
          password,
        }),
      });

      const body = (await response.json().catch(() => null)) as { data?: AuthUser; message?: string } | null;

      if (!response.ok || !body?.data) {
        throw new Error(body?.message || t('Unable to sign in.'));
      }

      const destination = getPostAuthRedirectPath(body.data, nextPath);

      startTransition(() => {
        router.replace(destination);
        router.refresh();
      });
    } catch (submissionError) {
      setError(submissionError instanceof Error ? submissionError.message : t('Unable to sign in.'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form className="grid gap-4" onSubmit={handleSubmit}>
      <label className="grid gap-2 text-sm font-medium text-foreground">
        {t('Email')}
        <Input type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder={t('you@example.com')} />
      </label>

      <label className="grid gap-2 text-sm font-medium text-foreground">
        {t('Password')}
        <Input
          type="password"
          autoComplete="current-password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          placeholder={t('Enter your password')}
        />
      </label>

      {error ? <p className="border border-[#fda29b] bg-[#fef3f2] px-4 py-3 text-sm text-[#b42318]">{error}</p> : null}

      <Button type="submit" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? t('Signing in…') : t('Sign in')}
      </Button>
    </form>
  );
}
