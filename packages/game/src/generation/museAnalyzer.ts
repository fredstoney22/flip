/**
 * Injectable MUSE difficulty strategy.
 */

import {
	computeMuse,
	type MuseActionPolicy,
	type MuseOptions,
	type MuseReport
} from '../puzzleEntropy.js';
import type { PuzzleConfig } from '../types.js';

export type { MuseActionPolicy, MuseOptions, MuseReport };

/** Strategy interface — swap implementations for tests or alternate entropy models. */
export interface MuseAnalyzer {
	analyze(config: PuzzleConfig, options?: MuseOptions): MuseReport | null;
}

/** Chen / White / Sturtevant MUSE with Flip-specific shortest-path action policy. */
export class UniformSolutionEntropyAnalyzer implements MuseAnalyzer {
	analyze(config: PuzzleConfig, options?: MuseOptions): MuseReport | null {
		return computeMuse(config, options);
	}
}

export const defaultMuseAnalyzer: MuseAnalyzer = new UniformSolutionEntropyAnalyzer();
