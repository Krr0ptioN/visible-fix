'use client';

import { startTransition, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useI18n } from '@/components/i18n-provider';
import { Button } from '@/components/ui';

export function AdminSignOutButton() {
  const router = useRouter();
  const { t } = useI18n();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSignOut = async () => {
    setIsSubmitting(true);

    try {
      await fetch('/api/v1/auth/sign-out', {
        method: 'POST',
      });
    } finally {
      startTransition(() => {
        router.replace('/admin/login');
        router.refresh();
      });
      setIsSubmitting(false);
    }
  };

  return (
    <Button variant="outline" onClick={() => void handleSignOut()} disabled={isSubmitting} className="w-full">
      {isSubmitting ? t('Signing out…') : t('Sign out')}
    </Button>
  );
}
