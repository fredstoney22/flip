/**
 * Injectable solvability analysis strategy (GF(2) by default).
 *
 * Separate from puzzle generation — the reverse-shuffle generator does not
 * call this unless you inject an analyzer via {@link GenerationServices}.
 */

import {
	analyzeSolvability,
	type SolvabilityAnalysisOptions,
	type SolvabilityReport
} from '../puzzleSolvability.js';
import type { PuzzleConfig } from '../types.js';

export type { SolvabilityAnalysisOptions, SolvabilityReport };

/** Strategy interface — swap implementations for tests or alternate models. */
export interface SolvabilityAnalyzer {
	analyze(config: PuzzleConfig, options?: SolvabilityAnalysisOptions): SolvabilityReport;
}

/** GF(2) move-matrix analyzer from external math research (Opportunity 1). */
export class Gf2SolvabilityAnalyzer implements SolvabilityAnalyzer {
	analyze(config: PuzzleConfig, options?: SolvabilityAnalysisOptions): SolvabilityReport {
		return analyzeSolvability(config, options);
	}
}

export const defaultSolvabilityAnalyzer: SolvabilityAnalyzer = new Gf2SolvabilityAnalyzer();
