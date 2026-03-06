import { Hono } from 'hono';
import { HTTPException } from 'hono/http-exception';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { db, packAccess, puzzleProgress, savedGameState, eq, and } from '@flip/db';
import { auth } from '@flip/auth';

const app = new Hono();

/** Resolve the authenticated user from the request, or throw 401. */
async function requireUser(req: Request) {
	const session = await auth.api.getSession({ headers: req.headers });
	if (!session?.user) throw new HTTPException(401, { message: 'Unauthorized' });
	return session.user;
}

/**
 * GET /progress
 * Returns all pack access grants and puzzle completions for the current user.
 */
app.get('/', async (c) => {
	const user = await requireUser(c.req.raw);

	const [accessRows, progressRows] = await Promise.all([
		db.select().from(packAccess).where(eq(packAccess.userId, user.id)),
		db.select().from(puzzleProgress).where(eq(puzzleProgress.userId, user.id))
	]);

	return c.json({
		packAccess: accessRows.map((r) => r.packSlug),
		progress: progressRows.map((r) => ({
			packSlug: r.packSlug,
			puzzleId: r.puzzleId,
			bestMoveCount: r.bestMoveCount,
			completedAt: r.completedAt
		}))
	});
});

const saveProgressBody = z.object({
	packSlug: z.string().min(1),
	puzzleId: z.number().int().positive(),
	moveCount: z.number().int().positive()
});

/**
 * POST /progress
 * Upserts a puzzle completion record, keeping the lowest move count as the best.
 */
app.post('/', zValidator('json', saveProgressBody), async (c) => {
	const user = await requireUser(c.req.raw);
	const { packSlug, puzzleId, moveCount } = c.req.valid('json');

	const existing = await db
		.select({ bestMoveCount: puzzleProgress.bestMoveCount })
		.from(puzzleProgress)
		.where(
			and(
				eq(puzzleProgress.userId, user.id),
				eq(puzzleProgress.packSlug, packSlug),
				eq(puzzleProgress.puzzleId, puzzleId)
			)
		)
		.limit(1);

	const bestMoveCount =
		existing.length > 0 ? Math.min(existing[0].bestMoveCount, moveCount) : moveCount;

	await db
		.insert(puzzleProgress)
		.values({
			id: crypto.randomUUID(),
			userId: user.id,
			packSlug,
			puzzleId,
			bestMoveCount,
			completedAt: new Date()
		})
		.onConflictDoUpdate({
			target: [puzzleProgress.userId, puzzleProgress.packSlug, puzzleProgress.puzzleId],
			set: { bestMoveCount, completedAt: new Date() }
		});

	return c.json({ bestMoveCount });
});

/**
 * GET /progress/game-state
 * Returns the user's saved in-progress game, or null if none exists.
 */
app.get('/game-state', async (c) => {
	const user = await requireUser(c.req.raw);

	const rows = await db
		.select()
		.from(savedGameState)
		.where(eq(savedGameState.userId, user.id))
		.limit(1);

	if (!rows.length) return c.json(null);

	const row = rows[0];
	return c.json({
		packSlug: row.packSlug,
		puzzleId: row.puzzleId,
		puzzleState: JSON.parse(row.puzzleState) as number[][],
		moveCount: row.moveCount,
		updatedAt: row.updatedAt
	});
});

const saveGameStateBody = z.object({
	packSlug: z.string().min(1),
	puzzleId: z.number().int().nonnegative().nullable(),
	puzzleState: z.array(z.array(z.number().int().min(0).max(1))),
	moveCount: z.number().int().nonnegative()
});

/**
 * POST /progress/game-state
 * Upserts the user's saved in-progress game state.
 */
app.post('/game-state', zValidator('json', saveGameStateBody), async (c) => {
	const user = await requireUser(c.req.raw);
	const { packSlug, puzzleId, puzzleState, moveCount } = c.req.valid('json');

	await db
		.insert(savedGameState)
		.values({
			userId: user.id,
			packSlug,
			puzzleId,
			puzzleState: JSON.stringify(puzzleState),
			moveCount,
			updatedAt: new Date()
		})
		.onConflictDoUpdate({
			target: savedGameState.userId,
			set: {
				packSlug,
				puzzleId,
				puzzleState: JSON.stringify(puzzleState),
				moveCount,
				updatedAt: new Date()
			}
		});

	return c.json({ ok: true });
});

export { app as progressRoutes };
