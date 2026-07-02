/**
 * Print difficulty metrics and composite ranking for a pack (no packs.ts changes).
 *
 * Run from app-template:
 *   npx tsx packages/game/scripts/report-pack-difficulty.ts --slug=grid-4x4-dev
 *   npx tsx packages/game/scripts/report-pack-difficulty.ts --slug=easy-auto --muse
 *   npx tsx packages/game/scripts/report-pack-difficulty.ts --slug=easy-auto --muse --compare
 *   npm run game:report-difficulty-muse -- --slug=easy-auto
 *
 * Expensive forgiveness metrics (near-optimal paths, generous-first-move BFS) are off
 * by default (`standard` profile). Use evaluatePuzzleDifficulty(..., { profile: 'full' })
 * for the previous exhaustive behavior.
 *
 * Flags:
 *   --slug=<pack-slug>   Pack to analyze (required)
 *   --muse               Include MUSE columns (muse, pathUniformEntropy, avg branching)
 *   --compare            Rank correlation: composite vs MUSE; list disagreements (>2 ranks)
 *   --max-depth=<n>      Max BFS depth passed to evaluatePuzzleDifficulty (default 12)
 */
import { getPackBySlug } from '../src/packs.js';
import { evaluatePuzzleDifficulty } from '../src/puzzleDifficulty.js';

interface CliOptions {
	slug: string;
	includeMuse: boolean;
	compare: boolean;
	maxDepth: number;
}

function parseArgs(): CliOptions {
	const arg = process.argv.find((entry) => entry.startsWith('--slug='));
	const slugFromEq = arg ? arg.slice('--slug='.length) : undefined;
	const slugIndex = process.argv.indexOf('--slug');
	const slugFromNext =
		slugIndex !== -1 && process.argv[slugIndex + 1] && !process.argv[slugIndex + 1].startsWith('--')
			? process.argv[slugIndex + 1]
			: undefined;
	const slug = slugFromEq ?? slugFromNext;

	if (!slug) {
		console.error(
			'Usage: report-pack-difficulty.ts --slug=<pack-slug> [--muse] [--compare] [--max-depth=<n>]'
		);
		process.exit(1);
	}

	const maxDepthArg = process.argv.find((entry) => entry.startsWith('--max-depth='));
	const maxDepthIndex = process.argv.indexOf('--max-depth');
	const maxDepthRaw =
		maxDepthArg?.slice('--max-depth='.length) ??
		(maxDepthIndex !== -1 ? process.argv[maxDepthIndex + 1] : undefined);
	const maxDepth = maxDepthRaw ? Number(maxDepthRaw) : 12;
	if (!Number.isFinite(maxDepth) || maxDepth < 1) {
		console.error('--max-depth must be a positive number');
		process.exit(1);
	}

	return {
		slug,
		includeMuse: process.argv.includes('--muse') || process.argv.includes('--compare'),
		compare: process.argv.includes('--compare'),
		maxDepth
	};
}

function averageBranching(counts: number[] | undefined): number | null {
	if (!counts || counts.length === 0) return null;
	return counts.reduce((sum, value) => sum + value, 0) / counts.length;
}

type SolvableRow = {
	id: number;
	composite: number;
	minMoves: number;
	touched: number;
	hamming: number;
	moveSpace: number;
	generous: number;
	multiFlip: number;
	maxOverlap: number;
	overlapPct: number;
	muse?: number;
	pathUniformEntropy?: number;
	avgBranching?: number | null;
};

function assignRanks(rows: SolvableRow[], key: keyof SolvableRow): Map<number, number> {
	const sorted = [...rows].sort((a, b) => {
		const av = a[key] as number;
		const bv = b[key] as number;
		return av - bv;
	});
	const ranks = new Map<number, number>();
	sorted.forEach((row, index) => {
		ranks.set(row.id, index + 1);
	});
	return ranks;
}

function spearmanRankCorrelation(
	valuesA: { id: number; value: number }[],
	valuesB: { id: number; value: number }[]
): number {
	const n = valuesA.length;
	if (n < 2) return Number.NaN;

	const rankValues = (entries: { id: number; value: number }[]) => {
		const sorted = [...entries].sort((a, b) => a.value - b.value);
		const ranks = new Map<number, number>();
		let i = 0;
		while (i < sorted.length) {
			let j = i;
			while (j + 1 < sorted.length && sorted[j + 1].value === sorted[i].value) {
				j++;
			}
			const avgRank = (i + j + 2) / 2;
			for (let k = i; k <= j; k++) {
				ranks.set(sorted[k].id, avgRank);
			}
			i = j + 1;
		}
		return ranks;
	};

	const rankA = rankValues(valuesA);
	const rankB = rankValues(valuesB);
	let sumD2 = 0;
	for (const { id } of valuesA) {
		const d = (rankA.get(id) ?? 0) - (rankB.get(id) ?? 0);
		sumD2 += d * d;
	}
	return 1 - (6 * sumD2) / (n * (n * n - 1));
}

