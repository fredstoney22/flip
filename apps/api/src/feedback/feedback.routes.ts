import { Hono } from 'hono';
import { HTTPException } from 'hono/http-exception';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { db, feedback } from '@flip/db';
import { auth } from '@flip/auth';

const app = new Hono();

async function requireUser(req: Request) {
	const session = await auth.api.getSession({ headers: req.headers });
	if (!session?.user) throw new HTTPException(401, { message: 'Unauthorized' });
	return session.user;
}

const submitFeedbackBody = z.object({
	message: z.string().min(1).max(2000)
});

/** POST /feedback — saves feedback from an authenticated user. */
app.post('/', zValidator('json', submitFeedbackBody), async (c) => {
	const user = await requireUser(c.req.raw);
	const { message } = c.req.valid('json');

	await db.insert(feedback).values({
		id: crypto.randomUUID(),
		userId: user.id,
		message,
		createdAt: new Date()
	});

	return c.json({ ok: true });
});

export { app as feedbackRoutes };
