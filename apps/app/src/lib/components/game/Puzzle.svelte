<script lang="ts">
	import { onMount } from 'svelte';
	import Square9x9 from './Square9x9.svelte';
	import PuzzleShell from './PuzzleShell.svelte';
	import { applyTemplate, rotateRight, areAllElementsOne, findHintMove } from '@flip/game';
	import type { PuzzleConfig } from '@flip/game';

	interface Props {
		puzzleConfig: PuzzleConfig;
		packSlug?: string;
		packName?: string;
		puzzleId?: number | null;
		/** Called when the puzzle is solved. Parent handles API progress save. */
		onSolve?: (data: { packSlug: string; puzzleId: number; moveCount: number }) => void;
		onNextPuzzle?: () => void;
		/** Called when user selects a template (for tutorial walkthrough). */
		onTemplateSelect?: (index: number) => void;
		/** Called after each move is applied (for tutorial: advance when first move is done). */
		onMove?: (moveCount: number) => void;
		/** Called when user rotates a template (for tutorial: advance to "apply second move" step). */
		onTemplateRotate?: (index: number) => void;
	}

	let { puzzleConfig, packSlug, packName, puzzleId, onSolve, onNextPuzzle, onTemplateSelect, onMove, onTemplateRotate }: Props = $props();

	const MAX_HISTORY = 20;

	let puzzleState = $state<number[][]>([]);
	let selectedTemplateIndex = $state<number | null>(null);
	let templateRotations = $state<number[]>([]);
	/** Which template is currently spinning; rotation in degrees (0–90) for smooth animation. */
	let animatingTemplateIndex = $state<number | null>(null);
	let animatingDeg = $state(0);
	const ROTATE_DURATION_MS = 280;
	let isSolved = $state(false);
	let moveCount = $state(0);
	let history = $state<number[][][]>([]);
	let hoverPosition = $state<[number, number] | null>(null);
	let hintRegion = $state<{ row: number; col: number; w: number; h: number } | null>(null);
	let squareSize = $state(50);
	let templateSquareSize = $state(30);
	let bestMoveCount = $state<number | null>(null);

	// Reset when puzzleConfig changes (navigating to a new puzzle)
	$effect(() => {
	  void puzzleConfig;
	  puzzleState = puzzleConfig.startState.map((r) => [...r]);
	  templateRotations = new Array(puzzleConfig.templates.length).fill(0);
	  animatingTemplateIndex = null;
	  animatingDeg = 0;
	  selectedTemplateIndex = null;
	  isSolved = false;
	  moveCount = 0;
	  history = [];
	  hoverPosition = null;
	  hintRegion = null;
	  bestMoveCount = null;
	});

	// Check for victory
	$effect(() => {
	  if (!isSolved && areAllElementsOne(puzzleState)) {
	    isSolved = true;
	    onSolve?.({ packSlug: packSlug ?? '', puzzleId: puzzleId ?? 0, moveCount });
	  }
	});

	// Responsive square sizing
	function updateSquareSize() {
	  const isMobile = window.innerWidth <= 768;
	  const isDesktop = window.innerWidth >= 1200;
	  const maxSize = isMobile ? 40 : isDesktop ? 70 : 50;
	  const minSize = isMobile ? 20 : isDesktop ? 40 : 25;

	  const usedHeight = (isMobile ? 45 : 60) + (isMobile ? 35 : 50) +
			(isMobile ? 110 : isDesktop ? 180 : 150) + (isMobile ? 32 : 40) +
			(isMobile ? 16 : isDesktop ? 120 : 80);

	  const availableHeight = window.innerHeight - usedHeight;
	  const containerWidth = isDesktop ? 1200 : window.innerWidth;
	  const availableWidth = containerWidth - (isMobile ? 20 : isDesktop ? 80 : 40);

	  const cols = puzzleState[0]?.length ?? 3;
	  const rows = puzzleState.length;
	  const calculated = Math.min(
	    Math.floor(availableWidth / cols),
	    Math.floor(availableHeight / rows)
	  );
	  squareSize = Math.max(minSize, Math.min(maxSize, calculated));
	  templateSquareSize = isMobile ? 20 : isDesktop ? 40 : 30;
	}

	onMount(() => {
	  updateSquareSize();
	  window.addEventListener('resize', updateSquareSize);
	  window.addEventListener('keydown', handleKeyDown);
	  return () => {
	    window.removeEventListener('resize', updateSquareSize);
	    window.removeEventListener('keydown', handleKeyDown);
	  };
	});

	function handleKeyDown(e: KeyboardEvent) {
	  if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
	    e.preventDefault();
	    handleUndo();
	  }
	}

	function getRotatedTemplate(index: number): number[][] {
	  let tpl = puzzleConfig.templates[index].map((r) => [...r]);
	  for (let i = 0; i < templateRotations[index]; i++) {
	    tpl = rotateRight(tpl);
	  }
	  return tpl;
	}

	function getCenteredPosition(
	  template: number[][],
	  hoverRow: number,
	  hoverCol: number
	): [number, number] | null {
	  const templateRows = template.length;
	  const templateCols = template[0]?.length ?? 0;
	  const rows = puzzleState.length;
	  const cols = puzzleState[0]?.length ?? 0;

	  if (!templateRows || !templateCols || !rows || !cols) return null;

		// Compute all valid centers where the template fits entirely within the grid
		type Candidate = { centerRow: number; centerCol: number; startRow: number; startCol: number };
		const candidates: Candidate[] = [];

		for (let centerRow = 0; centerRow < rows; centerRow++) {
		  for (let centerCol = 0; centerCol < cols; centerCol++) {
		    const startRow = centerRow - Math.floor(templateRows / 2);
		    const startCol = centerCol - Math.floor(templateCols / 2);
		    if (
		      startRow >= 0 &&
					startCol >= 0 &&
					startRow + templateRows <= rows &&
					startCol + templateCols <= cols
		    ) {
		      candidates.push({ centerRow, centerCol, startRow, startCol });
		    }
		  }
		}

		if (candidates.length === 0) return null;

		// Snap to the nearest valid center based on grid distance from the hovered cell
		let best = candidates[0];
		let bestDist = Number.POSITIVE_INFINITY;

		for (const cand of candidates) {
		  const dr = cand.centerRow - hoverRow;
		  const dc = cand.centerCol - hoverCol;
		  const distSq = dr * dr + dc * dc;
		  if (distSq < bestDist) {
		    bestDist = distSq;
		    best = cand;
		  }
		}

		return [best.startRow, best.startCol];
	}

	function applyTemplateToPuzzle(templateIndex: number, row: number, col: number) {
	  if (isSolved) return;
	  const snapshot = puzzleState.map((r) => [...r]);
	  history = [...history.slice(-(MAX_HISTORY - 1)), snapshot];
	  const rotated = getRotatedTemplate(templateIndex);
	  puzzleState = applyTemplate(puzzleState, rotated, row, col);
	  hoverPosition = null;
	  hintRegion = null;
	  moveCount += 1;
	  onMove?.(moveCount);
	}

	function handleUndo() {
	  if (history.length === 0 || isSolved) return;
	  puzzleState = history[history.length - 1].map((r) => [...r]);
	  history = history.slice(0, -1);
	  moveCount = Math.max(0, moveCount - 1);
	  selectedTemplateIndex = null;
	  hoverPosition = null;
	  hintRegion = null;
	}

	function resetPuzzle() {
	  puzzleState = puzzleConfig.startState.map((r) => [...r]);
	  templateRotations = new Array(puzzleConfig.templates.length).fill(0);
	  selectedTemplateIndex = null;
	  isSolved = false;
	  moveCount = 0;
	  history = [];
	  hoverPosition = null;
	  hintRegion = null;
	}

	let rotationCommitTimeout: ReturnType<typeof setTimeout> | null = null;

	function rotateTemplateAt(index: number) {
	  if (animatingTemplateIndex !== null) return;
	  animatingTemplateIndex = index;
	  animatingDeg = 0;
	  requestAnimationFrame(() => {
	    requestAnimationFrame(() => {
	      animatingDeg = 90;
	    });
	  });
	  if (rotationCommitTimeout !== null) clearTimeout(rotationCommitTimeout);
	  rotationCommitTimeout = setTimeout(() => commitRotation(index), ROTATE_DURATION_MS);
	}

	function commitRotation(index: number) {
	  if (rotationCommitTimeout !== null) {
	    clearTimeout(rotationCommitTimeout);
	    rotationCommitTimeout = null;
	  }
	  if (animatingTemplateIndex !== index) return;
	  const next = [...templateRotations];
	  next[index] = (next[index] + 1) % 4;
	  templateRotations = next;
	  animatingTemplateIndex = null;
	  animatingDeg = 0;
	  onTemplateRotate?.(index);
	}

	function handleRotateTransitionEnd(index: number, e: TransitionEvent) {
	  if (e.propertyName === 'transform' && animatingTemplateIndex === index) {
	    commitRotation(index);
	  }
	}


	function handleTemplateTap(index: number) {
	  // First tap: select without rotating. Subsequent taps on the same template rotate.
	  if (selectedTemplateIndex === index) {
	    rotateTemplateAt(index);
	  } else {
	    selectedTemplateIndex = index;
	  }
	  hoverPosition = null;
	  onTemplateSelect?.(index);
	}

	function handleSquareClick(row: number, col: number) {
	  if (selectedTemplateIndex === null) return;
	  const template = getRotatedTemplate(selectedTemplateIndex);
	  const pos = getCenteredPosition(template, row, col);
	  if (pos) applyTemplateToPuzzle(selectedTemplateIndex, pos[0], pos[1]);
	}

	function handleSquareHover(row: number, col: number) {
	  if (selectedTemplateIndex === null) return;
	  const template = getRotatedTemplate(selectedTemplateIndex);
	  hoverPosition = getCenteredPosition(template, row, col);
	}

	function handleSquareLeave() {
	  hoverPosition = null;
	}

	function handleHint() {
	  if (isSolved) return;
	  const base = puzzleConfig.minMovesToSolve ?? 6;
	  const maxDepth = Math.max(base + 2, 6);
	  const move = findHintMove(puzzleState, puzzleConfig.templates, maxDepth);
	  if (!move) {
	    if (typeof window !== 'undefined') {
	      window.alert('No hint available from this position. Try undoing a move or resetting.');
	    }
	    return;
	  }
	  // Show hint: select template, set rotation, highlight where to place (do not apply).
	  selectedTemplateIndex = move.templateIndex;
	  const rotations = [...templateRotations];
	  rotations[move.templateIndex] = move.rotation;
	  templateRotations = rotations;
	  let tpl = puzzleConfig.templates[move.templateIndex].map((r) => [...r]);
	  for (let i = 0; i < move.rotation; i++) {
	    tpl = rotateRight(tpl);
	  }
	  const w = tpl[0]?.length ?? 0;
	  const h = tpl.length;
	  hintRegion = { row: move.row, col: move.col, w, h };
	  hoverPosition = null;
	}

	// Render state with preview: when hovering with a selected template, show the XOR result
	// of applying that template at the snapped position, without mutating puzzleState.
	const renderState = $derived(
	  selectedTemplateIndex === null || !hoverPosition
	    ? puzzleState
	    : (() => {
	      const rotated = getRotatedTemplate(selectedTemplateIndex);
	      return applyTemplate(puzzleState, rotated, hoverPosition[0], hoverPosition[1]);
	    })()
	);

	const highlightStart = $derived(
	  selectedTemplateIndex !== null && hoverPosition
	    ? ([hoverPosition[1], hoverPosition[0]] as [number, number])
	    : undefined
	);

	const highlightDim = $derived(
	  selectedTemplateIndex !== null && hoverPosition
	    ? ((): [number, number] => {
	      const t = getRotatedTemplate(selectedTemplateIndex!);
	      return [t[0].length, t.length];
	    })()
	    : undefined
	);

	// Hint region: where to place the template (Square9x9 uses [col, row] and [w, h])
	const hintHighlightStart = $derived(
	  hintRegion ? ([hintRegion.col, hintRegion.row] as [number, number]) : undefined
	);
	const hintHighlightDim = $derived(
	  hintRegion ? ([hintRegion.w, hintRegion.h] as [number, number]) : undefined
	);