function printCompareSection(rows: SolvableRow[]) {
	const withMuse = rows.filter(
		(row): row is SolvableRow & { muse: number } =>
			typeof row.muse === 'number' && Number.isFinite(row.muse)
	);
	if (withMuse.length < 2) {
		console.log('\nCompare: need at least 2 puzzles with finite MUSE.');
		return;
	}

	const compositeRanks = assignRanks(withMuse, 'composite');
	const museRanks = assignRanks(withMuse, 'muse');

	const rho = spearmanRankCorrelation(
		withMuse.map((row) => ({ id: row.id, value: row.composite })),
		withMuse.map((row) => ({ id: row.id, value: row.muse }))
	);

	console.log('\n--- Composite vs MUSE rank correlation ---');
	console.log(`Spearman ρ (composite vs MUSE): ${rho.toFixed(3)}`);
	console.log('Rank 1 = easiest within pack. Disagreement = |composite rank − MUSE rank| > 2.\n');
	console.log(
		'ID'.padEnd(4) +
			'Comp'.padStart(7) +
			'C-Rk'.padStart(6) +
			'MUSE'.padStart(7) +
			'M-Rk'.padStart(6) +
			'ΔRk'.padStart(5)
	);
	console.log('-'.repeat(35));

	const disagreements: Array<{ id: number; compositeRank: number; museRank: number; delta: number }> =
		[];

	for (const row of [...withMuse].sort((a, b) => a.id - b.id)) {
		const compositeRank = compositeRanks.get(row.id) ?? 0;
		const museRank = museRanks.get(row.id) ?? 0;
		const delta = Math.abs(compositeRank - museRank);
		if (delta > 2) {
			disagreements.push({ id: row.id, compositeRank, museRank, delta });
		}
		console.log(
			String(row.id).padEnd(4) +
				row.composite.toFixed(1).padStart(7) +
				String(compositeRank).padStart(6) +
				row.muse.toFixed(2).padStart(7) +
				String(museRank).padStart(6) +
				String(delta).padStart(5)
		);
	}

	if (disagreements.length === 0) {
		console.log('\nNo disagreements (all puzzles within ±2 ranks).');
	} else {
		console.log(`\nDisagreements (${disagreements.length}):`);
		for (const entry of disagreements.sort((a, b) => b.delta - a.delta)) {
			console.log(
				`  puzzle ${entry.id}: composite #${entry.compositeRank}, MUSE #${entry.museRank} (Δ=${entry.delta})`
			);
		}
	}
}

function main() {
	const { slug, includeMuse, compare, maxDepth } = parseArgs();
	const pack = getPackBySlug(slug);
	if (!pack) {
		console.error(`Unknown pack: ${slug}`);
		process.exit(1);
	}

	const rows = Object.entries(pack.puzzles).map(([idStr, config]) => {
		const id = Number(idStr);
		const report = evaluatePuzzleDifficulty(config, maxDepth, { includeMuse });
		if (!report) {
			return { id, error: 'unsolvable' as const };
		}

		const { forgiveness: f } = report;
		const avgBranching = includeMuse ? averageBranching(report.pathBranchingCounts) : undefined;
		return {
			id,
			composite: report.compositeDifficulty,
			minMoves: report.minMoves,
			touched: f.cellsTouchedBySolution,
			hamming: f.hammingWeight,
			moveSpace: f.totalFirstMoves,
			generous: f.generousFirstMoveRate,
			multiFlip: f.cellsTouchedMultiple,
			maxOverlap: f.maxApplicationsPerCell,
			overlapPct: Math.round(f.overlapDensity * 100),
			...(includeMuse
				? {
						muse: report.muse,
						pathUniformEntropy: report.pathUniformEntropy,
						avgBranching
					}
				: {})
		};
	});

	const solvable = rows.filter((row): row is SolvableRow => !('error' in row));
	const byComposite = [...solvable].sort((a, b) => a.composite - b.composite);

	console.log(`\n${pack.name} (${slug}) — ${solvable.length} puzzles\n`);
	const museHeader = includeMuse
		? 'MUSE'.padStart(7) + 'PathU'.padStart(7) + 'BrAvg'.padStart(6)
		: '';
	console.log(
		'ID'.padEnd(4) +
			'Comp'.padStart(7) +
			'Moves'.padStart(6) +
			'Touch'.padStart(6) +
			'Wrong'.padStart(6) +
			'Space'.padStart(6) +
			'Gen%'.padStart(6) +
			'Multi'.padStart(6) +
			'Peak'.padStart(5) +
			'Ovl%'.padStart(5) +
			museHeader +
			'  PackPos'
	);
	console.log('-'.repeat(includeMuse ? 90 : 64));

	for (const row of byComposite) {
		const museCells = includeMuse
			? (typeof row.muse === 'number' && Number.isFinite(row.muse)
					? row.muse.toFixed(2)
					: '—'
				).padStart(7) +
				(typeof row.pathUniformEntropy === 'number' && Number.isFinite(row.pathUniformEntropy)
					? row.pathUniformEntropy.toFixed(2)
					: '—'
				).padStart(7) +
				(row.avgBranching !== null && row.avgBranching !== undefined
					? row.avgBranching.toFixed(1)
					: '—'
				).padStart(6)
			: '';
		console.log(
			String(row.id).padEnd(4) +
				row.composite.toFixed(1).padStart(7) +
				String(row.minMoves).padStart(6) +
				String(row.touched).padStart(6) +
				String(row.hamming).padStart(6) +
				String(row.moveSpace).padStart(6) +
				String(Math.round(row.generous * 100)).padStart(6) +
				String(row.multiFlip).padStart(6) +
				String(row.maxOverlap).padStart(5) +
				String(row.overlapPct).padStart(5) +
				museCells +
				`  #${row.id}`
		);
	}

	console.log('\nSorted by composite (easy → hard). PackPos = current puzzle id in packs.ts.');
	if (includeMuse) {
		console.log('MUSE columns: muse (bits), pathUniformEntropy, avg branching along shortest path.');
	}

	if (compare) {
		printCompareSection(solvable);
	}
}

main();
