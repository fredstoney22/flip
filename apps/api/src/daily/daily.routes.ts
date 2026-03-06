import { Hono } from 'hono';
import { db, dailyPuzzle, puzzle, pack, eq, and } from '@flip/db';

const app = new Hono();

/**
 * GET /daily
 * Returns today's curated puzzle config. No auth required.
 * Looks up today's date (YYYY-MM-DD) in the daily_puzzle table,
 * then resolves the full puzzle config from the DB.
 */
app.get('/', async (c) => {
	const today = new Date().toISOString().slice(0, 10);

	const rows = await db
		.select()
		.from(dailyPuzzle)
		.where(eq(dailyPuzzle.date, today))
		.limit(1);

	if (!rows.length) {
		return c.json({ error: 'No daily puzzle scheduled for today' }, 404);
	}

	const { packSlug, puzzleId, date } = rows[0];

	const packRows = await db
		.select({ id: pack.id })
		.from(pack)
		.where(and(eq(pack.slug, packSlug), eq(pack.active, true)))
		.limit(1);

	if (!packRows.length) {
		return c.json({ error: 'Daily puzzle references an unknown pack' }, 500);
	}

	const puzzleRows = await db
		.select()
		.from(puzzle)
		.where(and(eq(puzzle.packId, packRows[0].id), eq(puzzle.puzzleNumber, puzzleId)))
		.limit(1);

	if (!puzzleRows.length) {
		return c.json({ error: 'Daily puzzle references an unknown puzzle' }, 500);
	}

	const p = puzzleRows[0];
	return c.json({
		date,
		packSlug,
		puzzleId,
		config: {
			startState: JSON.parse(p.startState) as number[][],
			templates: JSON.parse(p.templates) as number[][][]
		}
	});
});

export { app as dailyRoutes };
