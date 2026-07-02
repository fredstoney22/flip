# Puzzle Difficulty Scoring

Primary entry point: `packages/game/src/puzzleDifficulty.ts` → `evaluatePuzzleDifficulty`

---

## Overview

Difficulty is computed post-generation from the shortest solution to a puzzle. The output is a `DifficultyReport` containing raw metrics, per-pillar subscores, and a single `compositeDifficulty` number used for pack ordering and candidate ranking.

---

## Composite Difficulty Score

`compositeDifficultyScore` in `packages/game/src/puzzleForgiveness.ts:299`

```
compositeDifficulty = structural + mechanics(mono baseline) − forgivenessEase
```

This is the primary ranking signal. Higher = harder. It's used to:
- Order puzzles within a pack (easy → hard)
- Rank pool candidates during pack assembly

The mechanics term in the composite uses a fixed mono baseline (1 pigment, 2 templates) for backward compatibility. The `pillars.mechanics` subscore uses actual puzzle counts.

---

## Three Difficulty Pillars

### 1. Structural (`puzzleForgiveness.ts:240`)

Captures move count, board coverage, and stencil overlap on the shortest solution.

```
structural =
  minMoves × 25
  + cellsTouchedBySolution × 12
  + cellsTouchedMultiple × 20
  + maxApplicationsPerCell × 10
  + overlapDensity × 35
  + hammingWeight × 2
```

| Input | Meaning |
|---|---|
| `minMoves` | Shortest path length to solve |
| `cellsTouchedBySolution` | Distinct grid cells hit across the solution |
| `cellsTouchedMultiple` | Cells hit ≥ 2 times (coupling) |
| `maxApplicationsPerCell` | Peak stencil overlap on any single cell |
| `overlapDensity` | `cellsTouchedMultiple / cellsTouchedBySolution` |
| `hammingWeight` | Non-solved cells in the start state |

### 2. Forgiveness Ease (`puzzleForgiveness.ts:258`)

Inverted forgiveness — higher means the puzzle *feels easier*. Subtracted from the composite score.

```
forgivenessEase =
  (nearOptimalSolutionCount > 0
    ? log(nearOptimalSolutionCount) × 6
    : generousFirstMoveRate × 12)
  + log(shortestSolutionCount) × 2
  + log(totalFirstMoves) × 3
```

| Input | Meaning |
|---|---|
| `nearOptimalSolutionCount` | Paths of length `minMoves + 1` (expensive; `full` profile only) |
| `generousFirstMoveRate` | Fraction of first moves that still lead to a near-optimal solve (`full` profile only) |
| `shortestSolutionCount` | Distinct paths of exactly `minMoves` length (capped at 1000; 3×3 grids only) |
| `totalFirstMoves` | Total legal first moves available |

### 3. Mechanics (`puzzleForgiveness.ts:276`)

Captures rotation and color-switching cognitive load.

```
mechanics =
  rotationQuarterTurns × 4
  + colorChanges × 4
  + max(0, distinctPigments − 1) × 3
  + max(0, templateCount − 2) × 2
```

| Input | Meaning |
|---|---|
| `rotationQuarterTurns` | Sum of clockwise quarter-turn rotations across the solution |
| `colorChanges` | Consecutive moves applying a different pigment set |
| `distinctPigments` | Distinct pigment types across all templates |
| `templateCount` | Number of stencils available |

### 4. Cognitive — MUSE (optional)

MUSE (Minimum Uniform Solution Entropy) from Chen, White & Sturtevant (AIIDE 2023).

```
entropy(s) = H(|σ(s)|) + min_{a ∈ σ(s)} entropy(s')
```

where `H(n) = log₂(n)` for n > 1, `H(1) = 0`, `H(0) = ∞`. Measures recursive decision uncertainty — higher bits = more cognitively demanding. Only computed under the `full` profile.

Implementation: `packages/game/src/puzzleEntropy.ts`

---

## Forgiveness Metrics (`ForgivenessMetrics`)

Computed by `evaluateForgivenessMetrics` in `puzzleForgiveness.ts:186`.

