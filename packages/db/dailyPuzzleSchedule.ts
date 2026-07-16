import { randomUUID } from 'crypto';
import { db, dailyPuzzle, eq } from './index.js';

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

/** Returns the scheduled row for a date, or undefined if none exists. */
export async function getDailyPuzzleForDate(dateStr: string): Promise<DailyPuzzleRow | undefined> {
	const rows = await db.select().from(dailyPuzzle).where(eq(dailyPuzzle.date, dateStr)).limit(1);

	return rows[0];
}

/**
 * Stores a freshly-generated puzzle inline for the given date.
 * Uses onConflictDoNothing so concurrent calls are safe — the winner's row is returned.
 */
export async function storeDailyGeneratedPuzzle(
	dateStr: string,
	configJson: string,
	kind: string
): Promise<DailyPuzzleRow> {
	await db
		.insert(dailyPuzzle)
		.values({
			id: randomUUID(),
			date: dateStr,
			packSlug: null,
			puzzleId: null,
			generatedConfig: configJson,
			generationKind: kind,
			createdAt: new Date()
		})
		.onConflictDoNothing();

	const row = await getDailyPuzzleForDate(dateStr);
	if (!row) {
		throw new Error(`Failed to store daily generated puzzle for ${dateStr}`);
	}
	return row;
}
