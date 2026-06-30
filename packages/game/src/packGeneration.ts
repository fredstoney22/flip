/**
 * Unified pack puzzle generation — public API and config helpers.
 */

export type {
	PackGenerationSpec,
	PuzzleKind,
	PuzzleSlotSpec,
	PackPoolConfig,
	ScramblePolicy
} from './packGenerationTypes.js';
export { DEFAULT_SCRAMBLE_POLICY, repeatSlot } from './packGenerationTypes.js';

export {
	buildGeneratorConfig,
	inferPuzzleKind,
	templateSizesFromCount,
	validatePuzzleSlot
} from './packGenerationConfig.js';

export {
	generateVerifiedPuzzleForSlot,
	stripGeneratedPuzzle
} from './generation/slotGeneration.js';

export {
	generatePackDefinition,
	generatePackFromSpec,
	PACK_GENERATION_STRATEGIES,
	poolPackStrategy,
	resolvePackStrategy,
	slotPackStrategy,
	type PackGenerationContext,
	type PackGenerationStrategy
} from './generation/packStrategies.js';
