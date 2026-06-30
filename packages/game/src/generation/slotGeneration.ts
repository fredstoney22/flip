/**
 * Verified per-slot puzzle generation (target min-moves).
 */

import {
	generateVerifiedPuzzle,
	type GeneratedPuzzleConfig
} from '../PuzzleGenerator.js';
import type { PuzzleConfig } from '../types.js';
import type { PackGenerationRuntime } from '../packGenerationRuntime.js';
import type { PuzzleSlotSpec } from '../packGenerationTypes.js';
import { buildGeneratorConfig, inferPuzzleKind } from '../packGenerationConfig.js';
import {
	defaultGenerationServices,
	type GenerationServices
} from './generationServices.js';

export function stripGeneratedPuzzle(cfg: GeneratedPuzzleConfig): PuzzleConfig {
	const { startState, templates, solvedValue, minMovesToSolve } = cfg;
	return { startState, templates, solvedValue, minMovesToSolve };
}

export function generateVerifiedPuzzleForSlot(
	spec: PuzzleSlotSpec,
	options: {
		seenCanonicalKeys?: Set<string>;
		runtime: PackGenerationRuntime;
		services?: GenerationServices;
	}
): GeneratedPuzzleConfig {
	const { runtime, seenCanonicalKeys, services = defaultGenerationServices } = options;

	for (let attempt = 0; attempt < runtime.outerRetries; attempt++) {
		try {
			return generateVerifiedPuzzle(
				buildGeneratorConfig(spec, {
					seenCanonicalKeys,
					maxAttempts: runtime.maxAttempts
				}),
				services
			);
		} catch {
			// retry whole slot
		}
	}

	throw new Error(
		`Failed to generate puzzle (${inferPuzzleKind(spec)}, ${spec.targetMinMoves} moves) after ${runtime.outerRetries} outer attempts`
	);
}
