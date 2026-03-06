import { generateVerifiedColorPuzzle } from '../src/ColorPuzzleGenerator.js';
import type { ColorGeneratorConfig, GeneratedColorPuzzleConfig } from '../src/ColorPuzzleGenerator.js';
import type { ColorPuzzleConfig, Pigment } from '../src/colorTypes.js';

type DifficultySpec = {
	name: string;
	targetMinMoves: number;
};

const DIFFICULTIES: DifficultySpec[] = [
	{ name: 'Warmup', targetMinMoves: 2 },
	{ name: 'Mixer', targetMinMoves: 3 },
	{ name: 'Tertiary Twist', targetMinMoves: 3 },
	{ name: 'Deep Shade', targetMinMoves: 4 },
	{ name: 'Chromatic Knot', targetMinMoves: 4 }
];

const BASE_CONFIG: Omit<ColorGeneratorConfig, 'targetMinMoves'> = {
	puzzleSize: 3,
	templateCount: 3,
	allowedPigments: [1, 2, 4] as Pigment[], // Red, Yellow, Blue
	maxAttempts: 800,
	minShapeSize: 2,
	maxShapeSize: 3
};

function stripGenerated(cfg: GeneratedColorPuzzleConfig): ColorPuzzleConfig {
	const { startState, templates } = cfg;
	return { startState, templates };
}

function main() {
	const configs: { title: string; description: string; config: ColorPuzzleConfig }[] = [];

	for (const spec of DIFFICULTIES) {
		const generated = generateVerifiedColorPuzzle({
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

	const header = `// ---- BEGIN AUTO-GENERATED COLOR PACK ----
// Generated via: npx tsx packages/game/scripts/generate-color-pack.ts
// Paste this constant into ColorFunctions.ts (or a dedicated color pack module).
`;

	const body =
		'export const GENERATED_COLOR_PACK: { title: string; description: string; config: ColorPuzzleConfig }[] = ' +
		JSON.stringify(configs, null, 2) +
		';\n' +
		'// ---- END AUTO-GENERATED COLOR PACK ----';

	process.stdout.write(header + body + '\n');
}

main();

