/**
 * One-shot sync: copy firstStepsPack's puzzle data into the inline "first-steps"
 * entry in packs.ts (the actual seed data used by packages/db/seed.ts — the
 * firstStepsPack import in packs.ts is otherwise unused there).
 *
 * Splices only the "first-steps" pack object in place (via brace-matching on
 * the raw text), rather than reserializing the whole packs array — a plain
 * JSON.stringify(packs) would also flatten other packs that are spliced in
 * live via an imported variable (e.g. simpleMonoDevPack) into inline JSON,
 * an unwanted structural change to unrelated packs.
 *
 * Run from app-template: npx tsx packages/game/scripts/sync-first-steps-packs.ts
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { firstStepsPack } from '../src/puzzles/firstSteps.js';
import type { PackDefinition } from '../src/types.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const packsPath = resolve(__dirname, '../src/packs.ts');

function findPackBlock(content: string, slug: string): { start: number; end: number } {
	const marker = `"slug": "${slug}"`;
	const markerIndex = content.indexOf(marker);
	if (markerIndex === -1) {
		throw new Error(`Could not find pack with slug "${slug}" in packs.ts`);
	}

	const start = content.lastIndexOf('{', markerIndex);
	let depth = 0;
	let end = -1;
	for (let i = start; i < content.length; i++) {
		if (content[i] === '{') depth++;
		else if (content[i] === '}') {
			depth--;
			if (depth === 0) {
				end = i + 1;
				break;
			}
		}
	}
	if (end === -1) {
		throw new Error(`Could not find matching closing brace for "${slug}" pack block`);
	}
	return { start, end };
}

const content = readFileSync(packsPath, 'utf8');
const { start, end } = findPackBlock(content, 'first-steps');

const blockText = content.slice(start, end);
const block: PackDefinition = JSON.parse(blockText);
if (block.slug !== 'first-steps') {
	throw new Error(`Expected slug "first-steps", got "${block.slug}"`);
}
block.puzzles = firstStepsPack.puzzles;

const baseIndent = content.slice(0, start).split('\n').pop() ?? '';
const serialized = JSON.stringify(block, null, 2)
	.split('\n')
	.map((line, i) => (i === 0 ? line : baseIndent + line))
	.join('\n');

const updatedContent = content.slice(0, start) + serialized + content.slice(end);
writeFileSync(packsPath, updatedContent, 'utf8');

console.log('Synced first-steps puzzle data into packs.ts.');
