import { describe, it, expect } from 'vitest';
import { addDaysUtc, formatDateUtc } from './dailyPuzzleSchedule.js';

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
