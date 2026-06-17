import { randomUUID } from 'crypto';
import { db, dailyPuzzle, eq } from './index.js';

/** Pack used for the public daily puzzle rotation. */
export const DAILY_PACK_SLUG = 'intro-pack';

/** Number of intro-pack puzzles to rotate through (puzzles 1–10). */
export const DAILY_PUZZLE_ROTATION_COUNT = 10;

/** How many calendar days ahead to pre-schedule (today + future days). */
export const DAILY_SCHEDULE_LOOKAHEAD_DAYS = 14;

export type DailyPuzzleRow = typeof dailyPuzzle.$inferSelect;

/** UTC calendar date as YYYY-MM-DD (matches existing API behaviour). */
export function formatDateUtc(date: Date): string {
	return date.toISOString().slice(0, 10);
}

/** Add whole UTC calendar days to a YYYY-MM-DD string. */
export function addDaysUtc(dateStr: string, days: number): string {
	const [year, month, day] = dateStr.split('-').map(Number);
	return formatDateUtc(new Date(Date.UTC(year, month - 1, day + days)));
}

/**
 * Deterministic puzzle number (1-based) for a calendar date.
 * Rotates through 1..puzzleCount using UTC epoch days so the same date
 * always maps to the same puzzle, regardless of when the row is inserted.
 */
export function puzzleIdForDate(dateStr: string, puzzleCount = DAILY_PUZZLE_ROTATION_COUNT): number {
	const [year, month, day] = dateStr.split('-').map(Number);
	const epochDays = Math.floor(Date.UTC(year, month - 1, day) / 86_400_000);
	return (epochDays % puzzleCount) + 1;
}

export function dailyPuzzleAssignment(dateStr: string): { packSlug: string; puzzleId: number } {
	return {
		packSlug: DAILY_PACK_SLUG,
		puzzleId: puzzleIdForDate(dateStr)
	};
}

/** Returns the scheduled row for a date, or undefined if none exists. */
export async function getDailyPuzzleForDate(dateStr: string): Promise<DailyPuzzleRow | undefined> {
	const rows = await db
		.select()
		.from(dailyPuzzle)
		.where(eq(dailyPuzzle.date, dateStr))
		.limit(1);

	return rows[0];
}

/**
 * Ensures a daily_puzzle row exists for the given UTC date.
 * Idempotent — existing curated rows are never overwritten.
 */
export async function ensureDailyPuzzleForDate(dateStr: string): Promise<DailyPuzzleRow> {
	const existing = await getDailyPuzzleForDate(dateStr);
	if (existing) return existing;

	const { packSlug, puzzleId } = dailyPuzzleAssignment(dateStr);

	await db
		.insert(dailyPuzzle)
		.values({
			id: randomUUID(),
			date: dateStr,
			packSlug,
			puzzleId,
			createdAt: new Date()
		})
		.onConflictDoNothing();

	const row = await getDailyPuzzleForDate(dateStr);
	if (!row) {
		throw new Error(`Failed to ensure daily puzzle for ${dateStr}`);
	}

	return row;
}

/**
 * Pre-schedules daily puzzles from today through today + (lookaheadDays - 1).
 * Returns how many new rows were created.
 */
export async function ensureDailyPuzzleWindow(
	lookaheadDays = DAILY_SCHEDULE_LOOKAHEAD_DAYS
): Promise<{ created: number; scheduled: string[] }> {
	const today = formatDateUtc(new Date());
	let created = 0;
	const scheduled: string[] = [];

	for (let offset = 0; offset < lookaheadDays; offset++) {
		const dateStr = addDaysUtc(today, offset);
		const before = await getDailyPuzzleForDate(dateStr);
		await ensureDailyPuzzleForDate(dateStr);
		const after = await getDailyPuzzleForDate(dateStr);

		if (after) {
			scheduled.push(dateStr);
			if (!before) created++;
		}
	}

	return { created, scheduled };
}
