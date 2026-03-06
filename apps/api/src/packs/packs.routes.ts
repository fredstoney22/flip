import { Hono } from 'hono';
import { HTTPException } from 'hono/http-exception';
import { count } from 'drizzle-orm';
import { db, pack, puzzle, packAccess, eq, and, asc } from '@flip/db';
import { auth } from '@flip/auth';
import { GENERATED_COLOR_PACK } from '@flip/game';

const app = new Hono();

/** Silently resolve the session user — returns null if unauthenticated. */
async function optionalUser(req: Request) {
	const session = await auth.api.getSession({ headers: req.headers }).catch(() => null);
	return session?.user ?? null;
}

/** Resolve the authenticated user from the request, or throw 401. */
async function requireUser(req: Request) {
	const user = await optionalUser(req);
	if (!user) throw new HTTPException(401, { message: 'Unauthorized' });
	return user;
}

const COLOR_PACK_SLUG = 'color-lab';
const COLOR_PACK_NAME = 'Color Lab';

/**
 * GET /packs
 * Returns all active packs.
 * If authenticated, enriches each pack with whether the user has access.
 */
app.get('/', async (c) => {
	const user = await optionalUser(c.req.raw);

	const [packsFromDb, countRows] = await Promise.all([
		db.select().from(pack).where(eq(pack.active, true)).orderBy(asc(pack.sortOrder)),
		db.select({ packId: puzzle.packId, total: count() }).from(puzzle).groupBy(puzzle.packId)
	]);

	const totalByPackId = new Map(countRows.map((r) => [r.packId, Number(r.total)]));

	let unlockedSlugs = new Set<string>();
	if (user) {
		const accessRows = await db
			.select({ packSlug: packAccess.packSlug })
			.from(packAccess)
			.where(eq(packAccess.userId, user.id));
		unlockedSlugs = new Set(accessRows.map((r) => r.packSlug));
	}

	const dbPayload = packsFromDb.map((p) => ({
			id: p.id,
			name: p.name,
			slug: p.slug,
			access: p.access,
			sortOrder: p.sortOrder,
			total: totalByPackId.get(p.id) ?? 0,
			hasAccess: p.access === 'free' || unlockedSlugs.has(p.slug)
		}));

	// Append a virtual colour pack that is backed by in-memory configs in @flip/game.
	const colorPack = {
		id: COLOR_PACK_SLUG,
		name: COLOR_PACK_NAME,
		slug: COLOR_PACK_SLUG,
		access: 'free',
		sortOrder: 1000,
		total: GENERATED_COLOR_PACK.length,
		hasAccess: true
	};

	return c.json([...dbPayload, colorPack]);
});

/**
 * GET /packs/:slug/puzzles
 * Returns the puzzle list (without grid data) for a pack.
 * Free packs: no auth required. Paid packs: require auth + packAccess.
 */
app.get('/:slug/puzzles', async (c) => {
	const user = await optionalUser(c.req.raw);
	const slug = c.req.param('slug');

	// Virtual colour pack: puzzles live in @flip/game, not the DB.
	if (slug === COLOR_PACK_SLUG) {
		return c.json({
			packId: COLOR_PACK_SLUG,
			packName: COLOR_PACK_NAME,
			packSlug: COLOR_PACK_SLUG,
			puzzles: GENERATED_COLOR_PACK.map((_, index) => ({
				puzzleNumber: index + 1
			}))
		});
	}

	const packRows = await db
		.select()
		.from(pack)
		.where(and(eq(pack.slug, slug), eq(pack.active, true)))
		.limit(1);

	if (!packRows.length) {
		return c.json({ error: 'Pack not found' }, 404);
	}

	const packRow = packRows[0];

	if (packRow.access === 'paid') {
		if (!user) {
			return c.json({ error: 'Sign in required' }, 403);
		}
		const access = await db
			.select()
			.from(packAccess)
			.where(and(eq(packAccess.userId, user.id), eq(packAccess.packSlug, slug)))
			.limit(1);
		if (!access.length) {
			return c.json({ error: 'Access denied' }, 403);
		}
	}

	const puzzles = await db
		.select({
			puzzleNumber: puzzle.puzzleNumber,
			sortOrder: puzzle.sortOrder
		})
		.from(puzzle)
		.where(eq(puzzle.packId, packRow.id))
		.orderBy(asc(puzzle.sortOrder));

	return c.json({
		packId: packRow.id,
		packName: packRow.name,
		packSlug: packRow.slug,
		puzzles: puzzles.map((p) => ({ puzzleNumber: p.puzzleNumber }))
	});
});

/**
 * GET /packs/:slug/puzzles/:number
 * Returns the full puzzle config (startState + templates) for one puzzle.
 * Free packs: no auth required. Paid packs: require auth + packAccess.
 */
app.get('/:slug/puzzles/:number', async (c) => {
	const user = await optionalUser(c.req.raw);
	const slug = c.req.param('slug');
	const number = parseInt(c.req.param('number'), 10);

	if (isNaN(number)) {
		return c.json({ error: 'Invalid puzzle number' }, 400);
	}

	// Virtual colour pack: return colour puzzle config directly from @flip/game.
	if (slug === COLOR_PACK_SLUG) {
		if (number < 1 || number > GENERATED_COLOR_PACK.length) {
			return c.json({ error: 'Puzzle not found' }, 404);
		}
		const sample = GENERATED_COLOR_PACK[number - 1];
		return c.json({
			packSlug: COLOR_PACK_SLUG,
			puzzleNumber: number,
			mode: 'color' as const,
			config: sample.config
		});
	}

	const packRows = await db
		.select()
		.from(pack)
		.where(and(eq(pack.slug, slug), eq(pack.active, true)))
		.limit(1);

	if (!packRows.length) {
		return c.json({ error: 'Pack not found' }, 404);
	}

	const packRow = packRows[0];

	if (packRow.access === 'paid') {
		if (!user) {
			return c.json({ error: 'Sign in required' }, 403);
		}
		const access = await db
			.select()
			.from(packAccess)
			.where(and(eq(packAccess.userId, user.id), eq(packAccess.packSlug, slug)))
			.limit(1);
		if (!access.length) {
			return c.json({ error: 'Access denied' }, 403);
		}
	}

	const puzzleRows = await db
		.select()
		.from(puzzle)
		.where(and(eq(puzzle.packId, packRow.id), eq(puzzle.puzzleNumber, number)))
		.limit(1);

	if (!puzzleRows.length) {
		return c.json({ error: 'Puzzle not found' }, 404);
	}

	const p = puzzleRows[0];
	return c.json({
		packSlug: slug,
		puzzleNumber: p.puzzleNumber,
		config: {
			startState: JSON.parse(p.startState) as number[][],
			templates: JSON.parse(p.templates) as number[][][]
		}
	});
});

export { app as packsRoutes };
