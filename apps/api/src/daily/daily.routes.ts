import { Hono } from 'hono';
import { db, puzzle, pack, eq, and } from '@flip/db';
import {
	ensureDailyPuzzleForDate,
	formatDateUtc,
	type DailyPuzzleRow
} from '@flip/db/dailyPuzzleSchedule';
import { parseStoredPuzzle } from '@flip/game';

const app = new Hono();

async function resolveDailyPuzzleResponse(row: DailyPuzzleRow) {
	const { packSlug, puzzleId, date } = row;

	const packRows = await db
		.select({ id: pack.id })
		.from(pack)
		.where(and(eq(pack.slug, packSlug), eq(pack.active, true)))
		.limit(1);

	if (!packRows.length) {
		return { error: 'Daily puzzle references an unknown pack', status: 500 as const };
	}

	const puzzleRows = await db
		.select()
		.from(puzzle)
		.where(and(eq(puzzle.packId, packRows[0].id), eq(puzzle.puzzleNumber, puzzleId)))
		.limit(1);

	if (!puzzleRows.length) {
		return { error: 'Daily puzzle references an unknown puzzle', status: 500 as const };
	}

	const p = puzzleRows[0];
	const config = parseStoredPuzzle(p.startState, p.templates);

	return {
		body: {
			date,
			packSlug,
			puzzleId,
			config
		},
		status: 200 as const
	};
}

/**
 * GET /daily
 * Returns today's curated puzzle config. No auth required.
 * Creates today's schedule row on demand if missing (cron pre-schedules ahead as well).
 */
app.get('/', async (c) => {
	const today = formatDateUtc(new Date());

	let row: DailyPuzzleRow;
	try {
		row = await ensureDailyPuzzleForDate(today);
	} catch (error) {
		console.error('Failed to ensure daily puzzle:', error);
		return c.json({ error: 'No daily puzzle scheduled for today' }, 404);
	}

	const result = await resolveDailyPuzzleResponse(row);
	if ('error' in result) {
		return c.json({ error: result.error }, result.status);
	}

	return c.json(result.body);
});

export { app as dailyRoutes };
