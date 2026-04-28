'use client';

import * as Sentry from '@sentry/nextjs';
import { useEffect } from 'react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <html>
      <body style={{ margin: 0, fontFamily: 'system-ui, sans-serif', background: '#f3f3f1', color: '#111114' }}>
        <main style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', padding: 24 }}>
          <section style={{ maxWidth: 560, width: '100%', background: '#fff', border: '1px solid #e6e7eb', padding: 24 }}>
            <h1 style={{ marginTop: 0, marginBottom: 12, fontSize: 24 }}>Something went wrong</h1>
            <p style={{ marginTop: 0, marginBottom: 16, lineHeight: 1.6 }}>
              We logged this error and can investigate it. Please try again.
            </p>
            <button
              type="button"
              onClick={reset}
              style={{
                border: 0,
                background: '#111114',
                color: '#fff',
                padding: '10px 14px',
                cursor: 'pointer',
                fontWeight: 600,
              }}
            >
              Retry
            </button>
          </section>
        </main>
      </body>
    </html>
  );
}
