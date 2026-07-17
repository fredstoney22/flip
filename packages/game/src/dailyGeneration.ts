import type { PackPoolConfig } from './packGenerationTypes.js';
import type { Pigment, PuzzleConfig } from './types.js';
import { tryBuildScrambledCandidate } from './packPoolGeneration.js';

export const DAILY_MONO_CONFIG: PackPoolConfig = {
	puzzleSize: 3,
	kind: 'mono',
	puzzleCount: 1,
	candidatesPerPack: 1,
	templateCountMin: 2,
	templateCountMax: 3,
	templateSizeOptions: [3],
	scramble: { maxMoves: 15, maxExtraAfterCoverage: 3, rotateSameTemplateWeight: 0.25 },
	pruneUnusedTemplates: true
};

export const DAILY_COLOR_CONFIG: PackPoolConfig = {
	puzzleSize: 3,
	kind: 'color',
	puzzleCount: 1,
	candidatesPerPack: 1,
	allowedPigments: [1, 2, 4] as Pigment[],
	templateCount: 3,
	minMultiColoredTemplates: 1,
	minTemplatesPerPigment: 1,
	scramble: { maxMoves: 15, maxExtraAfterCoverage: 3, rotateSameTemplateWeight: 0.25 },
	pruneUnusedTemplates: true
};

export function epochDaysForDate(dateStr: string): number {
	const [year, month, day] = dateStr.split('-').map(Number);
	return Math.floor(Date.UTC(year, month - 1, day) / 86_400_000);
}

export function dailyGenerationKind(epochDays: number): 'mono' | 'color' {
	return epochDays % 2 === 0 ? 'mono' : 'color';
}

export function generateDailyPuzzle(epochDays: number, maxAttempts = 30): PuzzleConfig {
	const kind = dailyGenerationKind(epochDays);
	const config = kind === 'mono' ? DAILY_MONO_CONFIG : DAILY_COLOR_CONFIG;
	for (let i = 0; i < maxAttempts; i++) {
		const candidate = tryBuildScrambledCandidate(config, kind);
		if (candidate) return candidate.config;
	}
	throw new Error(`Failed to generate daily puzzle after ${maxAttempts} attempts`);
}
