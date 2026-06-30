import type { DifficultyReport, PedagogicalReport } from '@flip/game';

export interface PuzzleDifficultyDebugData {
  maxDepth: number;
  gridSize: number;
  report: DifficultyReport | null;
  pedagogy: PedagogicalReport | null;
}

export interface BuildPuzzleDifficultyDebugOptions {
  /** When set, runs pedagogy rules for this First Steps concept id. */
  pedagogyConceptId?: number;
}
