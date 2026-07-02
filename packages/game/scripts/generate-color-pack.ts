/**
 * @deprecated Use generate-pack.ts with a pack spec in PACK_GENERATION_SPECS.
 * Kept for ad-hoc color-lab puzzle snippets.
 */
import { buildGeneratorConfig, stripGeneratedPuzzle } from '../src/packGeneration.js';
import { resolveGenerationRuntime } from '../src/packGenerationRuntime.js';
import { generateVerifiedPuzzle } from '../src/PuzzleGenerator.js';
import type { PuzzleConfig } from '../src/types.js';

const SLOTS = [
	{ name: 'Warmup', targetMinMoves: 3 },
	{ name: 'Mixer', targetMinMoves: 3 },
	{ name: 'Tertiary Twist', targetMinMoves: 3 },
	{ name: 'Deep Shade', targetMinMoves: 4 },
	{ name: 'Chromatic Knot', targetMinMoves: 4 }
] as const;

const colorRuntime = resolveGenerationRuntime('color-lab', 'color');
const baseColor = buildGeneratorConfig({ kind: 'color', targetMinMoves: 2 });

function main() {
	const configs: { title: string; description: string; config: PuzzleConfig }[] = [];

	for (const slot of SLOTS) {
		const generated = generateVerifiedPuzzle({
			...baseColor,
			targetMinMoves: slot.targetMinMoves,
			maxAttempts: colorRuntime.maxAttempts
		});
		configs.push({
			title: slot.name,
			description: `Clears in exactly ${slot.targetMinMoves} move${
				slot.targetMinMoves === 1 ? '' : 's'
			}.`,
			config: stripGeneratedPuzzle(generated)
		});
	}

	const header = `// ---- BEGIN AUTO-GENERATED COLOR LAB PUZZLES ----
// Generated via: npx tsx packages/game/scripts/generate-color-pack.ts
`;

	const body =
		'export const GENERATED_COLOR_LAB_PUZZLES: { title: string; description: string; config: PuzzleConfig }[] = ' +
		JSON.stringify(configs, null, 2) +
		';\n' +
		'// ---- END AUTO-GENERATED COLOR LAB PUZZLES ----';

	process.stdout.write(header + body + '\n');
}

main();
