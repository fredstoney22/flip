import {
	generateVerifiedPuzzle,
	pigmentGeneratorConfig
} from '../src/PuzzleGenerator.js';
import type { GeneratedPuzzleConfig, GeneratorConfig } from '../src/PuzzleGenerator.js';
import type { PuzzleConfig } from '../src/types.js';

type DifficultySpec = {
	name: string;
	targetMinMoves: number;
};

const DIFFICULTIES: DifficultySpec[] = [
	{ name: 'Warmup', targetMinMoves: 3 },
	{ name: 'Mixer', targetMinMoves: 3 },
	{ name: 'Tertiary Twist', targetMinMoves: 3 },
	{ name: 'Deep Shade', targetMinMoves: 4 },
	{ name: 'Chromatic Knot', targetMinMoves: 4 }
];

const BASE_CONFIG: Omit<GeneratorConfig, 'targetMinMoves'> = (() => {
	const { targetMinMoves: _ignored, ...rest } = pigmentGeneratorConfig({ targetMinMoves: 2 });
	return rest;
})();

function stripGenerated(cfg: GeneratedPuzzleConfig): PuzzleConfig {
	const { startState, templates, solvedValue, allowTemplateRotation, minMovesToSolve } = cfg;
	return { startState, templates, solvedValue, allowTemplateRotation, minMovesToSolve };
}

function main() {
	const configs: { title: string; description: string; config: PuzzleConfig }[] = [];

	for (const spec of DIFFICULTIES) {
		const generated = generateVerifiedPuzzle({
			...BASE_CONFIG,
			targetMinMoves: spec.targetMinMoves
		});
		configs.push({
			title: spec.name,
			description: `Clears in exactly ${spec.targetMinMoves} move${
				spec.targetMinMoves === 1 ? '' : 's'
			}.`,
			config: stripGenerated(generated)
		});
	}

	const header = `// ---- BEGIN AUTO-GENERATED COLOR LAB PUZZLES ----
// Generated via: npx tsx packages/game/scripts/generate-color-pack.ts
// Merge into color-lab pack in packs.ts
`;

	const body =
		'export const GENERATED_COLOR_LAB_PUZZLES: { title: string; description: string; config: PuzzleConfig }[] = ' +
		JSON.stringify(configs, null, 2) +
		';\n' +
		'// ---- END AUTO-GENERATED COLOR LAB PUZZLES ----';

	process.stdout.write(header + body + '\n');
}

main();
