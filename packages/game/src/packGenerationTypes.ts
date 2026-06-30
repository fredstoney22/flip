import type { PackDefinition, Pigment } from './types.js';

export type PuzzleKind = 'mono' | 'color';

/** Per-puzzle generation parameters for a pack. */
export interface PuzzleSlotSpec {
	/** Defaults to mono when templateSizes is set, otherwise color. */
	kind?: PuzzleKind;
	puzzleSize?: number;
	targetMinMoves: number;
	/** Mono: one square template per side length. */
	templateSizes?: number[];
	/** Mono fallback when templateSizes omitted; also used for color template count. */
	templateCount?: number;
	allowedPigments?: Pigment[];
	minShapeSize?: number;
	maxShapeSize?: number;
	minTemplatesPerPigment?: number;
	minMultiColoredTemplates?: number;
	/** Exact count of distinct pigments across all templates (color puzzles). */
	distinctPigmentCount?: number;
	/** Max distinct pigments on any single template (color puzzles). */
	maxPigmentsPerTemplate?: number;
}

/** Pack-level pool generation — scramble, score, assemble by difficulty. */
export interface PackPoolConfig {
	puzzleCount: number;
	candidatesPerPack: number;
	puzzleSize: number;
	kind?: PuzzleKind;
	/** Mono: fixed template side lengths when set. */
	templateSizes?: number[];
	/** Mono: pick a random count in [min, max] and random sizes from options. */
	templateCountMin?: number;
	templateCountMax?: number;
	templateSizeOptions?: number[];
	/** Color puzzle fields */
	templateCount?: number;
	allowedPigments?: Pigment[];
	minShapeSize?: number;
	maxShapeSize?: number;
	minTemplatesPerPigment?: number;
	minMultiColoredTemplates?: number;
	distinctPigmentCount?: number;
	maxPigmentsPerTemplate?: number;
	scramble?: Partial<ScramblePolicy>;
	/** Drop stencil slots that never appeared in the scramble path (post-generation). */
	pruneUnusedTemplates?: boolean;
}

export interface ScramblePolicy {
	/** Hard cap on scramble length. */
	maxMoves: number;
	/** After coverage threshold, add this many extra moves (inclusive range). */
	maxExtraAfterCoverage: number;
	/** Chance to pick same stencil index with a different rotation. */
	rotateSameTemplateWeight: number;
}

export const DEFAULT_SCRAMBLE_POLICY: ScramblePolicy = {
	maxMoves: 15,
	maxExtraAfterCoverage: 3,
	rotateSameTemplateWeight: 0.25
};

/** Pack metadata — use either `pool` or legacy `puzzles` slots. */
export interface PackGenerationSpec {
	name: string;
	slug: string;
	access: PackDefinition['access'];
	/** Legacy per-slot generation. */
	puzzles?: PuzzleSlotSpec[];
	/** Pack-level candidate pool generation. */
	pool?: PackPoolConfig;
}

export function repeatSlot(slot: PuzzleSlotSpec, count: number): PuzzleSlotSpec[] {
	return Array.from({ length: count }, () => ({ ...slot }));
}
