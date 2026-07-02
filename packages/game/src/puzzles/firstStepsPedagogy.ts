/**
 * Pedagogy checks for First Steps — the game only requires a cleared grid,
 * so these puzzles must be designed so the lesson concept is unavoidable.
 *
 * Thin wrappers around shared generation rules (backward-compatible exports).
 */

import {
	requiresEveryTemplate as everyTemplateRule,
	requiresTemplateRotation as templateRotationRule
} from '../generation/pedagogyRules.js';
import type { PuzzleConfig } from '../types.js';

/** True when the grid cannot be cleared using only one template index. */
export function requiresEveryTemplate(cfg: PuzzleConfig, maxDepth = 6): boolean {
	return everyTemplateRule().validate(cfg, { maxDepth }).passed;
}

/** True when no solution exists without rotating templates. */
export function requiresTemplateRotation(cfg: PuzzleConfig, maxDepth = 6): boolean {
	return templateRotationRule().validate(cfg, { maxDepth }).passed;
}
