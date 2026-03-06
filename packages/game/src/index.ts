export type { PuzzleGrid, PuzzleConfig, PuzzlePack, PackDefinition } from './types.js';
export { packs, getPackBySlug, getPuzzleById, getNextPuzzleId, getPackPuzzleCount } from './packs.js';
export { applyTemplate, rotateRight, areAllElementsOne } from './PuzzleFunctions.js';
export { overwriteWithSubmatrix, getSubmatrix, elementWiseOperation } from './MatrixFunctions.js';
export { getValidPuzzle } from './PuzzleValidator.js';
export type { HintMove } from './PuzzleHint.js';
export { findHintMove } from './PuzzleHint.js';

// Color puzzle experiment
export type { Pigment, ColorGrid, ColorTemplate, ColorPuzzleConfig } from './colorTypes.js';
export { PIGMENT_HEX, PIGMENT_NAME } from './colorTypes.js';
export {
	applyColorTemplate,
	isColorSolved,
	getValidPositions,
	getCenteredColorPosition,
	COLOR_SAMPLE_PUZZLES,
	GENERATED_COLOR_PACK
} from './ColorFunctions.js';
export type {
	GeneratedPuzzleConfig,
	DifficultyPreset,
	GeneratorConfig
} from './PuzzleGenerator.js';
export {
	generateVerifiedPuzzle,
	solveMinMoves,
	canonicalizeGrid,
	gridToKey,
	getDistinctRotations,
	enumerateAllMoves,
	DIFFICULTY_PRESETS,
} from './PuzzleGenerator.js';
export type {
	GeneratedColorPuzzleConfig,
	ColorGeneratorConfig
} from './ColorPuzzleGenerator.js';
export {
	generateVerifiedColorPuzzle,
	solveColorMinMoves
} from './ColorPuzzleGenerator.js';
