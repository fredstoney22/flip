import { auth } from '@flip/auth';
import { initServerSentry } from '$lib/monitoring/sentry';
import * as Sentry from '@sentry/sveltekit';
import { sequence } from '@sveltejs/kit/hooks';
import type { Handle } from '@sveltejs/kit';

initServerSentry();

const BILLING_RATE_LIMIT_MS = 10_000;
const checkoutAttempts = new Map<string, number>();

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

export const handle = sequence(Sentry.sentryHandle(), authHandle);
export const handleError = Sentry.handleErrorWithSentry();
