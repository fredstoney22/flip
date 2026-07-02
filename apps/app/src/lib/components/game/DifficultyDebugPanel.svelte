<script lang="ts">
  import { dev } from '$app/environment';
  import {
    defaultPedagogyValidator,
    evaluatePuzzleDifficulty,
    resolveSearchBudget,
    type PuzzleConfig
  } from '@flip/game';
  import type { PuzzleDifficultyDebugData } from '$lib/types/puzzleDifficultyDebug';

  interface Props {
    config?: PuzzleConfig;
    /** When set, runs pedagogy rules for this First Steps concept id. */
    pedagogyConceptId?: number;
  }

  let { config, pedagogyConceptId }: Props = $props();

  let expanded = $state(false);
  let clientDebug = $state<PuzzleDifficultyDebugData | null>(null);
  let computing = $state(false);

  $effect(() => {
    if (!dev || !config || !expanded) {
      clientDebug = null;
      computing = false;
      return;
    }

    computing = true;
    const id = requestAnimationFrame(() => {
      const maxDepth = resolveSearchBudget(config, 'authoring').maxDepth;
      clientDebug = {
        maxDepth,
        gridSize: config.startState.length,
        report: evaluatePuzzleDifficulty(config, maxDepth, { includeMuse: true }),
        pedagogy:
          pedagogyConceptId !== undefined
            ? defaultPedagogyValidator.validateConcept(config, pedagogyConceptId)
            : null
      };
      computing = false;
    });

    return () => cancelAnimationFrame(id);
  });

  function formatNum(value: number | undefined, digits = 1): string {
    if (value === undefined) return '—';
    return Number.isInteger(value) ? String(value) : value.toFixed(digits);
  }
</script>

