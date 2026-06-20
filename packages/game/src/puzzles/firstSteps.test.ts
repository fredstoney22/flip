import { describe, it, expect } from 'vitest';
import { solveMinMoves } from '../PuzzleGenerator.js';
import {
	firstStepsPack,
	FIRST_STEPS_CONCEPTS,
	getFirstStepsConcept
} from './firstSteps.js';
import {
	requiresEveryTemplate,
	requiresTemplateRotation
} from './firstStepsPedagogy.js';

describe('firstStepsPack', () => {
	it('has a concept label for every puzzle', () => {
		const ids = Object.keys(firstStepsPack.puzzles).map(Number);
		expect(ids).toHaveLength(9);
		for (const id of ids) {
			expect(FIRST_STEPS_CONCEPTS[id], `concept for puzzle ${id}`).toBeTruthy();
			expect(getFirstStepsConcept(id)).toBe(FIRST_STEPS_CONCEPTS[id]);
		}
	});

	it('every puzzle clears to white', () => {
		for (const [idStr, cfg] of Object.entries(firstStepsPack.puzzles)) {
			expect(cfg.solvedValue, `puzzle ${idStr}`).toBe(0);
		}
	});

	it('every puzzle is solvable using all templates', () => {
		for (const [idStr, cfg] of Object.entries(firstStepsPack.puzzles)) {
			const verified = solveMinMoves(cfg, 12);
			expect(verified, `puzzle ${idStr}`).not.toBeNull();
		}
	});

	it('puzzle 2 cannot be cleared without rotating', () => {
		expect(requiresTemplateRotation(firstStepsPack.puzzles[2])).toBe(true);
	});

	it('puzzle 3 cannot be cleared with a single template', () => {
		expect(requiresEveryTemplate(firstStepsPack.puzzles[3])).toBe(true);
	});

	it('puzzle 4 uses two smaller lenses', () => {
		const cfg = firstStepsPack.puzzles[4];
		expect(cfg.templates).toHaveLength(2);
		expect(cfg.templates.every((t) => t.shape.flat().filter((c) => c !== 0).length === 2)).toBe(
			true
		);
	});
});
