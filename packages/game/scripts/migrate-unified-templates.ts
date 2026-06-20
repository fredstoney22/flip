/**
 * One-shot migration: convert split-format templates in packs.ts to unified shape grids.
 * Run: npx tsx scripts/migrate-unified-templates.ts
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { packs } from '../src/packs.js';
import { migrateSplitTemplate, isSplitTemplate } from '../src/templatePigment.js';
import type { PackDefinition, PuzzleConfig, PuzzleTemplate } from '../src/types.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const packsPath = resolve(__dirname, '../src/packs.ts');

function migrateTemplate(template: PuzzleTemplate | Record<string, unknown>): PuzzleTemplate {
	if (isSplitTemplate(template)) {
		return migrateSplitTemplate(template);
	}
	return template as PuzzleTemplate;
}

function migrateConfig(config: PuzzleConfig): PuzzleConfig {
	return {
		...config,
		templates: config.templates.map((t) => migrateTemplate(t))
	};
}

function migratePack(pack: PackDefinition): PackDefinition {
	if (pack.slug === 'first-steps') {
		return pack;
	}
	return {
		...pack,
		puzzles: Object.fromEntries(
			Object.entries(pack.puzzles).map(([id, cfg]) => [id, migrateConfig(cfg)])
		)
	};
}

const migrated = packs.map(migratePack);
const header = readFileSync(packsPath, 'utf8').split('export const packs')[0];
const footer = readFileSync(packsPath, 'utf8').split('];\nexport function getPackBySlug')[1];

const body = `export const packs: PackDefinition[] = ${JSON.stringify(migrated, null, 2)};\nexport function getPackBySlug${footer}`;
writeFileSync(packsPath, header + body, 'utf8');
console.log('Migrated packs.ts to unified template format.');
