/**
 * Core type definitions for the Flip puzzle game.
 * Framework-agnostic — safe to import from any app or package.
 */

/**
 * A 2D grid of cell values (0 = dark, 1 = light).
 * Win condition: all cells must be 1 (all light). Use areAllElementsOne() to check.
 */
export type PuzzleGrid = number[][];

/** The configuration of a single puzzle. */
export interface PuzzleConfig {
	startState: PuzzleGrid;
	templates: PuzzleGrid[];
	/**
	 * Proven-minimum number of moves required to solve this puzzle.
	 * Set by the generator; absent on hand-authored puzzles until annotated.
	 */
	minMovesToSolve?: number;
}

/** All puzzles in a pack, keyed by numeric puzzle ID. */
export type PuzzlePack = Record<number, PuzzleConfig>;

/**
 * Definition of a puzzle pack, including its access tier.
 * Stripe product IDs are intentionally NOT stored here — they live in
 * the API config so game logic stays decoupled from billing.
 */
export interface PackDefinition {
	/** Human-readable display name. */
	name: string;
	/** Stable URL-safe key used in DB, URLs and Stripe metadata. */
	slug: string;
	/** Whether the pack requires a purchase to play. */
	access: 'free' | 'paid';
	/** All puzzles in this pack, keyed by puzzle ID. */
	puzzles: PuzzlePack;
}
