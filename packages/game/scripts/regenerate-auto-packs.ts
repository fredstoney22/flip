/**
 * Regenerates tutorial-auto … expert-auto packs in packs.ts using the unified generator.
 */
import { writeFileSync, readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
	DIFFICULTY_PRESETS,
	generateVerifiedPuzzle,
	monoGeneratorConfig,
	type GeneratedPuzzleConfig
} from '../src/PuzzleGenerator.js';
import { packs } from '../src/packs.js';
import type { PackDefinition } from '../src/types.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const packsPath = resolve(__dirname, '../src/packs.ts');

type DifficultyKey = keyof typeof DIFFICULTY_PRESETS;
const AUTO_SLUGS = new Set(
	(Object.keys(DIFFICULTY_PRESETS) as DifficultyKey[]).map((k) => `${k}-auto`)
);

function stripGenerated(cfg: GeneratedPuzzleConfig) {
	const { startState, templates, solvedValue, allowTemplateRotation, minMovesToSolve } = cfg;
	return { startState, templates, solvedValue, allowTemplateRotation, minMovesToSolve };
}

function generateAutoPack(key: DifficultyKey, seenCanonicalKeys: Set<string>): PackDefinition {
	const preset = DIFFICULTY_PRESETS[key];
	const puzzles: PackDefinition['puzzles'] = {};
	for (let i = 1; i <= 5; i++) {
		puzzles[i] = stripGenerated(
			generateVerifiedPuzzle(
				monoGeneratorConfig(preset, { maxAttempts: 1500, seenCanonicalKeys })
			)
		);
	}
	return {
		name: `${key[0].toUpperCase()}${key.slice(1)} (Auto)`,
		slug: `${key}-auto`,
		access: key === 'hard' || key === 'expert' ? 'paid' : 'free',
		puzzles
	};
}

const seenCanonicalKeys = new Set<string>();
const manualPacks = packs.filter((p) => !AUTO_SLUGS.has(p.slug));
const autoPacks = (Object.keys(DIFFICULTY_PRESETS) as DifficultyKey[]).map((key) =>
	generateAutoPack(key, seenCanonicalKeys)
);
const merged = [...autoPacks, ...manualPacks];

const header = readFileSync(packsPath, 'utf8').split('export const packs')[0];
const footer = `
/**
 * Finds a pack definition by its slug.
 */
export function getPackBySlug(slug: string): PackDefinition | undefined {
	return packs.find((p) => p.slug === slug);
}

/**
 * Retrieves a specific puzzle config from a pack by puzzle ID.
 * Returns a deep clone to prevent mutation of the source data.
 */
export function getPuzzleById(packSlug: string, puzzleId: number): PuzzleConfig | undefined {
	const pack = getPackBySlug(packSlug);
	const config = pack?.puzzles[puzzleId];
	if (!config) return undefined;
	return JSON.parse(JSON.stringify(config)) as PuzzleConfig;
}

/**
 * Returns the next puzzle ID in a pack after the given ID, or null if it's the last.
 */
export function getNextPuzzleId(packSlug: string, currentId: number): number | null {
	const pack = getPackBySlug(packSlug);
	if (!pack) return null;
	const ids = Object.keys(pack.puzzles).map(Number).sort((a, b) => a - b);
	const idx = ids.indexOf(currentId);
	if (idx === -1 || idx === ids.length - 1) return null;
	return ids[idx + 1];
}

/**
 * Returns the total number of puzzles in a pack.
 */
export function getPackPuzzleCount(packSlug: string): number {
	return Object.keys(getPackBySlug(packSlug)?.puzzles ?? {}).length;
}
`;

writeFileSync(
	packsPath,
	`${header}export const packs: PackDefinition[] = ${JSON.stringify(merged, null, 2)};
${footer}`,
	'utf8'
);

console.log(
	`Regenerated ${autoPacks.length} auto packs (${seenCanonicalKeys.size} unique canonical puzzles).`
);
