'use client';

import { startTransition, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getPostAuthRedirectPath } from '@/lib/auth-redirect';
import { useI18n } from '@/components/i18n-provider';
import { Button, Input } from '@/components/ui';
import { useSignInMutation } from './api';

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
  const signInMutation = useSignInMutation();

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');

    try {
      const user = await signInMutation.mutateAsync({ email, password });
      const destination = getPostAuthRedirectPath(user, nextPath);

      startTransition(() => {
        router.replace(destination);
        router.refresh();
      });
    } catch (submissionError) {
      setError(submissionError instanceof Error ? submissionError.message : t('Unable to sign in.'));
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

      <Button type="submit" className="w-full" disabled={signInMutation.isPending}>
        {signInMutation.isPending ? t('Signing in…') : t('Sign in')}
      </Button>
    </form>
  );
}
