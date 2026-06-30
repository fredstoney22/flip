/**
 * Regenerates puzzles that violate the no-template-containment rule.
 *
 * Run from app-template: npx tsx packages/game/scripts/fix-pack-containment.ts
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
	generateVerifiedPuzzleForSlot,
	inferPuzzleKind,
	stripGeneratedPuzzle,
	type PuzzleSlotSpec
} from '../src/packGeneration.js';
import {
	COLOR_LAB_REGEN_SLOTS,
	INTRO_PACK_REGEN_SLOTS
} from '../src/packGenerationSpecs.js';
import { resolveGenerationRuntime } from '../src/packGenerationRuntime.js';
import { packs } from '../src/packs.js';
import { hasTemplateContainment } from '../src/templateContainment.js';
import { validateMultiPigmentTemplateCounts } from '../src/pigmentTemplates.js';
import type { PackDefinition, PuzzleConfig } from '../src/types.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const packsPath = resolve(__dirname, '../src/packs.ts');

function needsColorLabRegeneration(cfg: PuzzleConfig): boolean {
	if (hasTemplateContainment(cfg.templates)) return true;
	return !validateMultiPigmentTemplateCounts(cfg.templates).ok;
}

function regenerateSlot(packSlug: string, slot: PuzzleSlotSpec): PuzzleConfig {
	const runtime = resolveGenerationRuntime(packSlug, inferPuzzleKind(slot));

	for (let attempt = 0; attempt < 100; attempt++) {
		const generated = generateVerifiedPuzzleForSlot(slot, { runtime });
		if (!hasTemplateContainment(generated.templates)) {
			if (inferPuzzleKind(slot) === 'color') {
				if (!validateMultiPigmentTemplateCounts(generated.templates).ok) continue;
			}
			return stripGeneratedPuzzle(generated);
		}
	}

	throw new Error(`Failed to regenerate ${packSlug} puzzle (${slot.targetMinMoves} moves)`);
}

function fixIntroPack(pack: PackDefinition): PackDefinition {
	const puzzles = { ...pack.puzzles };

	for (const [idText, slot] of Object.entries(INTRO_PACK_REGEN_SLOTS)) {
		const id = Number(idText);
		const cfg = puzzles[id];
		if (!cfg || !hasTemplateContainment(cfg.templates)) continue;
		puzzles[id] = regenerateSlot(pack.slug, slot);
	}

	return { ...pack, puzzles };
}

function fixColorLab(pack: PackDefinition): PackDefinition {
	const puzzles = { ...pack.puzzles };

	for (let i = 0; i < COLOR_LAB_REGEN_SLOTS.length; i++) {
		const id = i + 1;
		const cfg = puzzles[id];
		if (!cfg || !needsColorLabRegeneration(cfg)) continue;
		puzzles[id] = regenerateSlot(pack.slug, COLOR_LAB_REGEN_SLOTS[i]);
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
