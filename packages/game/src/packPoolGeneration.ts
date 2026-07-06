/**
 * Pack-level candidate pool: scramble until coverage, score difficulty, assemble sorted pack.
 */

import { applyTemplate, isSolved } from './PuzzleFunctions.js';
import {
	buildGeneratorTemplates,
	type GeneratedPuzzleConfig,
	type GeneratorConfig
} from './PuzzleGenerator.js';
import { canonicalPuzzleKey } from './puzzleCanonical.js';
import type { DifficultyReport, SolutionMove } from './puzzleDifficulty.js';
import {
	defaultGenerationServices,
	type GenerationServices
} from './generation/generationServices.js';
export { difficultyScore } from './generation/candidateScoring.js';
import {
	scoreCandidateBreakdown,
	type CandidateScoreBreakdown
} from './generation/candidateScoring.js';
import {
	minTemplatesPerPigmentForAllowed,
	nonZeroPigments,
	requiredTemplateCount
} from './pigmentTemplates.js';
import { gridToKey } from './puzzleGrid.js';
import { constrainMonoTemplateSizes } from './templateShape.js';
import {
	countSolutionGridCoverage,
	minSolutionGridCellsRequired
} from './solutionGridCoverage.js';
import { orientTemplate } from './templatePigment.js';
import type { PackDefinition, Pigment, PuzzleConfig, PuzzleGrid, PuzzleTemplate } from './types.js';
import { PIGMENT_CLEAR_SOLVED_VALUE } from './types.js';
import type {
	PackGenerationSpec,
	PackPoolConfig,
	PuzzleKind,
	ScramblePolicy
} from './packGenerationTypes.js';
import { DEFAULT_SCRAMBLE_POLICY } from './packGenerationTypes.js';

/**
 * Hard ceiling on BFS states explored while solving/scoring one pool candidate.
 * Multi-colored templates (e.g. 'multicolor') can span a much higher-rank
 * reachable state space than mono templates; without this cap a single
 * pathological candidate can take minutes instead of milliseconds to solve.
 */
const POOL_SOLVE_MAX_STATES = 20_000;

function resolvePoolKind(pool: PackPoolConfig): PuzzleKind {
	if (pool.kind) return pool.kind;
	if (pool.templateSizes || pool.templateCountMin !== undefined || pool.templateSizeOptions) {
		return 'mono';
	}
	return 'color';
}

interface ScrambleMove {
	templateIndex: number;
	rotation: number;
	template: PuzzleTemplate;
	row: number;
	col: number;
}

export interface PackCandidate {
	config: PuzzleConfig;
	canonicalKey: string;
	scrambleLength: number;
	scrambleCoverage: number;
	rotationReuseCount: number;
	difficultyReport: DifficultyReport;
	difficultyScore: number;
	scoreBreakdown?: CandidateScoreBreakdown;
}

function randomInt(min: number, max: number): number {
	const lo = Math.ceil(min);
	const hi = Math.floor(max);
	return Math.floor(Math.random() * (hi - lo + 1)) + lo;
}

function randomItem<T>(arr: T[]): T {
	return arr[Math.floor(Math.random() * arr.length)];
}

function solvedGrid(size: number, solvedValue: Pigment): PuzzleGrid {
	return Array.from({ length: size }, () =>
		Array<Pigment>(size).fill(solvedValue)
	);
}

function enumerateScrambleMoves(puzzleSize: number, templates: PuzzleTemplate[]): ScrambleMove[] {
	const moves: ScrambleMove[] = [];

	for (let templateIndex = 0; templateIndex < templates.length; templateIndex++) {
		const base = templates[templateIndex];
		const orientations: { template: PuzzleTemplate; rotation: number }[] = [];
		const seen = new Set<string>();

		for (let rotation = 0; rotation < 4; rotation++) {
			const oriented = orientTemplate(base, rotation);
			const key = oriented.shape.map((row) => row.join('')).join('|');
			if (!seen.has(key)) {
				seen.add(key);
				orientations.push({ template: oriented, rotation });
			}
		}

		for (const { template, rotation } of orientations) {
			const tRows = template.shape.length;
			const tCols = template.shape[0]?.length ?? 0;
			for (let row = 0; row <= puzzleSize - tRows; row++) {
				for (let col = 0; col <= puzzleSize - tCols; col++) {
					moves.push({ templateIndex, rotation, template, row, col });
				}
			}
		}
	}

	return moves;
}

