import { Hono } from 'hono';
import { db, puzzle, pack, eq, and } from '@flip/db';
import {
	getDailyPuzzleForDate,
	storeDailyGeneratedPuzzle,
	formatDateUtc,
	type DailyPuzzleRow
} from '@flip/db/dailyPuzzleSchedule';
import {
	parseStoredPuzzle,
	generateDailyPuzzle,
	dailyGenerationKind,
	epochDaysForDate
} from '@flip/game';
import type { PuzzleConfig } from '@flip/game';

const app = new Hono();

async function resolveDailyPuzzleResponse(row: DailyPuzzleRow) {
	const { date } = row;

	if (row.generatedConfig) {
		const config = JSON.parse(row.generatedConfig) as PuzzleConfig;
		return {
			body: { date, packSlug: null, puzzleId: null, config },
			status: 200 as const
		};
	}

	const { packSlug, puzzleId } = row;
	if (!packSlug || puzzleId === null) {
		return { error: 'Daily puzzle row is missing required fields', status: 500 as const };
	}

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
		body: { date, packSlug, puzzleId, config },
		status: 200 as const
	};
}

/**
 * GET /daily
 * Returns today's procedurally generated puzzle config. No auth required.
 * Generates and stores a puzzle on demand if the cron hasn't run yet.
 */
app.get('/', async (c) => {
	const today = formatDateUtc(new Date());

	let row = await getDailyPuzzleForDate(today);
	if (!row) {
		try {
			const epochDays = epochDaysForDate(today);
			const config = generateDailyPuzzle(epochDays);
			const kind = dailyGenerationKind(epochDays);
			row = await storeDailyGeneratedPuzzle(today, JSON.stringify(config), kind);
		} catch (error) {
			console.error('Failed to generate daily puzzle:', error);
			return c.json({ error: 'No daily puzzle scheduled for today' }, 404);
		}
	}

	const result = await resolveDailyPuzzleResponse(row);
	if ('error' in result) {
		return c.json({ error: result.error }, result.status);
	}

	return c.json(result.body);
});

export { app as dailyRoutes };
