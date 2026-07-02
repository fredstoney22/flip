import { describe, it, expect } from 'vitest';
import { applyTemplate, isSolved } from './PuzzleFunctions.js';
import { getPuzzleById } from './packs.js';
import { orientTemplate } from './templatePigment.js';
import {
	buildPuzzleSearchSession,
	getMinMoves,
	getShortestPath
} from './puzzleSearchSession.js';
import { solveMinMoves } from './puzzleSolver.js';

describe('puzzleSearchSession', () => {
	it('returns minMoves 0 for an already-solved puzzle', () => {
		const config = getPuzzleById('tutorial-auto', 1);
		expect(config).toBeDefined();

		const solvedConfig = {
			...config!,
			startState: config!.startState.map((row) => row.map(() => config!.solvedValue))
		};

		const session = buildPuzzleSearchSession(solvedConfig);
		expect(session).not.toBeNull();
		expect(getMinMoves(session!)).toBe(0);
		expect(getShortestPath(session!)).toEqual([]);
	});

	it('builds a session for intro-pack puzzle 1 with consistent min moves', () => {
		const config = getPuzzleById('intro-pack', 1);
		expect(config).toBeDefined();

		const session = buildPuzzleSearchSession(config!);
		expect(session).not.toBeNull();
		expect(session!.placements.length).toBeGreaterThan(0);
		expect(session!.distanceToGoal.size).toBeGreaterThan(0);

		const minMoves = getMinMoves(session!);
		expect(minMoves).toBe(solveMinMoves(config!));
		expect(minMoves).toBe(config!.minMovesToSolve ?? minMoves);
	});

	it('getShortestPath produces a valid clearing sequence', () => {
		const config = getPuzzleById('intro-pack', 1);
		expect(config).toBeDefined();

		const session = buildPuzzleSearchSession(config!);
		expect(session).not.toBeNull();

		const path = getShortestPath(session!);
		const minMoves = getMinMoves(session!);
		expect(path).not.toBeNull();
		expect(path!.length).toBe(minMoves);

		let state = config!.startState.map((row) => [...row]);
		for (const move of path!) {
			const oriented = orientTemplate(config!.templates[move.templateIndex], move.rotation);
			state = applyTemplate(state, oriented, move.row, move.col);
		}
		expect(isSolved(state, config!.solvedValue)).toBe(true);
	});

	it('returns null for puzzles unsolvable within depth', () => {
		const config = getPuzzleById('intro-pack', 1);
		expect(config).toBeDefined();

		const session = buildPuzzleSearchSession(config!, { maxDepth: 0 });
		expect(session).toBeNull();
	});
});
