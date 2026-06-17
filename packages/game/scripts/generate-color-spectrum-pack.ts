/**
 * Generates the Color Spectrum pack — 10 pigment puzzles with ramping difficulty.
 *
 * Run from app-template: npx tsx packages/game/scripts/generate-color-spectrum-pack.ts
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
	generateVerifiedPuzzle,
	pigmentGeneratorConfig,
	type GeneratedPuzzleConfig
} from '../src/PuzzleGenerator.js';
import { canonicalPuzzleKey } from '../src/puzzleCanonical.js';
import type { PackDefinition, Pigment, PuzzleConfig } from '../src/types.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const packsPath = resolve(__dirname, '../src/packs.ts');

const PACK_SLUG = 'color-spectrum';

type PuzzleSpec = {
	targetMinMoves: number;
	allowedPigments: Pigment[];
	templateCount: number;
	minMultiColoredTemplates?: number;
};

/** Single-hue warm-up → secondaries → mixed primaries → full palette. */
const PUZZLE_SPECS: PuzzleSpec[] = [
	{ targetMinMoves: 2, allowedPigments: [2], templateCount: 2 },
	{ targetMinMoves: 2, allowedPigments: [1], templateCount: 2 },
	{ targetMinMoves: 2, allowedPigments: [4], templateCount: 2 },
	{ targetMinMoves: 3, allowedPigments: [3], templateCount: 3 },
	{ targetMinMoves: 3, allowedPigments: [6], templateCount: 3 },
	{ targetMinMoves: 3, allowedPigments: [5], templateCount: 3 },
	{ targetMinMoves: 4, allowedPigments: [1, 2], templateCount: 4, minMultiColoredTemplates: 1 },
	{ targetMinMoves: 6, allowedPigments: [1, 2, 4], templateCount: 6, minMultiColoredTemplates: 1 },
	{ targetMinMoves: 6, allowedPigments: [3, 5, 6], templateCount: 6, minMultiColoredTemplates: 2 },
	{ targetMinMoves: 6, allowedPigments: [1, 3, 6], templateCount: 6, minMultiColoredTemplates: 2 }
];

function stripGenerated(cfg: GeneratedPuzzleConfig): PuzzleConfig {
	const { startState, templates, solvedValue, allowTemplateRotation, minMovesToSolve } = cfg;
	return { startState, templates, solvedValue, allowTemplateRotation, minMovesToSolve };
}

function generatePackPuzzles(seenCanonicalKeys: Set<string>): PackDefinition['puzzles'] {
	const puzzles: PackDefinition['puzzles'] = {};

	for (let i = 0; i < PUZZLE_SPECS.length; i++) {
		const spec = PUZZLE_SPECS[i];
		if (spec.targetMinMoves < spec.templateCount) {
			throw new Error(
				`Color spectrum puzzle ${i + 1}: targetMinMoves must be >= templateCount`
			);
		}
		const puzzleId = i + 1;
		let generated: GeneratedPuzzleConfig | null = null;

		for (let attempt = 0; attempt < 40; attempt++) {
			try {
				generated = generateVerifiedPuzzle(
					pigmentGeneratorConfig({
						targetMinMoves: spec.targetMinMoves,
						allowedPigments: spec.allowedPigments,
						templateCount: spec.templateCount,
						minMultiColoredTemplates: spec.minMultiColoredTemplates ?? 0,
						maxAttempts: 800,
						seenCanonicalKeys
					})
				);
				break;
			} catch {
				// retry outer loop
			}
		}

		if (!generated) {
			throw new Error(`Failed to generate unique puzzle ${puzzleId} for ${PACK_SLUG}`);
		}

		puzzles[puzzleId] = stripGenerated(generated);
	}

	return puzzles;
}

const packsSource = readFileSync(packsPath, 'utf8');
const packsMatch = packsSource.match(/export const packs: PackDefinition\[\] = (\[[\s\S]*?\n\]);/);
if (!packsMatch) {
	throw new Error('Could not parse packs.ts');
}
const existingPacks = JSON.parse(packsMatch[1]) as PackDefinition[];
const withoutPack = existingPacks.filter((p) => p.slug !== PACK_SLUG);

const seenCanonicalKeys = new Set<string>();
for (const pack of withoutPack) {
	if (!pack.slug.endsWith('-auto')) continue;
	for (const cfg of Object.values(pack.puzzles)) {
		seenCanonicalKeys.add(canonicalPuzzleKey(cfg));
	}
}

const colorSpectrumPack: PackDefinition = {
	name: 'Color Spectrum',
	slug: PACK_SLUG,
	access: 'free',
	puzzles: generatePackPuzzles(seenCanonicalKeys)
};

const colorLabIndex = withoutPack.findIndex((p) => p.slug === 'color-lab');
const insertAt = colorLabIndex === -1 ? withoutPack.length : colorLabIndex + 1;
const merged = [
	...withoutPack.slice(0, insertAt),
	colorSpectrumPack,
	...withoutPack.slice(insertAt)
];

const header = readFileSync(packsPath, 'utf8').split('export const packs')[0];
const footer = readFileSync(packsPath, 'utf8').split('export function getPackBySlug')[1];

writeFileSync(
	packsPath,
	`${header}export const packs: PackDefinition[] = ${JSON.stringify(merged, null, 2)};
export function getPackBySlug${footer}`,
	'utf8'
);

console.log(`Added "${colorSpectrumPack.name}" (${PACK_SLUG}) with 10 puzzles.`);
