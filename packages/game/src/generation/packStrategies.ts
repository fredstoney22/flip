/**
 * Pack generation strategies — slot-based (verified min-moves) vs pool-based (scramble + rank).
 */

import { resolveGenerationRuntime } from '../packGenerationRuntime.js';
import { inferPuzzleKind, validatePuzzleSlot } from '../packGenerationConfig.js';
import { generateVerifiedPuzzleForSlot, stripGeneratedPuzzle } from './slotGeneration.js';
import type { PackGenerationSpec } from '../packGenerationTypes.js';
import { generatePackFromPoolSpec } from '../packPoolGeneration.js';
import type { PackDefinition } from '../types.js';
import {
	defaultGenerationServices,
	type GenerationServices
} from './generationServices.js';
export interface PackGenerationContext {
	seenCanonicalKeys?: Set<string>;
	services: GenerationServices;
}

export interface PackGenerationStrategy {
	readonly id: 'slot' | 'pool';
	supports(spec: PackGenerationSpec): boolean;
	generate(spec: PackGenerationSpec, context: PackGenerationContext): PackDefinition['puzzles'];
}

export const slotPackStrategy: PackGenerationStrategy = {
	id: 'slot',
	supports: (spec) => Boolean(spec.puzzles?.length),
	generate(spec, context) {
		if (!spec.puzzles?.length) {
			throw new Error(`Pack "${spec.slug}" has no puzzle slots`);
		}

		const puzzles: PackDefinition['puzzles'] = {};

		for (let i = 0; i < spec.puzzles.length; i++) {
			const slot = spec.puzzles[i];
			const puzzleId = i + 1;
			validatePuzzleSlot(slot, `${spec.slug} #${puzzleId}`);

			const generated = generateVerifiedPuzzleForSlot(slot, {
				seenCanonicalKeys: context.seenCanonicalKeys,
				runtime: resolveGenerationRuntime(spec.slug, inferPuzzleKind(slot)),
				services: context.services
			});
			puzzles[puzzleId] = stripGeneratedPuzzle(generated);
		}

		return puzzles;
	}
};

export const poolPackStrategy: PackGenerationStrategy = {
	id: 'pool',
	supports: (spec) => Boolean(spec.pool),
	generate(spec, context) {
		return generatePackFromPoolSpec(spec, context.seenCanonicalKeys, context.services);
	}
};

export const PACK_GENERATION_STRATEGIES: PackGenerationStrategy[] = [
	poolPackStrategy,
	slotPackStrategy
];

export function resolvePackStrategy(spec: PackGenerationSpec): PackGenerationStrategy {
	const strategy = PACK_GENERATION_STRATEGIES.find((entry) => entry.supports(spec));
	if (!strategy) {
		throw new Error(`Pack "${spec.slug}" has no puzzles or pool configuration`);
	}
	return strategy;
}

export function generatePackFromSpec(
	spec: PackGenerationSpec,
	seenCanonicalKeys?: Set<string>,
	services: GenerationServices = defaultGenerationServices
): PackDefinition['puzzles'] {
	return resolvePackStrategy(spec).generate(spec, { seenCanonicalKeys, services });
}

export function generatePackDefinition(
	spec: PackGenerationSpec,
	seenCanonicalKeys?: Set<string>,
	services: GenerationServices = defaultGenerationServices
): PackDefinition {
	return {
		name: spec.name,
		slug: spec.slug,
		access: spec.access,
		puzzles: generatePackFromSpec(spec, seenCanonicalKeys, services)
	};
}
