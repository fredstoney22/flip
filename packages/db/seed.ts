import { config } from 'dotenv';
import { resolve } from 'path';
import { randomUUID } from 'crypto';

config({ path: resolve(process.cwd(), '../../.env') });

import { db, pack, puzzle, dailyPuzzle, eq } from './index.js';
import { packs } from '../game/src/packs.js';

/**
 * Seeds the database with pack and puzzle data from @flip/game, then ensures
 * a daily_puzzle row exists for each of the next DAILY_WINDOW_DAYS days
 * (starting today). Safe to re-run — all inserts use onConflictDoNothing.
 */

const DAILY_WINDOW_DAYS = 7;

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
			.onConflictDoNothing();

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
			return {
				id: randomUUID(),
				packId: packRow.id,
				puzzleNumber: puzzleNum,
				startState: JSON.stringify(cfg.startState),
				templates: JSON.stringify(cfg.templates),
				sortOrder: puzzleNum,
				createdAt: new Date()
			};
		});

		if (puzzleEntries.length > 0) {
			await db.insert(puzzle).values(puzzleEntries).onConflictDoNothing();
		}

		console.log(`  ✓ ${packDef.name} (${packDef.access}) — ${puzzleEntries.length} puzzle(s)`);
	}

	// Seed daily puzzles for today + the next DAILY_WINDOW_DAYS days.
	// Rotates through intro-pack puzzles 1–10 so each day has a unique puzzle.
	console.log(`\nSeeding daily puzzles for the next ${DAILY_WINDOW_DAYS} days…`);

	const today = new Date();
	for (let i = 0; i < DAILY_WINDOW_DAYS; i++) {
		const d = new Date(today);
		d.setDate(today.getDate() + i);
		const dateStr = d.toISOString().slice(0, 10);
		const puzzleId = (i % 10) + 1;

		await db
			.insert(dailyPuzzle)
			.values({
				id: randomUUID(),
				date: dateStr,
				packSlug: 'intro-pack',
				puzzleId,
				createdAt: new Date()
			})
			.onConflictDoNothing();

		console.log(`  ✓ ${dateStr} → intro-pack #${puzzleId}`);
	}

	console.log('\nSeed complete.');
	process.exit(0);
}

seed().catch((err) => {
	console.error('Seed failed:', err);
	process.exit(1);
});