function toSolutionMoves(moves: ScrambleMove[]): SolutionMove[] {
	return moves.map((move) => ({
		templateIndex: move.templateIndex,
		rotation: move.rotation,
		row: move.row,
		col: move.col
	}));
}

/** Keeps only templates whose index appeared at least once in the scramble path. */
export function pruneTemplatesUnusedInScramble(
	templates: PuzzleTemplate[],
	scrambleMoves: ScrambleMove[]
): PuzzleTemplate[] | null {
	const usedIndices = new Set(scrambleMoves.map((move) => move.templateIndex));
	if (usedIndices.size === 0) return null;

	const pruned = templates.filter((_, index) => usedIndices.has(index));
	return pruned.length > 0 ? pruned : null;
}

function countRotationReuse(moves: ScrambleMove[]): number {
	let reuses = 0;
	const seen = new Map<number, Set<number>>();

	for (const move of moves) {
		const rotations = seen.get(move.templateIndex) ?? new Set<number>();
		if (rotations.size > 0 && !rotations.has(move.rotation)) {
			reuses++;
		}
		rotations.add(move.rotation);
		seen.set(move.templateIndex, rotations);
	}

	return reuses;
}

function resolveScramblePolicy(pool: PackPoolConfig): ScramblePolicy {
	return { ...DEFAULT_SCRAMBLE_POLICY, ...pool.scramble };
}

function legalMoves(
	state: PuzzleGrid,
	allMoves: ScrambleMove[],
	stateHistory: Set<string>
): ScrambleMove[] {
	return allMoves.filter((move) => {
		const nextState = applyTemplate(state, move.template, move.row, move.col);
		return !stateHistory.has(gridToKey(nextState));
	});
}

function pickScrambleMove(
	candidates: ScrambleMove[],
	lastMove: ScrambleMove | null,
	rotateSameWeight: number
): ScrambleMove {
	if (lastMove && Math.random() < rotateSameWeight) {
		const sameTemplate = candidates.filter(
			(move) =>
				move.templateIndex === lastMove.templateIndex && move.rotation !== lastMove.rotation
		);
		if (sameTemplate.length > 0) {
			return randomItem(sameTemplate);
		}
	}

	return randomItem(candidates);
}

export function buildPoolGeneratorConfig(
	pool: PackPoolConfig,
	kind: PuzzleKind
): GeneratorConfig {
	const puzzleSize = pool.puzzleSize;
	const solvedValue = PIGMENT_CLEAR_SOLVED_VALUE;

	if (kind === 'mono') {
		let templateSizes = pool.templateSizes;
		if (!templateSizes) {
			const countMin = pool.templateCountMin ?? 2;
			const countMax = pool.templateCountMax ?? countMin;
			const sizeOptions = pool.templateSizeOptions ?? [2, 3];
			const count = randomInt(countMin, countMax);
			templateSizes = constrainMonoTemplateSizes(
				Array.from({ length: count }, () => randomItem(sizeOptions))
			);
		} else {
			templateSizes = constrainMonoTemplateSizes(templateSizes);
		}

		return {
			puzzleSize,
			targetMinMoves: 0,
			solvedValue,
			allowedPigments: [1],
			templateSizes
		};
	}

	const allowedPigments = pool.allowedPigments ?? [1, 2, 4];
	const minTemplatesPerPigment =
		pool.minTemplatesPerPigment ?? minTemplatesPerPigmentForAllowed(allowedPigments);
	const pigmentPool = nonZeroPigments(allowedPigments);

	return {
		puzzleSize,
		targetMinMoves: 0,
		solvedValue,
		allowedPigments,
		templateCount: pool.templateCount ?? requiredTemplateCount(allowedPigments, minTemplatesPerPigment),
		minTemplatesPerPigment,
		minShapeSize: pool.minShapeSize ?? 2,
		maxShapeSize: pool.maxShapeSize ?? puzzleSize,
		minMultiColoredTemplates: pool.minMultiColoredTemplates,
		distinctPigmentCount: pool.distinctPigmentCount ?? pigmentPool.length,
		maxPigmentsPerTemplate: pool.maxPigmentsPerTemplate ?? (pool.minMultiColoredTemplates ? 2 : 1)
	};
}


