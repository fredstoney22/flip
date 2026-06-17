/**
 * Generates the Chromatic Ascent pack — 10 pigment puzzles, easy → expert.
 *
 * Run from app-template: npx tsx packages/game/scripts/generate-chromatic-ascent-pack.ts
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
import { requiredTemplateCount } from '../src/pigmentTemplates.js';
import type { PackDefinition, Pigment, PuzzleConfig } from '../src/types.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const packsPath = resolve(__dirname, '../src/packs.ts');

const PACK_SLUG = 'chromatic-ascent';
const PACK_NAME = 'Chromatic Ascent';

type PuzzleSpec = {
	targetMinMoves: number;
	allowedPigments: Pigment[];
	minMultiColoredTemplates?: number;
};

/** Primaries → secondaries → dual-color → tri-color mixes; moves always match template count. */
const PUZZLE_SPECS: PuzzleSpec[] = [
	{ targetMinMoves: 2, allowedPigments: [2] },
	{ targetMinMoves: 2, allowedPigments: [1] },
	{ targetMinMoves: 2, allowedPigments: [4] },
	{ targetMinMoves: 3, allowedPigments: [3] },
	{ targetMinMoves: 3, allowedPigments: [6] },
	{ targetMinMoves: 3, allowedPigments: [5] },
	{ targetMinMoves: 4, allowedPigments: [1, 2], minMultiColoredTemplates: 1 },
	{ targetMinMoves: 6, allowedPigments: [1, 2, 4], minMultiColoredTemplates: 1 },
	{ targetMinMoves: 6, allowedPigments: [3, 5, 6], minMultiColoredTemplates: 2 },
	{ targetMinMoves: 6, allowedPigments: [1, 4, 6], minMultiColoredTemplates: 2 }
];

function specTemplateCount(spec: PuzzleSpec): number {
	return requiredTemplateCount(spec.allowedPigments);
}

function stripGenerated(cfg: GeneratedPuzzleConfig): PuzzleConfig {
	const { startState, templates, solvedValue, allowTemplateRotation, minMovesToSolve } = cfg;
	return { startState, templates, solvedValue, allowTemplateRotation, minMovesToSolve };
}

function generatePackPuzzles(seenCanonicalKeys: Set<string>): PackDefinition['puzzles'] {
	const puzzles: PackDefinition['puzzles'] = {};

	for (let i = 0; i < PUZZLE_SPECS.length; i++) {
		const spec = PUZZLE_SPECS[i];
		const templateCount = specTemplateCount(spec);
		if (spec.targetMinMoves < templateCount) {
			throw new Error(
				`${PACK_NAME} puzzle ${i + 1}: targetMinMoves must be >= templateCount (${templateCount})`
			);
		}

		const puzzleId = i + 1;
		let generated: GeneratedPuzzleConfig | null = null;

		for (let attempt = 0; attempt < 50; attempt++) {
			try {
				generated = generateVerifiedPuzzle(
					pigmentGeneratorConfig({
						targetMinMoves: spec.targetMinMoves,
						allowedPigments: spec.allowedPigments,
						templateCount,
						minMultiColoredTemplates: spec.minMultiColoredTemplates ?? 0,
						maxAttempts: 1000,
						seenCanonicalKeys
					})
				);
				break;
			} catch {
				// retry outer loop
			}
		}

		if (!generated) {
			throw new Error(`Failed to generate puzzle ${puzzleId} for ${PACK_SLUG}`);
		}

		puzzles[puzzleId] = stripGenerated(generated);
		console.log(
			`  ✓ #${puzzleId} — ${spec.targetMinMoves} moves, pigments [${spec.allowedPigments.join(', ')}]`
		);
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
	for (const cfg of Object.values(pack.puzzles)) {
		seenCanonicalKeys.add(canonicalPuzzleKey(cfg));
	}
}

console.log(`Generating ${PACK_NAME} (${PUZZLE_SPECS.length} puzzles)…`);
const newPack: PackDefinition = {
	name: PACK_NAME,
	slug: PACK_SLUG,
	access: 'free',
	puzzles: generatePackPuzzles(seenCanonicalKeys)
};

const spectrumIndex = withoutPack.findIndex((p) => p.slug === 'color-spectrum');
const insertAt = spectrumIndex === -1 ? withoutPack.length : spectrumIndex + 1;
const merged = [...withoutPack.slice(0, insertAt), newPack, ...withoutPack.slice(insertAt)];

const header = readFileSync(packsPath, 'utf8').split('export const packs')[0];
const footer = readFileSync(packsPath, 'utf8').split('export function getPackBySlug')[1];

writeFileSync(
	packsPath,
	`${header}export const packs: PackDefinition[] = ${JSON.stringify(merged, null, 2)};
export function getPackBySlug${footer}`,
	'utf8'
);

console.log(`\nAdded "${PACK_NAME}" (${PACK_SLUG}) with ${PUZZLE_SPECS.length} puzzles.`);
