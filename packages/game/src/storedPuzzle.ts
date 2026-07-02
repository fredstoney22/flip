import { normalizePuzzleConfig } from './puzzleNormalize.js';
import type { PuzzleConfig } from './types.js';

interface StoredPuzzlePayloadV2 {
	v: 2;
	templates: PuzzleConfig['templates'];
	solvedValue: PuzzleConfig['solvedValue'];
	minMovesToSolve?: number;
}

export function serializePuzzleForStorage(config: PuzzleConfig): {
	startState: string;
	templates: string;
} {
	return {
		startState: JSON.stringify(config.startState),
		templates: JSON.stringify({
			v: 2,
			templates: config.templates,
			solvedValue: config.solvedValue,
			...(config.minMovesToSolve !== undefined
				? { minMovesToSolve: config.minMovesToSolve }
				: {})
		} satisfies StoredPuzzlePayloadV2)
	};
}

export function parseStoredPuzzle(startStateJson: string, templatesJson: string): PuzzleConfig {
	const startState = JSON.parse(startStateJson) as unknown;
	const templatesField = JSON.parse(templatesJson) as unknown;

	let config: PuzzleConfig;
	if (
		templatesField &&
		typeof templatesField === 'object' &&
		(templatesField as StoredPuzzlePayloadV2).v === 2
	) {
		const payload = templatesField as StoredPuzzlePayloadV2;
		config = normalizePuzzleConfig({
			startState,
			templates: payload.templates,
			solvedValue: payload.solvedValue,
			minMovesToSolve: payload.minMovesToSolve
		});
	} else {
		config = normalizePuzzleConfig({
			startState,
			templates: templatesField
		});
	}

	return config;
}