export function tryBuildScrambledCandidate(
	pool: PackPoolConfig,
	kind: PuzzleKind,
	services: GenerationServices = defaultGenerationServices
): PackCandidate | null {
	const policy = resolveScramblePolicy(pool);
	const generatorConfig = buildPoolGeneratorConfig(pool, kind);
	const templates = buildGeneratorTemplates(generatorConfig);
	if (!templates) return null;

	const { puzzleSize, solvedValue } = generatorConfig;
	const allMoves = enumerateScrambleMoves(puzzleSize, templates);
	if (allMoves.length === 0) return null;

	const coverageRequired = minSolutionGridCellsRequired(puzzleSize);
	let state = solvedGrid(puzzleSize, solvedValue);
	const stateHistory = new Set<string>([gridToKey(state)]);
	const scrambleMoves: ScrambleMove[] = [];
	let lastMove: ScrambleMove | null = null;
	let phase: 'grow' | 'extend' = 'grow';
	let extensionRemaining = 0;

	for (let step = 0; step < policy.maxMoves; step++) {
		const candidates = legalMoves(state, allMoves, stateHistory);
		if (candidates.length === 0) return null;

		const chosen = pickScrambleMove(candidates, lastMove, policy.rotateSameTemplateWeight);
		state = applyTemplate(state, chosen.template, chosen.row, chosen.col);
		stateHistory.add(gridToKey(state));
		scrambleMoves.push(chosen);
		lastMove = chosen;

		const solutionMoves = toSolutionMoves(scrambleMoves);
		const coverage = countSolutionGridCoverage(solutionMoves, templates);

		if (phase === 'grow') {
			if (coverage > coverageRequired) {
				phase = 'extend';
				extensionRemaining = randomInt(0, policy.maxExtraAfterCoverage);
				if (extensionRemaining === 0) break;
			}
		} else {
			extensionRemaining--;
			if (extensionRemaining <= 0) break;
		}
	}

	if (scrambleMoves.length === 0) return null;

	const solutionMoves = toSolutionMoves(scrambleMoves);
	const scrambleCoverage = countSolutionGridCoverage(solutionMoves, templates);
	if (scrambleCoverage <= coverageRequired) return null;
	if (isSolved(state, solvedValue)) return null;

	let finalTemplates = templates;
	if (pool.pruneUnusedTemplates) {
		const pruned = pruneTemplatesUnusedInScramble(templates, scrambleMoves);
		if (!pruned) return null;
		finalTemplates = pruned;
	}

	const config: PuzzleConfig = {
		startState: state.map((row) => [...row]),
		templates: finalTemplates,
		solvedValue
	};

	// The reverse of the scramble is itself a valid solution, so minMoves can never
	// exceed scrambleMoves.length — bounding BFS depth to that (instead of a flat
	// pool-wide ceiling) keeps per-candidate solve cost tied to actual complexity.
	// This matters far more for 'color' kind than 'mono': mixing multiple pigments
	// into one template raises the rank of the reachable state space enormously,
	// so a few extra BFS levels can blow up runtime by orders of magnitude.
	const maxDepth = scrambleMoves.length;
	// Multi-colored templates can push a candidate's reachable state space far
	// beyond what mono candidates ever reach; cap it so one pathological candidate
	// can't stall the whole pool search — treat "too complex to solve cheaply" the
	// same as "unsolvable within budget" and move on to the next candidate.
	if (services.solver.solve(config, maxDepth, { maxStatesVisited: POOL_SOLVE_MAX_STATES }) === null) {
		return null;
	}

	const difficultyReport =
		services.difficulty.evaluate(config, maxDepth, {
			profile: 'fast',
			maxStatesVisited: POOL_SOLVE_MAX_STATES
		}) ?? undefined;
	if (!difficultyReport) return null;

	const rotationReuseCount = countRotationReuse(scrambleMoves);
	const scoreInput = {
		report: difficultyReport,
		scrambleLength: scrambleMoves.length,
		rotationReuseCount
	};

	return {
		config: {
			...config,
			minMovesToSolve: difficultyReport.minMoves
		},
		canonicalKey: canonicalPuzzleKey(config),
		scrambleLength: scrambleMoves.length,
		scrambleCoverage,
		rotationReuseCount,
		difficultyReport,
		difficultyScore: services.candidateScorer.score(scoreInput),
		scoreBreakdown: scoreCandidateBreakdown(scoreInput)
	};
}

