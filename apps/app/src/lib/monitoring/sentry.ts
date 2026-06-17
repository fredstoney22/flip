import * as Sentry from '@sentry/sveltekit';

const tracesSampleRate = process.env.NODE_ENV === 'production' ? 0.1 : 1;

export function initServerSentry(): void {
  const dsn = process.env.SENTRY_DSN;
  if (!dsn) return;

  Sentry.init({
    dsn,
    environment: process.env.VERCEL_ENV ?? process.env.NODE_ENV ?? 'development',
    tracesSampleRate
  });
}

export function initClientSentry(dsn: string | undefined): void {
  if (!dsn) return;

  Sentry.init({
    dsn,
    environment: import.meta.env.MODE,
    tracesSampleRate
  });
}
