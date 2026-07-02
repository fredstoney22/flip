import {
  evaluatePuzzleDifficulty,
  resolveSearchBudget,
  defaultPedagogyValidator,
  type PuzzleConfig
} from '@flip/game';
import { isDevEnvironment } from '$lib/dev.server';
import type {
  BuildPuzzleDifficultyDebugOptions,
  PuzzleDifficultyDebugData
} from '$lib/types/puzzleDifficultyDebug';

export type { BuildPuzzleDifficultyDebugOptions, PuzzleDifficultyDebugData };

/**
 * Authoring-time difficulty + optional pedagogy report. Returns null in production.
 */
export function buildPuzzleDifficultyDebug(
  config: PuzzleConfig,
  options: BuildPuzzleDifficultyDebugOptions = {}
): PuzzleDifficultyDebugData | null {
  if (!isDevEnvironment()) {
    return null;
  }

  const maxDepth = resolveSearchBudget(config, 'authoring').maxDepth;
  const report = evaluatePuzzleDifficulty(config, maxDepth, { includeMuse: true });

  const pedagogy =
    options.pedagogyConceptId !== undefined
      ? defaultPedagogyValidator.validateConcept(config, options.pedagogyConceptId)
      : null;

  return {
    maxDepth,
    gridSize: config.startState.length,
    report,
    pedagogy
  };
}
