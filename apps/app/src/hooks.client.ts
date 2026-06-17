import { initClientSentry } from '$lib/monitoring/sentry';
import { env } from '$env/dynamic/public';

initClientSentry(env.PUBLIC_SENTRY_DSN);
