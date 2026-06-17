import type { PackDefinition } from '../src/types.js';
import {
	DIFFICULTY_PRESETS,
	generateVerifiedPuzzle,
	monoGeneratorConfig,
	type GeneratedPuzzleConfig
} from '../src/PuzzleGenerator.js';

type DifficultyKey = keyof typeof DIFFICULTY_PRESETS;

const DIFFICULTY_ORDER: DifficultyKey[] = ['tutorial', 'easy', 'medium', 'hard', 'expert'];

function difficultyName(key: DifficultyKey): string {
	return `${key[0].toUpperCase()}${key.slice(1)} (Auto)`;
}

function difficultySlug(key: DifficultyKey): string {
	return `${key}-auto`;
}

function difficultyAccess(key: DifficultyKey): PackDefinition['access'] {
	if (key === 'hard' || key === 'expert') return 'paid';
	return 'free';
}

function stripGenerated(cfg: GeneratedPuzzleConfig) {
	const { startState, templates, solvedValue, allowTemplateRotation, minMovesToSolve } = cfg;
	return { startState, templates, solvedValue, allowTemplateRotation, minMovesToSolve };
}

function main() {
	const result: PackDefinition[] = [];

	for (const key of DIFFICULTY_ORDER) {
		const preset = DIFFICULTY_PRESETS[key];
		const puzzles: PackDefinition['puzzles'] = {};

		for (let i = 1; i <= 5; i++) {
			const generated = generateVerifiedPuzzle(
				monoGeneratorConfig(preset, { maxAttempts: 300 })
			);
			puzzles[i] = stripGenerated(generated);
		}

		result.push({
			name: difficultyName(key),
			slug: difficultySlug(key),
			access: difficultyAccess(key),
			puzzles
		});
	}

	const header = `// ---- BEGIN AUTO-GENERATED DIFFICULTY PACKS ----
// Generated via: npx tsx packages/game/scripts/generate-difficulty-packs.ts
`;
	const body =
		'export const generatedDifficultyPacks: PackDefinition[] = ' +
		JSON.stringify(result, null, 2) +
		';\n' +
		'// ---- END AUTO-GENERATED DIFFICULTY PACKS ----';

	process.stdout.write(header + body + '\n');
}

main();
