<script lang="ts">
	import { onMount } from 'svelte';
	import PuzzleShell from './PuzzleShell.svelte';
	import PuzzleDevMetadata from './PuzzleDevMetadata.svelte';
	import ColorSquare from './ColorSquare.svelte';
	import { settings } from '$lib/stores/settings';
	import {
	  applyTemplate,
	  findHintMove,
	  isMonochromeFlipPuzzle,
	  isPuzzleComplete,
	  PIGMENT_HEX,
	  orientTemplate,
	  getTemplateCellPigment
	} from '@flip/game';
	import type { Pigment, PuzzleConfig, PuzzleGrid, PuzzleTemplate } from '@flip/game';
	import { computePuzzleLayout } from '$lib/utils/puzzleLayout';

	interface Props {
		puzzleConfig: PuzzleConfig;
		packSlug?: string;
		packName?: string;
		puzzleId?: number | null;
		bestMoveCount?: number | null;
		onSolve?: (data: { packSlug: string; puzzleId: number; moveCount: number }) => void;
		onNextPuzzle?: () => void;
		onTemplateSelect?: (index: number) => void;
		onMove?: (moveCount: number) => void;
		onTemplateRotate?: (index: number) => void;
	}

	let {
	  puzzleConfig,
	  packSlug,
	  packName,
	  puzzleId,
	  bestMoveCount = null,
	  onSolve,
	  onNextPuzzle,
	  onTemplateSelect,
	  onMove,
	  onTemplateRotate
	}: Props = $props();

	const MAX_HISTORY = 20;
	const ROTATE_DURATION_MS = 280;
	const TEMPLATE_CELL_GAP = 2;
	/** Fixed render resolution for template previews — display size uses CSS scale. */
	const TEMPLATE_RENDER_CELL = 10;

	function getTemplateBoundDim(shape: number[][]): number {
	  return Math.max(shape.length, shape[0]?.length ?? 0);
	}

	function getTemplateBoundSize(boundDim: number, squareSize: number): number {
	  return boundDim * squareSize + (boundDim - 1) * TEMPLATE_CELL_GAP;
	}

	let puzzleState = $state<PuzzleGrid>([]);
	let selectedTemplateIndex = $state<number | null>(null);
	let templateRotations = $state<number[]>([]);
	let animatingTemplateIndex = $state<number | null>(null);
	let animatingDeg = $state(0);
	let animatingDurationMs = $state(ROTATE_DURATION_MS);
	let rotationCommitTimeout: ReturnType<typeof setTimeout> | null = null;
	/** When set, commitRotation applies this absolute rotation instead of +90°. */
	let rotationTarget: number | null = null;
	let onRotationComplete: (() => void) | null = null;
	let isSolved = $state(false);
	let moveCount = $state(0);
	let usedTemplateMask = $state(0);
	let history = $state<{ state: PuzzleGrid; usedTemplateMask: number }[]>([]);
	let hoverPosition = $state<[number, number] | null>(null);
	let hintRegion = $state<{ row: number; col: number; w: number; h: number } | null>(null);
	let cellSize = $state(50);
	let templateSquareSize = $state(30);
	let templateAreaHeight = $state(120);
	let layoutRoot: HTMLDivElement | null = $state(null);
	let resizeFrame: number | null = null;
	let lastLayoutKey = '';

	const templateScale = $derived(templateSquareSize / TEMPLATE_RENDER_CELL);

	const monochromeFlip = $derived(isMonochromeFlipPuzzle(puzzleConfig));
	const allowRotation = true;
	const showHints = true;

	const tileMode = $derived($settings.tileAppearanceMode);
	const showColor = $derived(
	  !monochromeFlip && (tileMode === 'color' || tileMode === 'colorAndLines')
	);
	const showLines = $derived(tileMode === 'lines' || tileMode === 'colorAndLines');

	function lineFlags(pigment: Pigment) {
	  return { h: (pigment & 1) !== 0, v: (pigment & 2) !== 0, d: (pigment & 4) !== 0 };
	}

	$effect(() => {
	  void puzzleConfig;
	  lastLayoutKey = '';
	  puzzleState = puzzleConfig.startState.map((r) => [...r]);
	  templateRotations = new Array(puzzleConfig.templates.length).fill(0);
	  animatingTemplateIndex = null;
	  animatingDeg = 0;
	  animatingDurationMs = ROTATE_DURATION_MS;
	  rotationTarget = null;
	  onRotationComplete = null;
	  if (rotationCommitTimeout !== null) {
	    clearTimeout(rotationCommitTimeout);
	    rotationCommitTimeout = null;
	  }
	  selectedTemplateIndex = null;
	  isSolved = false;
	  moveCount = 0;
	  usedTemplateMask = 0;
	  history = [];
	  hoverPosition = null;
	  hintRegion = null;
	});

	$effect(() => {
	  if (!isSolved && isPuzzleComplete(puzzleConfig, puzzleState, usedTemplateMask)) {
	    isSolved = true;
	    onSolve?.({ packSlug: packSlug ?? '', puzzleId: puzzleId ?? 0, moveCount });
	  }
	});

	function measureAvailableSpace(): { width: number; height: number; isMobile: boolean } {
	  const isMobile = window.innerWidth <= 768;
	  const root = layoutRoot;
	  const width = root?.clientWidth ?? window.innerWidth - (isMobile ? 32 : 64);

	  if (!root) {
	    return {
	      width,
	      height: window.innerHeight - (isMobile ? 160 : 200),
	      isMobile
	    };
	  }

	  const top = root.getBoundingClientRect().top;
	  return {
	    width,
	    height: Math.max(200, window.innerHeight - top - 8),
	    isMobile
	  };
	}

	function updateSizes() {
	  const rows = puzzleState.length;
	  const cols = puzzleState[0]?.length ?? 3;
	  if (rows === 0 || cols === 0) return;

	  const templateBoundDims = puzzleConfig.templates.map((t) =>
	    Math.max(t.shape.length, t.shape[0]?.length ?? 0)
	  );

	  const { width, height, isMobile } = measureAvailableSpace();

	  const layout = computePuzzleLayout({
	    rows,
	    cols,
	    templateBoundDims,
	    templateCount: puzzleConfig.templates.length,
	    availableWidth: width,
	    availableHeight: height,
	    isMobile
	  });

	  const nextKey = `${layout.cellSize},${layout.templateSquareSize},${layout.templateAreaHeight}`;
	  if (nextKey === lastLayoutKey) return;
	  lastLayoutKey = nextKey;

	  cellSize = layout.cellSize;
	  templateSquareSize = layout.templateSquareSize;
	  templateAreaHeight = layout.templateAreaHeight;
	}

	function scheduleUpdateSizes() {
	  if (resizeFrame !== null) return;
	  resizeFrame = requestAnimationFrame(() => {
	    resizeFrame = null;
	    updateSizes();
	  });
	}

	$effect(() => {
	  void puzzleConfig;
	  void puzzleState.length;
	  void puzzleState[0]?.length;
	  void puzzleConfig.templates.length;
	  scheduleUpdateSizes();
	});

	onMount(() => {
	  scheduleUpdateSizes();
	  window.addEventListener('resize', scheduleUpdateSizes);
	  window.addEventListener('keydown', handleKeyDown);
	  return () => {
	    if (resizeFrame !== null) cancelAnimationFrame(resizeFrame);
	    window.removeEventListener('resize', scheduleUpdateSizes);
	    window.removeEventListener('keydown', handleKeyDown);
	  };
	});

	function handleKeyDown(e: KeyboardEvent) {
	  if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
	    e.preventDefault();
	    handleUndo();
	  }
	}

	function getOrientedTemplate(index: number): PuzzleTemplate {
	  const base = puzzleConfig.templates[index];
	  return orientTemplate(base, templateRotations[index] ?? 0);
	}

	function getSnapToCenterPosition(
	  templateRows: number,
	  templateCols: number,
	  hoverRow: number,
	  hoverCol: number
	): [number, number] | null {
	  const gridRows = puzzleState.length;
	  const gridCols = puzzleState[0]?.length ?? 0;
	  if (!templateRows || !templateCols || !gridRows || !gridCols) return null;
		type Candidate = { centerRow: number; centerCol: number; startRow: number; startCol: number };
		const candidates: Candidate[] = [];
		for (let centerRow = 0; centerRow < gridRows; centerRow++) {
		  for (let centerCol = 0; centerCol < gridCols; centerCol++) {
		    const startRow = centerRow - Math.floor(templateRows / 2);
		    const startCol = centerCol - Math.floor(templateCols / 2);
		    if (
		      startRow >= 0 &&
					startCol >= 0 &&
					startRow + templateRows <= gridRows &&
					startCol + templateCols <= gridCols
		    ) {
		      candidates.push({ centerRow, centerCol, startRow, startCol });
		    }
		  }
		}
		if (candidates.length === 0) return null;
		let best = candidates[0];
		let bestDist = Number.POSITIVE_INFINITY;
		for (const c of candidates) {
		  const distSq = (c.centerRow - hoverRow) ** 2 + (c.centerCol - hoverCol) ** 2;
		  if (distSq < bestDist) {
		    bestDist = distSq;
		    best = c;
		  }
		}
		return [best.startRow, best.startCol];
	}

	function applyAt(templateIndex: number, row: number, col: number) {
	  if (isSolved) return;
	  history = [
	    ...history.slice(-(MAX_HISTORY - 1)),
	    {
	      state: puzzleState.map((r) => [...r]),
	      usedTemplateMask
	    }
	  ];
	  const oriented = getOrientedTemplate(templateIndex);
	  puzzleState = applyTemplate(puzzleState, oriented, row, col);
	  usedTemplateMask |= 1 << templateIndex;
	  hoverPosition = null;
	  hintRegion = null;
	  moveCount += 1;
	  selectedTemplateIndex = null;
	  onMove?.(moveCount);
	}

	function handleUndo() {
	  if (history.length === 0 || isSolved) return;
	  const previous = history[history.length - 1];
	  puzzleState = previous.state.map((r) => [...r]);
	  usedTemplateMask = previous.usedTemplateMask;
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
	  usedTemplateMask = 0;
	  history = [];
	  hoverPosition = null;
	  hintRegion = null;
	}

	function commitRotation(index: number) {
	  if (rotationCommitTimeout !== null) {
	    clearTimeout(rotationCommitTimeout);
	    rotationCommitTimeout = null;
	  }
	  if (animatingTemplateIndex !== index) return;
	  const next = [...templateRotations];
	  const previous = next[index] ?? 0;
	  if (rotationTarget !== null) {
	    next[index] = rotationTarget;
	    rotationTarget = null;
	  } else {
	    next[index] = (previous + 1) % 4;
	  }
	  templateRotations = next;
	  animatingTemplateIndex = null;
	  animatingDeg = 0;
	  if (next[index] !== previous) onTemplateRotate?.(index);
	  const complete = onRotationComplete;
	  onRotationComplete = null;
	  complete?.();
	}

	function startRotationAnimation(index: number, degrees: number): boolean {
	  if (animatingTemplateIndex !== null) return false;
	  const durationMs = ROTATE_DURATION_MS * (degrees / 90);
	  animatingDurationMs = durationMs;
	  animatingTemplateIndex = index;
	  animatingDeg = 0;
	  requestAnimationFrame(() => {
	    requestAnimationFrame(() => {
	      animatingDeg = degrees;
	    });
	  });
	  if (rotationCommitTimeout !== null) clearTimeout(rotationCommitTimeout);
	  rotationCommitTimeout = setTimeout(() => commitRotation(index), durationMs);
	  return true;
	}

	function handleRotateTransitionEnd(index: number, e: TransitionEvent) {
	  if (e.propertyName === 'transform' && animatingTemplateIndex === index) {
	    commitRotation(index);
	  }
	}

	function handleTemplateTap(index: number) {
	  if (animatingTemplateIndex !== null) return;
	  if (selectedTemplateIndex === index) {
	    if (allowRotation) {
	      startRotationAnimation(index, 90);
	    } else {
	      selectedTemplateIndex = null;
	    }
	  } else {
	    selectedTemplateIndex = index;
	  }
	  hoverPosition = null;
	  onTemplateSelect?.(index);
	}

	function handleCellClick(row: number, col: number) {
	  if (selectedTemplateIndex === null) return;
	  const template = getOrientedTemplate(selectedTemplateIndex);
	  const pos = getSnapToCenterPosition(template.shape.length, template.shape[0]?.length ?? 0, row, col);
	  if (pos) applyAt(selectedTemplateIndex, pos[0], pos[1]);
	}

	function handleCellHover(row: number, col: number) {
	  if (selectedTemplateIndex === null) return;
	  const template = getOrientedTemplate(selectedTemplateIndex);
	  hoverPosition = getSnapToCenterPosition(
	    template.shape.length,
	    template.shape[0]?.length ?? 0,
	    row,
	    col
	  );
	}

	function showHintRegion(move: { templateIndex: number; row: number; col: number }) {
	  const oriented = getOrientedTemplate(move.templateIndex);
	  hintRegion = {
	    row: move.row,
	    col: move.col,
	    w: oriented.shape[0]?.length ?? 0,
	    h: oriented.shape.length
	  };
	  hoverPosition = null;
	}

	function handleHint() {
	  if (isSolved || !showHints || animatingTemplateIndex !== null) return;
	  const base = puzzleConfig.minMovesToSolve ?? 6;
	  const move = findHintMove(
	    puzzleConfig,
	    Math.max(base + 2, 6),
	    puzzleState,
	    usedTemplateMask
	  );
	  if (!move) {
	    if (typeof window !== 'undefined') {
	      window.alert('No hint available from this position. Try undoing a move or resetting.');
	    }
	    return;
	  }
	  selectedTemplateIndex = move.templateIndex;
	  const currentRotation = templateRotations[move.templateIndex] ?? 0;
	  const rotationSteps = (move.rotation - currentRotation + 4) % 4;

	  if (rotationSteps === 0 || !allowRotation) {
	    if (!allowRotation && move.rotation !== currentRotation) {
	      const rotations = [...templateRotations];
	      rotations[move.templateIndex] = move.rotation;
	      templateRotations = rotations;
	    }
	    showHintRegion(move);
	    return;
	  }

	  rotationTarget = move.rotation;
	  onRotationComplete = () => showHintRegion(move);
	  startRotationAnimation(move.templateIndex, rotationSteps * 90);
	}

	const renderState = $derived(
	  selectedTemplateIndex === null || !hoverPosition
	    ? puzzleState
	    : (() => {
	      const oriented = getOrientedTemplate(selectedTemplateIndex);
	      return applyTemplate(
	        puzzleState,
	        oriented,
	        hoverPosition[0],
	        hoverPosition[1]
	      );
	    })()
	);

	const hoverHighlight = $derived(
	  (() => {
	    if (selectedTemplateIndex === null || !hoverPosition) return undefined;
	    const t = getOrientedTemplate(selectedTemplateIndex);
	    return {
	      start: [hoverPosition[1], hoverPosition[0]] as [number, number],
	      dim: [t.shape[0]?.length ?? 0, t.shape.length] as [number, number]
	    };
	  })()
	);

	const hintHighlight = $derived(
	  hintRegion
	    ? {
	      start: [hintRegion.col, hintRegion.row] as [number, number],
	      dim: [hintRegion.w, hintRegion.h] as [number, number]
	    }
	    : undefined
	);
