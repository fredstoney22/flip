import { describe, it, expect } from 'vitest';
import {
	addDaysUtc,
	formatDateUtc,
	puzzleIdForDate,
	dailyPuzzleAssignment,
	DAILY_PACK_SLUG,
	DAILY_PUZZLE_ROTATION_COUNT
} from './dailyPuzzleSchedule.js';

describe('formatDateUtc', () => {
	it('formats a UTC midnight date as YYYY-MM-DD', () => {
		expect(formatDateUtc(new Date('2026-06-17T00:00:00.000Z'))).toBe('2026-06-17');
	});
});

describe('addDaysUtc', () => {
	it('adds whole UTC calendar days', () => {
		expect(addDaysUtc('2026-06-17', 1)).toBe('2026-06-18');
		expect(addDaysUtc('2026-12-31', 1)).toBe('2027-01-01');
	});
});

describe('puzzleIdForDate', () => {
	it('returns a value between 1 and the rotation count', () => {
		const id = puzzleIdForDate('2026-06-17');
		expect(id).toBeGreaterThanOrEqual(1);
		expect(id).toBeLessThanOrEqual(DAILY_PUZZLE_ROTATION_COUNT);
	});

	it('is deterministic for the same date', () => {
		expect(puzzleIdForDate('2026-06-17')).toBe(puzzleIdForDate('2026-06-17'));
	});

	it('rotates across the full range over consecutive days', () => {
		const ids = new Set<number>();
		for (let i = 0; i < DAILY_PUZZLE_ROTATION_COUNT; i++) {
			ids.add(puzzleIdForDate(addDaysUtc('2026-01-01', i)));
		}
		expect(ids.size).toBe(DAILY_PUZZLE_ROTATION_COUNT);
	});
});

describe('dailyPuzzleAssignment', () => {
	it('always uses the intro pack', () => {
		expect(dailyPuzzleAssignment('2026-06-17').packSlug).toBe(DAILY_PACK_SLUG);
	});
});
