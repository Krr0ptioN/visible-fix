'use client';

import { startTransition, useState } from 'react';
import { useRouter } from 'next/navigation';
import type { AuthUser } from '@visiblefix/shared/types';
import { getPostAuthRedirectPath } from '@/lib/auth-redirect';
import { useI18n } from '@/components/i18n-provider';
import { Button, Input } from '@/components/ui';

export function SignUpForm({
  nextPath,
}: {
  nextPath?: string | null;
}) {
  const router = useRouter();
  const { t } = useI18n();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError(t('Passwords do not match.'));
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch('/api/v1/auth/sign-up', {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
        },
        body: JSON.stringify({
          name,
          email,
          password,
        }),
      });

      const body = (await response.json().catch(() => null)) as { data?: AuthUser; message?: string } | null;

      if (!response.ok || !body?.data) {
        throw new Error(body?.message || t('Unable to create your account.'));
      }

      const destination = getPostAuthRedirectPath(body.data, nextPath);

      startTransition(() => {
        router.replace(destination);
        router.refresh();
      });
    } catch (submissionError) {
      setError(submissionError instanceof Error ? submissionError.message : t('Unable to create your account.'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form className="grid gap-4" onSubmit={handleSubmit}>
      <label className="grid gap-2 text-sm font-medium text-foreground">
        {t('Full name')}
        <Input type="text" autoComplete="name" value={name} onChange={(event) => setName(event.target.value)} placeholder={t('Ada Lovelace')} />
      </label>

      <label className="grid gap-2 text-sm font-medium text-foreground">
        {t('Email')}
        <Input type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder={t('you@example.com')} />
      </label>

      <label className="grid gap-2 text-sm font-medium text-foreground">
        {t('Password')}
        <Input
          type="password"
          autoComplete="new-password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          placeholder={t('At least 8 characters')}
        />
      </label>

      <label className="grid gap-2 text-sm font-medium text-foreground">
        {t('Confirm password')}
        <Input
          type="password"
          autoComplete="new-password"
          value={confirmPassword}
          onChange={(event) => setConfirmPassword(event.target.value)}
          placeholder={t('Repeat your password')}
        />
      </label>

      {error ? <p className="border border-[#fda29b] bg-[#fef3f2] px-4 py-3 text-sm text-[#b42318]">{error}</p> : null}

      <Button type="submit" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? t('Creating account…') : t('Create account')}
      </Button>
    </form>
  );
}
