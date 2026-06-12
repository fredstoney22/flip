import { OpenAPIHono } from '@hono/zod-openapi';
import { csrf } from 'hono/csrf';
import { logger } from 'hono/logger';
import { db } from '@flip/db';
import { sql } from 'drizzle-orm';
import { prettyJSON } from 'hono/pretty-json';
import { requestId } from 'hono/request-id';
import { handleZodError, handleError } from '@lib/errors';
import { Scalar } from '@scalar/hono-api-reference';
import { stripeRoutes } from './stripe/stripe.routes';
import { progressRoutes } from './progress/progress.routes';
import { dailyRoutes } from './daily/daily.routes';
import { packsRoutes } from './packs/packs.routes';

/** Hono routes mounted under `/api` (same origin as SvelteKit on Vercel). */
const api = new OpenAPIHono({
	defaultHook: handleZodError
});

api.route('/webhooks', stripeRoutes);

api.use(csrf());

api.get('/healthcheck', async (c) => {
	try {
		await db.execute(sql`SELECT 1`);
		return c.json({ status: 'ok' });
	} catch (error) {
		console.error('Healthcheck failed:', error);
		return c.json({ status: 'error' }, { status: 500 });
	}
});

api.openAPIRegistry.registerComponent('securitySchemes', 'Bearer', {
	type: 'http',
	scheme: 'bearer'
});

api.doc('/openapi.json', (c) => ({
	openapi: '3.0.0',
	info: {
		version: '1.0.0',
		title: 'Flip API'
	},
	servers: [
		{
			url: new URL(c.req.url).origin,
			description: 'Flip API server'
		}
	]
}));

api.get('/reference', Scalar({ url: '/api/openapi.json', showDeveloperTools: 'never' }));

api.route('/progress', progressRoutes);
api.route('/daily', dailyRoutes);
api.route('/packs', packsRoutes);

export const app = new OpenAPIHono({
	defaultHook: handleZodError
});

app.use(requestId());
app.use(logger());
app.use(prettyJSON());
app.onError(handleError);
app.route('/api', api);