```typescript
{
  hammingWeight,            // non-solved cells in start state
  generousFirstMoveCount,   // first moves leaving ≤ minMoves+1 remaining
  totalFirstMoves,          // all legal first moves
  generousFirstMoveRate,    // generousFirstMoveCount / totalFirstMoves
  shortestSolutionCount,    // paths of length minMoves (capped)
  nearOptimalSolutionCount, // paths of length minMoves+1 (capped)
  solutionCountCapped,      // true when path count hit 1000 cap
  cellsTouchedBySolution,   // distinct cells hit on the solution
  cellsTouchedOnce,         // cells hit exactly once
  cellsTouchedMultiple,     // cells hit ≥ 2 times
  maxApplicationsPerCell,   // peak hits on any one cell
  overlapDensity            // cellsTouchedMultiple / cellsTouchedBySolution
}
```

---

## Evaluation Profiles

`packages/game/src/generation/difficultyProfiles.ts`

| Profile | Forgiveness | Near-optimal paths | Generous first moves | MUSE |
|---|---|---|---|---|
| `fast` | no | no | no | no |
| `standard` *(default)* | yes (cheap only) | no | no | no |
| `full` | yes | yes | yes | yes |

`fast` is used in the pool candidate pass 1 (high-volume generation). `standard` is used for pack assembly and scoring. `full` is for offline analysis only.

---

## Candidate Pool Scoring

`packages/game/src/generation/candidateScoring.ts`

When building a pack from a candidate pool, puzzles are ranked by:

```
candidateScore = compositeDifficulty
                 + rotationReuseCount × 3
                 − max(0, scrambleLength − minMoves) × 2
```

- **rotationReuseCount**: penalty for scrambles that reuse the same template with a different rotation (nudges toward cleaner generation paths)
- **scrambleOvershootPenalty**: penalty when the scramble was longer than the optimal solution (prefers tight generation)

Alternative scorers available: `museWeightedDifficultyScore` (uses MUSE instead of composite as the intrinsic score).

---

## DifficultyReport Shape

```typescript
{
  minMoves,                    // shortest path length
  solution,                    // one shortest solution (SolutionMove[])
  colorChanges,                // pigment-set transitions in solution
  rotationsRequired,           // moves where rotation > 0
  rotationQuarterTurns,        // total quarter-turn rotations
  requiresRotation,            // false if solvable without rotation
  distinctPigmentsInTemplates, // color variety
  templateCount,
  solutionGridCellsCovered,    // distinct cells touched
  minSolutionGridCellsRequired, // 2/3 of board cells
  meetsMinGridCoverage,        // solutionGridCellsCovered ≥ minimum
  forgiveness,                 // ForgivenessMetrics
  compositeDifficulty,         // primary ranking score
  pillars,                     // { structural, forgivenessEase, mechanics, cognitive? }
  muse?,                       // bits (full profile only)
  pathUniformEntropy?,         // sum log₂|σ(s)| on shortest path
  pathBranchingCounts?         // |σ(s)| at each step
}
```

---

## Tooling

### Report difficulty for a pack

```bash
npx tsx packages/game/scripts/report-pack-difficulty.ts --slug=<pack-slug>
npx tsx packages/game/scripts/report-pack-difficulty.ts --slug=<pack-slug> --muse --compare
```

`--compare` prints Spearman rank correlation between composite and MUSE rankings, and lists any puzzles with >2 rank disagreement.

### Reorder a pack by difficulty

```bash
npx tsx packages/game/scripts/reorder-pack-by-difficulty.ts --slug=<pack-slug>
```

Re-assigns puzzle IDs 1..n in ascending composite difficulty order. Primary sort: composite; tiebreak: minMoves.

---

## Key Files

| File | Role |
|---|---|
| `packages/game/src/puzzleDifficulty.ts` | `evaluatePuzzleDifficulty` — main entry point; assembles `DifficultyReport` |
| `packages/game/src/puzzleForgiveness.ts` | `ForgivenessMetrics` + all three pillar score formulas |
| `packages/game/src/puzzleEntropy.ts` | MUSE computation |
| `packages/game/src/generation/difficultyProfiles.ts` | `fast` / `standard` / `full` evaluation profiles |
| `packages/game/src/generation/difficultyMetrics.ts` | Composable metric plugin system (`DifficultyMetric`) |
| `packages/game/src/generation/composableDifficultyEvaluator.ts` | `ComposableDifficultyEvaluator` class wrapping the plugin pipeline |
| `packages/game/src/generation/candidateScoring.ts` | Pool candidate ranking (composite + generation adjustments) |
| `packages/game/scripts/report-pack-difficulty.ts` | CLI: print difficulty table for a pack |
| `packages/game/scripts/reorder-pack-by-difficulty.ts` | CLI: reorder `packs.ts` entries by composite difficulty |