{#if dev && config}
  <section class="difficulty-debug" aria-label="Developer difficulty metrics">
    <button
      type="button"
      class="difficulty-debug-toggle"
      aria-expanded={expanded}
      onclick={() => (expanded = !expanded)}
    >
      <span class="difficulty-debug-badge">dev</span>
      <span>Difficulty metrics</span>
      {#if computing}
        <span class="difficulty-debug-muted">computing…</span>
      {:else if clientDebug?.report}
        <span class="difficulty-debug-muted">
          comp {formatNum(clientDebug.report.compositeDifficulty)} · {clientDebug.report.minMoves} moves
        </span>
      {:else if clientDebug && !clientDebug.report}
        <span class="difficulty-debug-muted">unsolvable at depth {clientDebug.maxDepth}</span>
      {/if}
    </button>

    {#if expanded && clientDebug}
      <div class="difficulty-debug-body">
        <dl class="difficulty-debug-grid">
          <div>
            <dt>Search depth</dt>
            <dd>{clientDebug.maxDepth}</dd>
          </div>
          <div>
            <dt>Grid</dt>
            <dd>{clientDebug.gridSize}×{clientDebug.gridSize}</dd>
          </div>
        </dl>

        {#if clientDebug.report}
          {@const report = clientDebug.report}
          {@const f = report.forgiveness}
          {@const p = report.pillars}

          <dl class="difficulty-debug-grid">
            <div>
              <dt>Min moves</dt>
              <dd>{report.minMoves}</dd>
            </div>
            <div>
              <dt>Composite</dt>
              <dd>{formatNum(report.compositeDifficulty)}</dd>
            </div>
            <div>
              <dt>MUSE</dt>
              <dd>{formatNum(report.muse)}</dd>
            </div>
            <div>
              <dt>Path entropy</dt>
              <dd>{formatNum(report.pathUniformEntropy)}</dd>
            </div>
          </dl>

          {#if p}
            <p class="difficulty-debug-section-title">Pillars</p>
            <dl class="difficulty-debug-grid">
              <div>
                <dt>Structural</dt>
                <dd>{formatNum(p.structural)}</dd>
              </div>
              <div>
                <dt>Mechanics</dt>
                <dd>{formatNum(p.mechanics)}</dd>
              </div>
              <div>
                <dt>Forgiveness ease</dt>
                <dd>{formatNum(p.forgivenessEase)}</dd>
              </div>
              {#if p.cognitive !== undefined}
                <div>
                  <dt>Cognitive</dt>
                  <dd>{formatNum(p.cognitive)}</dd>
                </div>
              {/if}
            </dl>
          {/if}

          <p class="difficulty-debug-section-title">Forgiveness</p>
          <dl class="difficulty-debug-grid">
            <div>
              <dt>Generous openings</dt>
              <dd>{Math.round(f.generousFirstMoveRate * 100)}%</dd>
            </div>
            <div>
              <dt>Shortest paths</dt>
              <dd>{f.shortestSolutionCount}{f.solutionCountCapped ? '+' : ''}</dd>
            </div>
            <div>
              <dt>Overlap</dt>
              <dd>{Math.round(f.overlapDensity * 100)}%</dd>
            </div>
            <div>
              <dt>Rotations</dt>
              <dd>{report.rotationQuarterTurns} qt</dd>
            </div>
          </dl>

          <dl class="difficulty-debug-grid">
            <div>
              <dt>Color changes</dt>
              <dd>{report.colorChanges}</dd>
            </div>
            <div>
              <dt>Requires rotation</dt>
              <dd>{report.requiresRotation ? 'yes' : 'no'}</dd>
            </div>
            <div>
              <dt>Grid coverage</dt>
              <dd>
                {report.solutionGridCellsCovered}/{report.minSolutionGridCellsRequired}
                {report.meetsMinGridCoverage ? '✓' : '✗'}
              </dd>
            </div>
          </dl>
        {:else}
          <p class="difficulty-debug-muted">
            No report — puzzle may be unsolvable within the authoring search depth.
          </p>
        {/if}

        {#if clientDebug.pedagogy}
          <p class="difficulty-debug-section-title">Pedagogy</p>
          <p class="difficulty-debug-pedagogy" class:pass={clientDebug.pedagogy.passes}>
            Concept {clientDebug.pedagogy.targetConcept}: {clientDebug.pedagogy.passes ? 'passes' : 'fails'}
          </p>
          <ul class="difficulty-debug-rules">
            {#each clientDebug.pedagogy.checks as check (check.ruleId)}
              <li class:fail={!check.passed}>
                {check.ruleId}{check.detail ? ` — ${check.detail}` : ''}
              </li>
            {/each}
          </ul>
        {/if}
      </div>
    {/if}
  </section>
{/if}

<style>
  .difficulty-debug {
    flex: 0 0 auto;
    width: 100%;
    margin-bottom: 0.5rem;
  }

  .difficulty-debug-toggle {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 0.35rem 0.5rem;
    width: 100%;
    padding: 0.5rem 0.65rem;
    font-size: 0.75rem;
    text-align: left;
    color: #374151;
    background: #f9fafb;
    border: 1px dashed #c4b5fd;
    border-radius: 8px;
    cursor: pointer;
  }

  .difficulty-debug-toggle:hover {
    background: #f3f4f6;
  }

  .difficulty-debug-badge {
    padding: 0.1rem 0.35rem;
    font-size: 0.625rem;
    font-weight: 600;
    letter-spacing: 0.04em;
    text-transform: uppercase;
    color: #5b21b6;
    background: #ede9fe;
    border-radius: 4px;
  }

  .difficulty-debug-muted {
    color: #6b7280;
    font-size: 0.6875rem;
  }

  .difficulty-debug-body {
    margin-top: 0.35rem;
    padding: 0.65rem 0.75rem;
    font-size: 0.6875rem;
    background: white;
    border: 1px solid #e5e7eb;
    border-radius: 8px;
  }

  .difficulty-debug-section-title {
    margin: 0.5rem 0 0.25rem;
    font-size: 0.625rem;
    font-weight: 600;
    letter-spacing: 0.03em;
    text-transform: uppercase;
    color: #6b7280;
  }

  .difficulty-debug-section-title:first-child {
    margin-top: 0;
  }

  .difficulty-debug-grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 0.35rem 0.75rem;
    margin: 0;
  }

  @media (min-width: 640px) {
    .difficulty-debug-grid {
      grid-template-columns: repeat(4, minmax(0, 1fr));
    }
  }

  .difficulty-debug-grid div {
    min-width: 0;
  }

  .difficulty-debug-grid dt {
    margin: 0;
    color: #9ca3af;
    font-weight: 500;
  }

  .difficulty-debug-grid dd {
    margin: 0;
    font-variant-numeric: tabular-nums;
    color: #111827;
  }

  .difficulty-debug-pedagogy {
    margin: 0 0 0.35rem;
    font-weight: 600;
    color: #b45309;
  }

  .difficulty-debug-pedagogy.pass {
    color: #047857;
  }

  .difficulty-debug-rules {
    margin: 0;
    padding-left: 1rem;
    color: #374151;
  }

  .difficulty-debug-rules li.fail {
    color: #b91c1c;
  }
</style>
