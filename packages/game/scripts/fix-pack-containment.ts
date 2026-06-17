/**
 * Regenerates puzzles that violate the no-template-containment rule.
 *
 * Run from app-template: npx tsx packages/game/scripts/fix-pack-containment.ts
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
	generateVerifiedPuzzle,
	monoGeneratorConfig,
	pigmentGeneratorConfig,
	type GeneratedPuzzleConfig
} from '../src/PuzzleGenerator.js';
import { packs } from '../src/packs.js';
import { hasTemplateContainment } from '../src/templateContainment.js';
import { validateMultiPigmentTemplateCounts } from '../src/pigmentTemplates.js';
import type { PackDefinition, PuzzleConfig } from '../src/types.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const packsPath = resolve(__dirname, '../src/packs.ts');

const COLOR_LAB_SPECS: { targetMinMoves: number; allowedPigments: import('../src/types.js').Pigment[]; templateCount: number }[] = [
	{ targetMinMoves: 3, allowedPigments: [2], templateCount: 3 },
	{ targetMinMoves: 4, allowedPigments: [1, 2], templateCount: 4 },
	{ targetMinMoves: 6, allowedPigments: [1, 2, 4], templateCount: 6 },
	{ targetMinMoves: 6, allowedPigments: [3, 5, 6], templateCount: 6 },
	{ targetMinMoves: 6, allowedPigments: [1, 3, 6], templateCount: 6 }
];

function needsColorLabRegeneration(cfg: PuzzleConfig): boolean {
	if (hasTemplateContainment(cfg.templates)) return true;
	return !validateMultiPigmentTemplateCounts(cfg.templates).ok;
}

function stripGenerated(cfg: GeneratedPuzzleConfig): PuzzleConfig {
	const { startState, templates, solvedValue, allowTemplateRotation, minMovesToSolve } = cfg;
	return { startState, templates, solvedValue, allowTemplateRotation, minMovesToSolve };
}

function regenerateMonochrome(templateCount: number, targetMinMoves: number): PuzzleConfig {
	const templateSizes =
		templateCount === 2
			? [2, 3]
			: templateCount === 3
				? [2, 3, 3]
				: Array.from({ length: templateCount }, () => 3);

	for (let attempt = 0; attempt < 100; attempt++) {
		const generated = generateVerifiedPuzzle(
			monoGeneratorConfig(
				{ puzzleSize: 3, templateSizes, targetMinMoves },
				{ maxAttempts: 1500 }
			)
		);
		if (!hasTemplateContainment(generated.templates)) {
			return stripGenerated(generated);
		}
	}
	throw new Error(
		`Failed to generate monochrome puzzle (${templateCount} templates, ${targetMinMoves} moves)`
	);
}

function regenerateColorLab(index: number): PuzzleConfig {
	const spec = COLOR_LAB_SPECS[index];
	for (let attempt = 0; attempt < 100; attempt++) {
		const generated = generateVerifiedPuzzle(
			pigmentGeneratorConfig({
				targetMinMoves: spec.targetMinMoves,
				allowedPigments: spec.allowedPigments,
				templateCount: spec.templateCount,
				maxAttempts: 1500
			})
		);
		if (
			!hasTemplateContainment(generated.templates) &&
			validateMultiPigmentTemplateCounts(generated.templates).ok
		) {
			return stripGenerated(generated);
		}
	}
	throw new Error(`Failed to regenerate color-lab puzzle ${index + 1}`);
}

function fixIntroPack(pack: PackDefinition): PackDefinition {
	const puzzles = { ...pack.puzzles };
	const targets = [6, 7, 8, 9] as const;
	const specs: Record<number, { templateCount: number; targetMinMoves: number }> = {
		6: { templateCount: 2, targetMinMoves: 2 },
		7: { templateCount: 3, targetMinMoves: 3 },
		8: { templateCount: 3, targetMinMoves: 3 },
		9: { templateCount: 3, targetMinMoves: 3 }
	};

	for (const id of targets) {
		const cfg = puzzles[id];
		if (!cfg || !hasTemplateContainment(cfg.templates)) continue;
		const spec = specs[id];
		puzzles[id] = regenerateMonochrome(spec.templateCount, spec.targetMinMoves);
	}
	return { ...pack, puzzles };
}

function fixColorLab(pack: PackDefinition): PackDefinition {
	const puzzles = { ...pack.puzzles };
	for (let i = 0; i < COLOR_LAB_SPECS.length; i++) {
		const id = i + 1;
		const cfg = puzzles[id];
		if (!cfg || !needsColorLabRegeneration(cfg)) continue;
		puzzles[id] = regenerateColorLab(i);
	}
	return { ...pack, puzzles };
}

const updated = packs.map((pack) => {
	if (pack.slug === 'intro-pack') return fixIntroPack(pack);
	if (pack.slug === 'color-lab') return fixColorLab(pack);
	return pack;
});

const header = readFileSync(packsPath, 'utf8').split('export const packs')[0];
const footer = readFileSync(packsPath, 'utf8').split('export function getPackBySlug')[1];

writeFileSync(
	packsPath,
	`${header}export const packs: PackDefinition[] = ${JSON.stringify(updated, null, 2)};
export function getPackBySlug${footer}`,
	'utf8'
);

console.log('Fixed template containment in intro-pack and color-lab where needed.');
