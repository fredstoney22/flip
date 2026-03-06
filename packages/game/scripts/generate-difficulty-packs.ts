import type { PackDefinition } from '../src/types.js';
import {
	DIFFICULTY_PRESETS,
	generateVerifiedPuzzle,
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
	// Keep easier packs free; harder ones paid by default.
	if (key === 'hard' || key === 'expert') return 'paid';
	return 'free';
}

function stripGenerated(cfg: GeneratedPuzzleConfig) {
	const { startState, templates, minMovesToSolve } = cfg;
	return { startState, templates, minMovesToSolve };
}

function main() {
	const result: PackDefinition[] = [];

	for (const key of DIFFICULTY_ORDER) {
		const preset = DIFFICULTY_PRESETS[key];
		const puzzles: PackDefinition['puzzles'] = {};

		for (let i = 1; i <= 5; i++) {
			const generated = generateVerifiedPuzzle({ ...preset, maxAttempts: 300 });
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
// Copy the exported constant into src/packs.ts and commit.
`;
	const body =
		'export const generatedDifficultyPacks: PackDefinition[] = ' +
		JSON.stringify(result, null, 2) +
		';\n' +
		'// ---- END AUTO-GENERATED DIFFICULTY PACKS ----';

	// Print TS-ready snippet to stdout
	process.stdout.write(header + body + '\n');
}

main();