</script>

<div class="puzzle-layout-root" bind:this={layoutRoot}>
<PuzzleShell
	moveCount={moveCount}
	isSolved={isSolved}
	{bestMoveCount}
	canUndo={history.length > 0}
	onUndo={handleUndo}
	onReset={resetPuzzle}
	onNextPuzzle={onNextPuzzle}
	onHint={showHints ? handleHint : undefined}
	{packSlug}
	{packName}
	{puzzleId}
	enableShareAndRating={true}
>
	<svelte:fragment slot="grid">
		<ColorSquare
			grid={renderState}
			{cellSize}
			monochromeFlip={monochromeFlip}
			highlightStart={hoverHighlight?.start}
			highlightDim={hoverHighlight?.dim}
			hintHighlightStart={hintHighlight?.start}
			hintHighlightDim={hintHighlight?.dim}
			onCellClick={handleCellClick}
			onCellHover={handleCellHover}
			onLeave={() => (hoverPosition = null)}
		/>
	</svelte:fragment>

	<svelte:fragment slot="templates">
		<div class="templates-divider" aria-hidden="true"></div>
		<div
			class="templates-grid"
			style:height="{templateAreaHeight}px"
		>
			{#each puzzleConfig.templates as template, index}
				{@const isSelected = selectedTemplateIndex === index}
				{@const isAnimating = animatingTemplateIndex === index}
				{@const orientedTemplate = getOrientedTemplate(index)}
				{@const orientedShape = orientedTemplate.shape}
				{@const boundDim = getTemplateBoundDim(template.shape)}
				{@const baseBound = getTemplateBoundSize(boundDim, TEMPLATE_RENDER_CELL)}
				{@const displayBound = baseBound * templateScale}
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
						class="template-scale-slot"
						style:width="{displayBound}px"
						style:height="{displayBound}px"
					>
						<div
							class="template-rotate-wrapper"
							class:animating={isAnimating && allowRotation}
							style:width="{baseBound}px"
							style:height="{baseBound}px"
							style:--rotate-duration="{animatingDurationMs}ms"
							style:transform={allowRotation && isAnimating
							  ? `rotate(${animatingDeg}deg) scale(${templateScale})`
							  : `scale(${templateScale})`}
							style:transform-origin="center center"
							ontransitionend={(e) => handleRotateTransitionEnd(index, e)}
						>
							<div class="template-item-shape">
								{#each orientedShape as shapeRow, rowIdx}
									<div class="template-item-shape-row">
										{#each shapeRow as cell, colIdx}
											{@const filled = cell === 1}
											{@const cellPigment = getTemplateCellPigment(orientedTemplate, rowIdx, colIdx)}
											{@const cellHex = PIGMENT_HEX[cellPigment]}
											{@const lines = filled ? lineFlags(cellPigment) : { h: false, v: false, d: false }}
											<div
												class="template-item-shape-cell"
												class:filled
												class:with-lines={showLines && filled && (lines.h || lines.v || lines.d)}
												style:width="{TEMPLATE_RENDER_CELL}px"
												style:height="{TEMPLATE_RENDER_CELL}px"
												style:background={filled
												  ? monochromeFlip
												    ? '#1f2937'
												    : showColor
												      ? cellHex
												      : '#e5e7eb'
												  : '#f9fafb'}
											>
												{#if showLines && filled && (lines.h || lines.v || lines.d)}
													<span class="template-cell-lines" aria-hidden="true">
														{#if lines.h}<span class="template-line template-line-h"></span>{/if}
														{#if lines.v}<span class="template-line template-line-v"></span>{/if}
														{#if lines.d}<span class="template-line template-line-d"></span>{/if}
													</span>
												{/if}
											</div>
										{/each}
									</div>
								{/each}
							</div>
						</div>
					</div>
				</div>
			{/each}
		</div>
	</svelte:fragment>

	<svelte:fragment slot="legend">
		<PuzzleDevMetadata
			{puzzleConfig}
			{packSlug}
			{packName}
			{puzzleId}
			{moveCount}
		/>
	</svelte:fragment>
</PuzzleShell>
</div>

<style>
	.puzzle-layout-root {
		flex: 1 1 0;
		width: 100%;
		min-height: 0;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: flex-start;
		overflow: hidden;
	}

	.templates-divider {
		height: 1px;
		background: #000;
		margin: 0.5rem 0;
		border: none;
	}

	.templates-grid {
		display: flex;
		flex-wrap: nowrap;
		align-items: center;
		justify-content: center;
		gap: 0.5rem;
		width: 100%;
		max-width: 100%;
		box-sizing: border-box;
		overflow: hidden;
	}

	.template-item {
		position: relative;
		display: flex;
		align-items: center;
		flex-shrink: 0;
		padding: 0.35rem;
		border: 2px solid transparent;
		border-radius: 8px;
		cursor: pointer;
		transition: border-color 0.15s, box-shadow 0.15s;
		background: white;
	}

	.template-scale-slot {
		display: flex;
		align-items: center;
		justify-content: center;
		flex-shrink: 0;
		overflow: hidden;
	}

	.template-item:hover {
		border-color: #c7d2fe;
		box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
	}

	.template-item.selected {
		border-color: #6366f1;
		box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.2);
	}

	.template-rotate-wrapper {
		display: flex;
		align-items: center;
		justify-content: center;
		flex-shrink: 0;
		will-change: transform;
	}

	.template-rotate-wrapper.animating {
		transition: transform var(--rotate-duration, 280ms) ease-out;
	}

	.template-item-shape {
		display: flex;
		flex-direction: column;
		gap: 2px;
	}

	.template-item-shape-row {
		display: flex;
		gap: 2px;
	}

	.template-item-shape-cell {
		border-radius: 3px;
		border: 1px solid #e5e7eb;
		flex-shrink: 0;
	}

	.template-item-shape-cell.filled {
		border-color: transparent;
		opacity: 0.9;
		position: relative;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.template-item-shape-cell.with-lines .template-cell-lines {
		position: absolute;
		inset: 0;
		display: flex;
		align-items: center;
		justify-content: center;
		pointer-events: none;
	}

	.template-line {
		position: absolute;
		background: #1f2937;
		border-radius: 1px;
	}

	.template-line-h {
		width: 65%;
		height: 2px;
	}

	.template-line-v {
		width: 2px;
		height: 65%;
	}

	.template-line-d {
		width: 90%;
		height: 2px;
		transform: rotate(-45deg);
	}
</style>