export function generatePackCandidatePool(
	pool: PackPoolConfig,
	kind: PuzzleKind,
	options: { maxAttempts?: number; services?: GenerationServices } = {}
): PackCandidate[] {
	const maxAttempts = options.maxAttempts ?? pool.candidatesPerPack * 30;
	const services = options.services ?? defaultGenerationServices;
	const candidates: PackCandidate[] = [];

	for (let attempt = 0; attempt < maxAttempts && candidates.length < pool.candidatesPerPack; attempt++) {
		const candidate = tryBuildScrambledCandidate(pool, kind, services);
		if (candidate) {
			candidates.push(candidate);
		}
	}

	return candidates;
}

export function enrichCandidatesWithForgiveness(
	candidates: PackCandidate[],
	services: GenerationServices = defaultGenerationServices
): PackCandidate[] {
	return candidates.map((candidate) => {
		const maxDepth = Math.max(candidate.scrambleLength + 3, 12);
		const difficultyReport = services.difficulty.evaluate(candidate.config, maxDepth, {
			profile: 'standard'
		})!;
		const scoreInput = {
			report: difficultyReport,
			scrambleLength: candidate.scrambleLength,
			rotationReuseCount: candidate.rotationReuseCount
		};
		return {
			...candidate,
			difficultyReport,
			difficultyScore: services.candidateScorer.score(scoreInput),
			scoreBreakdown: scoreCandidateBreakdown(scoreInput)
		};
	});
}

export function assemblePackFromPool(
	candidates: PackCandidate[],
	puzzleCount: number,
	excludeKeys?: Set<string>,
	services: GenerationServices = defaultGenerationServices
): GeneratedPuzzleConfig[] {
	const usedKeys = new Set(excludeKeys ?? []);
	const unique: PackCandidate[] = [];

	for (const candidate of candidates) {
		if (usedKeys.has(candidate.canonicalKey)) continue;
		usedKeys.add(candidate.canonicalKey);
		unique.push(candidate);
	}

	const scored = enrichCandidatesWithForgiveness(
		unique
			.sort((a, b) => a.difficultyScore - b.difficultyScore)
			.slice(0, Math.min(unique.length, puzzleCount * 3)),
		services
	);
	scored.sort((a, b) => {
		const diff =
			a.difficultyReport.compositeDifficulty - b.difficultyReport.compositeDifficulty;
		return diff !== 0 ? diff : a.difficultyScore - b.difficultyScore;
	});

	if (scored.length < puzzleCount) {
		throw new Error(
			`assemblePackFromPool: need ${puzzleCount} puzzles but only ${scored.length} unique candidates`
		);
	}

	return scored.slice(0, puzzleCount).map((candidate) => ({
		...candidate.config,
		minMovesToSolve: candidate.difficultyReport.minMoves,
		canonicalKey: candidate.canonicalKey,
		difficultyReport: candidate.difficultyReport
	}));
}

export function generatePackFromPoolSpec(
	spec: PackGenerationSpec,
	excludeKeys?: Set<string>,
	services: GenerationServices = defaultGenerationServices
): PackDefinition['puzzles'] {
	if (!spec.pool) {
		throw new Error(`Pack "${spec.slug}" has no pool configuration`);
	}

	const kind = resolvePoolKind(spec.pool);
	const pool = generatePackCandidatePool(spec.pool, kind, { services });
	const selected = assemblePackFromPool(pool, spec.pool.puzzleCount, excludeKeys, services);

	const puzzles: PackDefinition['puzzles'] = {};
	for (let i = 0; i < selected.length; i++) {
		const { startState, templates, solvedValue, minMovesToSolve } = selected[i];
		puzzles[i + 1] = { startState, templates, solvedValue, minMovesToSolve };
	}

	return puzzles;
}
