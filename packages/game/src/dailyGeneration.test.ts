import { describe, expect, it } from 'vitest';
import { dailyGenerationKind, epochDaysForDate, generateDailyPuzzle } from './dailyGeneration.js';
import { solveMinMoves } from './puzzleSolver.js';
import { isSolved } from './PuzzleFunctions.js';
import { PIGMENT_CLEAR_SOLVED_VALUE } from './types.js';

describe('epochDaysForDate', () => {
	it('is stable for a known UTC date', () => {
		// 1970-01-02 is exactly 1 day after the Unix epoch.
		expect(epochDaysForDate('1970-01-02')).toBe(1);
		expect(epochDaysForDate('1970-01-01')).toBe(0);
	});

	it('advances by one for each consecutive calendar day', () => {
		const day = epochDaysForDate('2026-06-17');
		expect(epochDaysForDate('2026-06-18')).toBe(day + 1);
	});
});

describe('dailyGenerationKind', () => {
	it('alternates mono/color by day parity', () => {
		expect(dailyGenerationKind(0)).toBe('mono');
		expect(dailyGenerationKind(1)).toBe('color');
		expect(dailyGenerationKind(2)).toBe('mono');
		expect(dailyGenerationKind(3)).toBe('color');
	});

	it('treats negative epoch days consistently with modulo parity', () => {
		expect(dailyGenerationKind(-2)).toBe('mono');
		expect(dailyGenerationKind(-1)).toBe('color');
	});
});

describe('generateDailyPuzzle', () => {
	it('returns a solvable, unsolved mono puzzle on even epoch days', () => {
		const config = generateDailyPuzzle(0);
		expect(isSolved(config.startState, config.solvedValue)).toBe(false);
		expect(solveMinMoves(config)).not.toBeNull();
	});

	it('returns a solvable, unsolved color puzzle on odd epoch days', () => {
		const config = generateDailyPuzzle(1);
		expect(isSolved(config.startState, config.solvedValue)).toBe(false);
		expect(solveMinMoves(config)).not.toBeNull();
	});

	it('produces a start state matching the configured pigment palette', () => {
		const config = generateDailyPuzzle(1);
		expect(config.solvedValue).toBe(PIGMENT_CLEAR_SOLVED_VALUE);
	});
});
