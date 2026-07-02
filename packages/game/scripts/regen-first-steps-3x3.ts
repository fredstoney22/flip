/**
 * Regenerates the First Steps puzzles whose templates were smaller than the
 * 3x3 grid, using FIRST_STEPS_REGEN_SLOTS. Prints JSON puzzle configs to
 * stdout for review — first-steps stays hand-maintained in firstSteps.ts, so
 * this does not write files (unlike fix-pack-containment.ts / generate-pack.ts).
 *
 * Run from app-template: npx tsx packages/game/scripts/regen-first-steps-3x3.ts
 */
import {
	generateVerifiedPuzzleForSlot,
	stripGeneratedPuzzle
} from '../src/packGeneration.js';
import { FIRST_STEPS_REGEN_SLOTS } from '../src/packGenerationSpecs.js';
import { resolveGenerationRuntime } from '../src/packGenerationRuntime.js';
import { inferPuzzleKind } from '../src/packGenerationConfig.js';
import { canonicalPuzzleKey } from '../src/puzzleCanonical.js';
import { packs } from '../src/packs.js';
import { firstStepsPack } from '../src/puzzles/firstSteps.js';
import { hasTemplateContainment } from '../src/templateContainment.js';
import type { PuzzleConfig } from '../src/types.js';

const seenCanonicalKeys = new Set<string>();
for (const pack of packs) {
	for (const cfg of Object.values(pack.puzzles)) {
		seenCanonicalKeys.add(canonicalPuzzleKey(cfg));
	}
}
for (const [id, cfg] of Object.entries(firstStepsPack.puzzles)) {
	if (!(Number(id) in FIRST_STEPS_REGEN_SLOTS)) {
		seenCanonicalKeys.add(canonicalPuzzleKey(cfg));
	}
}

function regenerate(id: number): PuzzleConfig {
	const slot = FIRST_STEPS_REGEN_SLOTS[id];
	const runtime = resolveGenerationRuntime('first-steps', inferPuzzleKind(slot));

	for (let attempt = 0; attempt < 200; attempt++) {
		const generated = generateVerifiedPuzzleForSlot(slot, { runtime, seenCanonicalKeys });
		if (hasTemplateContainment(generated.templates)) continue;
		const stripped = stripGeneratedPuzzle(generated);
		seenCanonicalKeys.add(canonicalPuzzleKey(stripped));
		return stripped;
	}

	throw new Error(`Failed to regenerate first-steps puzzle ${id}`);
}

const results: Record<number, PuzzleConfig> = {};
for (const idText of Object.keys(FIRST_STEPS_REGEN_SLOTS)) {
	const id = Number(idText);
	results[id] = regenerate(id);
}

console.log(JSON.stringify(results, null, 2));
