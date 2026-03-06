import { packs } from '../src/packs.js';
import type { PuzzleConfig, PuzzleGrid } from '../src/types.js';
import { solveMinMoves, gridToKey, getDistinctRotations } from '../src/PuzzleGenerator.js';

type Severity = 'error' | 'warn';

interface Issue {
	severity: Severity;
	packSlug: string;
	puzzleId: number;
	message: string;
}

function logIssue(issue: Issue) {
	const prefix = issue.severity === 'error' ? '[ERROR]' : '[WARN ]';
	console.log(
		`${prefix} pack="${issue.packSlug}" puzzle=${issue.puzzleId}: ${issue.message}`
	);
}

function isBinaryGrid(grid: PuzzleGrid): boolean {
	return grid.every((row) => row.every((cell) => cell === 0 || cell === 1));
}

function hasAllZeroTemplate(templates: PuzzleGrid[]): boolean {
	return templates.some((t) => t.every((row) => row.every((cell) => cell === 0)));
}

function findRotationallyEquivalentTemplates(templates: PuzzleGrid[]): number[][] {
	const buckets = new Map<string, number[]>();

	for (let i = 0; i < templates.length; i++) {
		const t = templates[i];
		// canonical template key = smallest key across its rotations
		const rotations = getDistinctRotations(t);
		let bestKey: string | null = null;
		for (const r of rotations) {
			const key = gridToKey(r);
			if (bestKey === null || key < bestKey) {
				bestKey = key;
			}
		}
		if (!bestKey) continue;
		const arr = buckets.get(bestKey) ?? [];
		arr.push(i);
		buckets.set(bestKey, arr);
	}

	const groups: number[][] = [];
	for (const indices of buckets.values()) {
		if (indices.length > 1) {
			groups.push(indices);
		}
	}
	return groups;
}

function validateConfig(
	packSlug: string,
	puzzleId: number,
	cfg: PuzzleConfig
): Issue[] {
	const issues: Issue[] = [];

	// Basic shape checks
	const n = cfg.startState.length;
	if (n === 0) {
		issues.push({
			severity: 'error',
			packSlug,
			puzzleId,
			message: 'startState grid is empty'
		});
		return issues;
	}

	if (!cfg.startState.every((row) => row.length === n)) {
		issues.push({
			severity: 'error',
			packSlug,
			puzzleId,
			message: 'startState is not square'
		});
	}

	if (!isBinaryGrid(cfg.startState)) {
		issues.push({
			severity: 'error',
			packSlug,
			puzzleId,
			message: 'startState contains values other than 0 or 1'
		});
	}

	// Template sanity
	if (cfg.templates.length === 0) {
		issues.push({
			severity: 'warn',
			packSlug,
			puzzleId,
			message: 'no templates defined'
		});
	}

	for (let i = 0; i < cfg.templates.length; i++) {
		const t = cfg.templates[i];
		if (t.length === 0 || t[0].length === 0) {
			issues.push({
				severity: 'error',
				packSlug,
				puzzleId,
				message: `template[${i}] is empty`
			});
			continue;
		}

		const rows = t.length;
		const cols = t[0].length;
		if (!t.every((row) => row.length === cols)) {
			issues.push({
				severity: 'error',
				packSlug,
				puzzleId,
				message: `template[${i}] has inconsistent row lengths`
			});
		}

		if (rows > n || cols > n) {
			issues.push({
				severity: 'error',
				packSlug,
				puzzleId,
				message: `template[${i}] (${rows}x${cols}) is larger than puzzle grid ${n}x${n}`
			});
		}

		if (!isBinaryGrid(t)) {
			issues.push({
				severity: 'error',
				packSlug,
				puzzleId,
				message: `template[${i}] contains values other than 0 or 1`
			});
		}
	}

	// Explicit check for true no-op templates (all zeros)
	if (hasAllZeroTemplate(cfg.templates)) {
		issues.push({
			severity: 'error',
			packSlug,
			puzzleId,
			message: 'contains an all-zero template (true no-op)'
		});
	}

	// Rotationally equivalent templates (same shape up to rotation)
	const equivGroups = findRotationallyEquivalentTemplates(cfg.templates);
	for (const group of equivGroups) {
		issues.push({
			severity: 'error',
			packSlug,
			puzzleId,
			message: `templates ${group.join(
				', '
			)} are identical up to rotation (redundant moves)`
		});
	}

	// If a claimed minMovesToSolve is present, verify it.
	if (typeof cfg.minMovesToSolve === 'number') {
		const verified = solveMinMoves(cfg.startState, cfg.templates, cfg.minMovesToSolve + 2);
		if (verified === null) {
			issues.push({
				severity: 'error',
				packSlug,
				puzzleId,
				message: `minMovesToSolve=${cfg.minMovesToSolve} but solver found no solution within that window`
			});
		} else if (verified !== cfg.minMovesToSolve) {
			issues.push({
				severity: 'error',
				packSlug,
				puzzleId,
				message: `minMovesToSolve=${cfg.minMovesToSolve} but solver verified ${verified} moves`
			});
		}
	}

	return issues;
}

async function main() {
	const allIssues: Issue[] = [];

	for (const pack of packs) {
		for (const [idStr, cfg] of Object.entries(pack.puzzles)) {
			const puzzleId = Number(idStr);
			const issues = validateConfig(pack.slug, puzzleId, cfg);
			for (const issue of issues) {
				allIssues.push(issue);
				logIssue(issue);
			}
		}
	}

	const errorCount = allIssues.filter((i) => i.severity === 'error').length;
	const warnCount = allIssues.filter((i) => i.severity === 'warn').length;

	if (errorCount === 0 && warnCount === 0) {
		console.log('✅ All packs and puzzles passed validation.');
		process.exit(0);
	} else {
		console.log(
			`\nValidation complete: ${errorCount} error(s), ${warnCount} warning(s).`
		);
		process.exit(errorCount === 0 ? 0 : 1);
	}
}

main().catch((err) => {
	console.error('Validation script failed:', err);
	process.exit(1);
});

