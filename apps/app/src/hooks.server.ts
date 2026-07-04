import { auth } from '@flip/auth';
import { initServerSentry } from '$lib/monitoring/sentry';
import { paraglideMiddleware } from '$lib/paraglide/server';
import * as Sentry from '@sentry/sveltekit';
import { sequence } from '@sveltejs/kit/hooks';
import type { Handle } from '@sveltejs/kit';

initServerSentry();

const BILLING_RATE_LIMIT_MS = 10_000;
const checkoutAttempts = new Map<string, number>();

// Locale resolution: an explicit choice from the settings store (mirrored into the
// `PARAGLIDE_LOCALE` cookie by `settings.setLocale`) wins; otherwise detect from the
// `Accept-Language` header; final fallback is the base locale (en). See
// apps/app/vite.config.ts for the matching `strategy` array.
const paraglideHandle: Handle = ({ event, resolve }) =>
  paraglideMiddleware(event.request, ({ request, locale }) => {
    event.request = request;
    event.locals.locale = locale;
    return resolve(event, {
      transformPageChunk: ({ html }) => html.replace('%paraglide.lang%', locale)
    });
  });

const authHandle: Handle = async ({ event, resolve }) => {
  try {
    const session = await auth.api.getSession({
      headers: event.request.headers
    });

    event.locals.user = session?.user ?? null;
    event.locals.session = session?.session ?? null;
  } catch {
    event.locals.user = null;
    event.locals.session = null;
  }

  if (event.request.method === 'POST' && event.url.pathname === '/billing') {
    const userId = event.locals.user?.id;
    if (userId) {
      const lastAttempt = checkoutAttempts.get(userId) ?? 0;
      if (Date.now() - lastAttempt < BILLING_RATE_LIMIT_MS) {
        return new Response('Too many requests', { status: 429 });
      }
      checkoutAttempts.set(userId, Date.now());
    }
  }

  return resolve(event);
};

export const handle = sequence(Sentry.sentryHandle(), paraglideHandle, authHandle);
export const handleError = Sentry.handleErrorWithSentry();
