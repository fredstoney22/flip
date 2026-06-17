import { config } from 'dotenv';
import { resolve } from 'path';
config({ path: resolve(process.cwd(), '../../.env') });

import { randomUUID } from 'crypto';

import { db, pack, puzzle, eq } from './index.js';
import { packs } from '../game/src/packs.js';
import { serializePuzzleForStorage } from '../game/src/storedPuzzle.js';
import {
	ensureDailyPuzzleWindow,
	DAILY_SCHEDULE_LOOKAHEAD_DAYS
} from './dailyPuzzleSchedule.js';

/**
 * Seeds the database with pack and puzzle data from @flip/game, then ensures
 * daily_puzzle rows exist for today + the lookahead window.
 * Safe to re-run — pack and puzzle rows are upserted from packs.ts.
 */

async function seed() {
	console.log('Seeding packs and puzzles…');

	for (let i = 0; i < packs.length; i++) {
		const packDef = packs[i];

		// Upsert the pack row (slug is unique)
		await db
			.insert(pack)
			.values({
				id: randomUUID(),
				name: packDef.name,
				slug: packDef.slug,
				access: packDef.access,
				active: true,
				sortOrder: i,
				createdAt: new Date()
			})
			.onConflictDoUpdate({
				target: pack.slug,
				set: {
					name: packDef.name,
					access: packDef.access,
					sortOrder: i,
					active: true
				}
			});

		// Resolve the actual pack ID (may differ if the row already existed)
		const [packRow] = await db
			.select({ id: pack.id })
			.from(pack)
			.where(eq(pack.slug, packDef.slug))
			.limit(1);

		if (!packRow) {
			console.error(`  ✗ Could not resolve pack id for "${packDef.slug}"`);
			continue;
		}

		const puzzleEntries = Object.entries(packDef.puzzles).map(([num]) => {
			const puzzleNum = Number(num);
			const cfg = packDef.puzzles[puzzleNum];
			const stored = serializePuzzleForStorage(cfg);
			return {
				id: randomUUID(),
				packId: packRow.id,
				puzzleNumber: puzzleNum,
				startState: stored.startState,
				templates: stored.templates,
				sortOrder: puzzleNum,
				createdAt: new Date()
			};
		});

		if (puzzleEntries.length > 0) {
			for (const entry of puzzleEntries) {
				await db
					.insert(puzzle)
					.values(entry)
					.onConflictDoUpdate({
						target: [puzzle.packId, puzzle.puzzleNumber],
						set: {
							startState: entry.startState,
							templates: entry.templates,
							sortOrder: entry.sortOrder
						}
					});
			}
		}

		console.log(`  ✓ ${packDef.name} (${packDef.access}) — ${puzzleEntries.length} puzzle(s)`);
	}

	console.log(`\nSeeding daily puzzles for the next ${DAILY_SCHEDULE_LOOKAHEAD_DAYS} days…`);
	const { created, scheduled } = await ensureDailyPuzzleWindow(DAILY_SCHEDULE_LOOKAHEAD_DAYS);
	for (const dateStr of scheduled) {
		console.log(`  ✓ ${dateStr}`);
	}
	console.log(`  (${created} new row(s), ${scheduled.length} total in window)`);

	console.log('\nSeed complete.');
	process.exit(0);
}

seed().catch((err) => {
	console.error('Seed failed:', err);
	process.exit(1);
});