</script>

<PuzzleShell
	moveCount={moveCount}
	isSolved={isSolved}
	bestMoveCount={bestMoveCount}
	canUndo={history.length > 0}
	onUndo={handleUndo}
	onReset={resetPuzzle}
	onNextPuzzle={onNextPuzzle}
	onHint={handleHint}
	packSlug={packSlug}
	packName={packName}
	puzzleId={puzzleId}
	enableShareAndRating={true}
>
	<svelte:fragment slot="grid">
		{#if !isSolved}
			<Square9x9
				square={renderState}
				{squareSize}
				{highlightStart}
				{highlightDim}
				{hintHighlightStart}
				{hintHighlightDim}
				onSquareClick={handleSquareClick}
				onSquareHover={handleSquareHover}
				onSquareLeave={handleSquareLeave}
				testIdPrefix="puzzle-square"
			/>
		{/if}
	</svelte:fragment>

	<svelte:fragment slot="templates">
		<div class="templates-divider" aria-hidden="true"></div>
		<div class="templates-grid">
			{#each puzzleConfig.templates as _, index}
				{@const rotated = getRotatedTemplate(index)}
				{@const isSelected = selectedTemplateIndex === index}
				{@const isAnimating = animatingTemplateIndex === index}
				<div
					class="template-item"
					class:selected={isSelected}
					role="button"
					tabindex="0"
					aria-label="Template {index + 1}{isSelected ? ' (selected)' : ''}"
					data-testid="template-{index}"
					onclick={() => handleTemplateTap(index)}
					onkeydown={(e) => e.key === 'Enter' && handleTemplateTap(index)}
				>
					<div
						class="template-rotate-wrapper"
						class:animating={isAnimating}
						style="transform: rotate({isAnimating ? animatingDeg : 0}deg)"
						ontransitionend={(e) => handleRotateTransitionEnd(index, e)}
					>
						<Square9x9 square={rotated} squareSize={templateSquareSize} testIdPrefix="template-square" />
					</div>
				</div>
			{/each}
		</div>
	</svelte:fragment>
</PuzzleShell>

<style>
	.templates-divider {
		height: 1px;
		background: #000;
		margin: 0.5rem 0;
		border: none;
	}

	.templates-grid {
		display: flex;
		flex-wrap: wrap;
		gap: 0.75rem;
		justify-content: center;
	}

	.template-item {
		position: relative;
		padding: 0.5rem;
		border: 2px solid transparent;
		border-radius: 8px;
		cursor: pointer;
		transition: border-color 0.15s, box-shadow 0.15s;
		background: white;
	}

	.template-rotate-wrapper {
		display: inline-block;
		transform-origin: center center;
	}

	/* Only transition during the forward spin; when we clear animating, we snap to 0 so the new matrix doesn't "spin back" */
	.template-rotate-wrapper.animating {
		transition: transform 0.28s ease-out;
	}

	.template-item:hover {
		border-color: #c7d2fe;
		box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
	}

	.template-item.selected {
		border-color: #6366f1;
		box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.2);
	}
</style>
