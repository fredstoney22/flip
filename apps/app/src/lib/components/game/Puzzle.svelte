<script lang="ts">
	import { onMount } from 'svelte';
	import PuzzleShell from './PuzzleShell.svelte';
	import ColorSquare from './ColorSquare.svelte';
	import LensChrome from './LensChrome.svelte';
	import TemplateLensPreview from './TemplateLensPreview.svelte';
	import TemplateDragGhost from './TemplateDragGhost.svelte';
	import { settings } from '$lib/stores/settings';
	import {
	  applyTemplate,
	  findHintMove,
	  FIRST_STEPS_SLUG,
	  isMonochromeFlipPuzzle,
	  isPuzzleSolved,
	  orientTemplate,
	} from '@flip/game';
	import type { PuzzleConfig, PuzzleGrid, PuzzleTemplate } from '@flip/game';
	import { computePuzzleLayout, getTemplateIndexRowGroups, TEMPLATE_RENDER_CELL } from '$lib/utils/puzzleLayout';
	import { getSnapToCenterPosition } from '$lib/utils/templateSnap';

	interface Props {
		puzzleConfig: PuzzleConfig;
		packSlug?: string;
		packName?: string;
		puzzleId?: number | null;
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
	  onSolve,
	  onNextPuzzle,
	  onTemplateSelect,
	  onMove,
	  onTemplateRotate
	}: Props = $props();

	const MAX_HISTORY = 20;
	const ROTATE_DURATION_MS = 280;
	const TEMPLATE_CELL_GAP = 2;
	const DRAG_THRESHOLD_PX = 6;

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
	let layoutTemplateIndexRowGroups = $state<number[][]>([]);
	const templateIndexRowGroups = $derived(
	  layoutTemplateIndexRowGroups.length > 0
	    ? layoutTemplateIndexRowGroups
	    : getTemplateIndexRowGroups(puzzleConfig.templates.length, 1)
	);
	let layoutRoot: HTMLDivElement | null = $state(null);
	let colorSquareRef: ColorSquare | null = $state(null);
	let resizeFrame: number | null = null;
	let lastLayoutKey = '';
	let activeTemplateDrag = $state<{
		templateIndex: number;
		pointerId: number;
		startX: number;
		startY: number;
		clientX: number;
		clientY: number;
		isDragging: boolean;
		rotationSteps: number;
		captureTarget: HTMLElement | null;
	} | null>(null);

	const templateScale = $derived(templateSquareSize / TEMPLATE_RENDER_CELL);
	const dragGhost = $derived(
	  activeTemplateDrag?.isDragging
	    ? (() => {
	      const template = puzzleConfig.templates[activeTemplateDrag.templateIndex];
	      const oriented = orientTemplate(template, activeTemplateDrag.rotationSteps);
	      const boundDim = getTemplateBoundDim(oriented.shape);
	      const baseBound = getTemplateBoundSize(boundDim, TEMPLATE_RENDER_CELL);
	      const pickerBound = baseBound * templateScale;
	      return {
	        clientX: activeTemplateDrag.clientX,
	        clientY: activeTemplateDrag.clientY,
	        templateIndex: activeTemplateDrag.templateIndex,
	        rotationSteps: activeTemplateDrag.rotationSteps,
	        boundPx: pickerBound
	      };
	    })()
	    : null
	);

	const monochromeFlip = $derived(isMonochromeFlipPuzzle(puzzleConfig));
	const showHints = true;
	const autoOpenHowTo = $derived(packSlug === FIRST_STEPS_SLUG && puzzleId === 1);

	const tileMode = $derived($settings.tileAppearanceMode);
	const showColor = $derived(
	  !monochromeFlip && (tileMode === 'color' || tileMode === 'colorAndLines')
	);
	const showLines = $derived(tileMode === 'lines' || tileMode === 'colorAndLines');

	$effect.pre(() => {
	  void puzzleConfig;
	  lastLayoutKey = '';
	  puzzleState = puzzleConfig.startState.map((r) => [...r]);
	  templateRotations = new Array(puzzleConfig.templates.length).fill(0);
	  layoutTemplateIndexRowGroups = [];
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
	  activeTemplateDrag = null;
	});

	$effect(() => {
	  if (
	    !isSolved &&
	    puzzleState.length > 0 &&
	    isPuzzleSolved(puzzleConfig, puzzleState)
	  ) {
	    isSolved = true;
	    onSolve?.({ packSlug: packSlug ?? '', puzzleId: puzzleId ?? 0, moveCount });
	  }
	});

	function measureAvailableSpace(): { width: number; height: number; isMobile: boolean } {
	  const isMobile = window.innerWidth <= 768;
	  const root = layoutRoot;

	  if (!root) {
	    const width = window.innerWidth - (isMobile ? 32 : 64);
	    return {
	      width,
	      height: window.innerHeight - (isMobile ? 160 : 200),
	      isMobile
	    };
	  }

	  const rect = root.getBoundingClientRect();
	  const width = Math.max(1, rect.width || root.clientWidth);
	  const parent = root.parentElement;
	  const parentHeight = parent?.clientHeight ?? 0;

	  if (parentHeight > 0) {
	    return {
	      width,
	      height: Math.max(200, parentHeight),
	      isMobile
	    };
	  }

	  return {
	    width,
	    height: Math.max(200, window.innerHeight - rect.top - 8),
	    isMobile
	  };
	}

	function updateSizes() {
	  if (isSolved) return;

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

	  const nextKey = `${layout.cellSize},${layout.templateSquareSize},${layout.templateAreaHeight},${layout.templateRowCount}`;
	  if (nextKey === lastLayoutKey) return;
	  lastLayoutKey = nextKey;

	  cellSize = layout.cellSize;
	  templateSquareSize = layout.templateSquareSize;
	  templateAreaHeight = layout.templateAreaHeight;
	  layoutTemplateIndexRowGroups = layout.templateIndexRowGroups;
	}

	function scheduleUpdateSizes() {
	  if (resizeFrame !== null) return;
	  resizeFrame = requestAnimationFrame(() => {
	    resizeFrame = null;
	    updateSizes();
	  });
	}

	$effect(() => {
	  if (isSolved) return;
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

	$effect(() => {
	  const root = layoutRoot;
	  if (!root || typeof ResizeObserver === 'undefined') return;

	  const observer = new ResizeObserver(() => scheduleUpdateSizes());
	  observer.observe(root);
	  const parent = root.parentElement;
	  if (parent) observer.observe(parent);
	  scheduleUpdateSizes();

	  return () => observer.disconnect();
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

	/** Rotation used for hover preview — steps at 90° boundaries while a template animates. */
	function getPreviewRotation(index: number): number {
	  const committed = templateRotations[index] ?? 0;
	  if (animatingTemplateIndex !== index) return committed;
	  return (committed + Math.floor(animatingDeg / 90)) % 4;
	}

	function getOrientedTemplateForPreview(index: number): PuzzleTemplate {
	  const base = puzzleConfig.templates[index];
	  return orientTemplate(base, getPreviewRotation(index));
	}

	function handleCellClick(row: number, col: number) {
	  if (selectedTemplateIndex === null) return;
	  const template = getOrientedTemplate(selectedTemplateIndex);
	  const pos = getSnapToCenterPosition(
	    template.shape.length,
	    template.shape[0]?.length ?? 0,
	    puzzleState.length,
	    puzzleState[0]?.length ?? 0,
	    row,
	    col
	  );
	  if (pos) applyAt(selectedTemplateIndex, pos[0], pos[1]);
	}

	function handleCellHover(row: number, col: number) {
	  if (selectedTemplateIndex === null) return;
	  const template = getOrientedTemplate(selectedTemplateIndex);
	  hoverPosition = getSnapToCenterPosition(
	    template.shape.length,
	    template.shape[0]?.length ?? 0,
	    puzzleState.length,
	    puzzleState[0]?.length ?? 0,
	    row,
	    col
	  );
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
	  selectedTemplateIndex = null;
	  hoverPosition = null;
	  hintRegion = null;
	  moveCount += 1;
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
	  activeTemplateDrag = null;
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
	  activeTemplateDrag = null;
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
	    startRotationAnimation(index, 90);
	  } else {
	    selectedTemplateIndex = index;
	  }
	  hoverPosition = null;
	  onTemplateSelect?.(index);
	}

	function updateHoverFromClientPoint(clientX: number, clientY: number) {
	  const cell = colorSquareRef?.resolveCellAtClientPoint(clientX, clientY);
	  if (cell) {
	    handleCellHover(cell[0], cell[1]);
	  } else {
	    hoverPosition = null;
	  }
	}

	function processTemplatePointerMove(e: PointerEvent) {
	  const drag = activeTemplateDrag;
	  if (!drag || drag.pointerId !== e.pointerId) return;

	  const dx = e.clientX - drag.startX;
	  const dy = e.clientY - drag.startY;
	  let next = { ...drag, clientX: e.clientX, clientY: e.clientY };

	  if (!next.isDragging && dx * dx + dy * dy >= DRAG_THRESHOLD_PX ** 2) {
	    next = { ...next, isDragging: true };
	    selectedTemplateIndex = next.templateIndex;
	    onTemplateSelect?.(next.templateIndex);
	  }

	  activeTemplateDrag = next;

	  if (next.isDragging) {
	    e.preventDefault();
	    updateHoverFromClientPoint(e.clientX, e.clientY);
	  }
	}

	function finishTemplateDrag(e: PointerEvent) {
	  const drag = activeTemplateDrag;
	  if (!drag || drag.pointerId !== e.pointerId) return;

	  const wasDragging = drag.isDragging;
	  const index = drag.templateIndex;
	  activeTemplateDrag = null;

	  if (drag.captureTarget?.hasPointerCapture(e.pointerId)) {
	    drag.captureTarget.releasePointerCapture(e.pointerId);
	  }

	  if (wasDragging) {
	    if (hoverPosition !== null) {
	      applyAt(index, hoverPosition[0], hoverPosition[1]);
	    } else {
	      hoverPosition = null;
	    }
	    return;
	  }

	  handleTemplateTap(index);
	}

	function handleTemplatePointerDown(index: number, e: PointerEvent) {
	  if (animatingTemplateIndex !== null || isSolved || e.button !== 0) return;
	  const target = e.currentTarget as HTMLElement;
	  activeTemplateDrag = {
	    templateIndex: index,
	    pointerId: e.pointerId,
	    startX: e.clientX,
	    startY: e.clientY,
	    clientX: e.clientX,
	    clientY: e.clientY,
	    isDragging: false,
	    rotationSteps: getPreviewRotation(index),
	    captureTarget: target
	  };
	  target.setPointerCapture(e.pointerId);
	}

	function handleTemplatePointerMove(index: number, e: PointerEvent) {
	  const drag = activeTemplateDrag;
	  if (!drag || drag.templateIndex !== index || drag.pointerId !== e.pointerId) return;
	  processTemplatePointerMove(e);
	}

	function handleTemplatePointerUp(index: number, e: PointerEvent) {
	  const drag = activeTemplateDrag;
	  if (!drag || drag.templateIndex !== index || drag.pointerId !== e.pointerId) return;
	  finishTemplateDrag(e);
	}

	function handleTemplatePointerCancel(index: number, e: PointerEvent) {
	  if (activeTemplateDrag?.templateIndex !== index) return;
	  if (activeTemplateDrag.pointerId !== e.pointerId) return;
	  activeTemplateDrag = null;
	  hoverPosition = null;
	}

	$effect(() => {
	  if (!activeTemplateDrag?.isDragging) return;

	  function onDocPointerMove(e: PointerEvent) {
	    processTemplatePointerMove(e);
	  }

	  function onDocPointerEnd(e: PointerEvent) {
	    finishTemplateDrag(e);
	  }

	  document.addEventListener('pointermove', onDocPointerMove, { passive: false });
	  document.addEventListener('pointerup', onDocPointerEnd);
	  document.addEventListener('pointercancel', onDocPointerEnd);

	  return () => {
	    document.removeEventListener('pointermove', onDocPointerMove);
	    document.removeEventListener('pointerup', onDocPointerEnd);
	    document.removeEventListener('pointercancel', onDocPointerEnd);
	  };
	});

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

	  if (rotationSteps === 0) {
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
	      const oriented = getOrientedTemplateForPreview(selectedTemplateIndex);
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
	    const t = getOrientedTemplateForPreview(selectedTemplateIndex);
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
{#key `${packSlug ?? ''}:${puzzleId ?? ''}`}
<PuzzleShell
	moveCount={moveCount}
	isSolved={isSolved}
	par={puzzleConfig.minMovesToSolve ?? null}
	canUndo={history.length > 0}
	onUndo={handleUndo}
	onReset={resetPuzzle}
	onNextPuzzle={onNextPuzzle}
	onHint={showHints ? handleHint : undefined}
	{packSlug}
	{packName}
	{puzzleId}
	showColorGuide={!monochromeFlip}
	{autoOpenHowTo}
	enableShareAndRating={true}
	prismLightGrid={monochromeFlip ? null : renderState}
	prismLightCellSize={cellSize}
	prismLightMonochrome={monochromeFlip}
>
	<svelte:fragment slot="grid">
		<ColorSquare
			bind:this={colorSquareRef}
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
			class="templates-area"
			style:min-height="{templateAreaHeight}px"
		>
			{#each templateIndexRowGroups as rowIndices}
				<div class="templates-row">
					{#each rowIndices as index}
						{@const template = puzzleConfig.templates[index]}
						{@const isSelected = selectedTemplateIndex === index}
						{@const isAnimating = animatingTemplateIndex === index}
						{@const committedRotateDeg = (templateRotations[index] ?? 0) * 90}
						{@const totalRotateDeg = committedRotateDeg + (isAnimating ? animatingDeg : 0)}
						{@const boundDim = getTemplateBoundDim(template.shape)}
						{@const baseBound = getTemplateBoundSize(boundDim, TEMPLATE_RENDER_CELL)}
						{@const displayBound = baseBound * templateScale}
						<LensChrome
							variant="housing"
							selected={isSelected}
							dragging={activeTemplateDrag?.templateIndex === index && activeTemplateDrag.isDragging}
							class="template-item"
							role="button"
							tabindex="0"
							aria-label="Template {index + 1}{isSelected ? ' (selected)' : ''}"
							data-testid="template-{index}"
							onpointerdown={(e) => handleTemplatePointerDown(index, e)}
							onpointermove={(e) => handleTemplatePointerMove(index, e)}
							onpointerup={(e) => handleTemplatePointerUp(index, e)}
							onpointercancel={(e) => handleTemplatePointerCancel(index, e)}
							onkeydown={(e) => e.key === 'Enter' && handleTemplateTap(index)}
						>
							<div
								class="template-scale-slot"
								class:shape-hidden={activeTemplateDrag?.templateIndex === index && activeTemplateDrag.isDragging}
								style:width="{displayBound}px"
								style:height="{displayBound}px"
							>
								<div
									class="template-rotate-wrapper"
									class:animating={isAnimating}
									style:width="{baseBound}px"
									style:height="{baseBound}px"
									style:--rotate-duration="{animatingDurationMs}ms"
									style:transform={totalRotateDeg !== 0
									  ? `rotate(${totalRotateDeg}deg) scale(${templateScale})`
									  : `scale(${templateScale})`}
									style:transform-origin="center center"
									ontransitionend={(e) => handleRotateTransitionEnd(index, e)}
								>
									<TemplateLensPreview
										{template}
										cellSize={TEMPLATE_RENDER_CELL}
										cellGap={TEMPLATE_CELL_GAP}
										{monochromeFlip}
										{showColor}
										{showLines}
									/>
								</div>
							</div>
						</LensChrome>
					{/each}
				</div>
			{/each}
		</div>
	</svelte:fragment>

</PuzzleShell>
{/key}
</div>

{#if dragGhost}
	<TemplateDragGhost
		clientX={dragGhost.clientX}
		clientY={dragGhost.clientY}
		template={puzzleConfig.templates[dragGhost.templateIndex]}
		rotationSteps={dragGhost.rotationSteps}
		boundPx={dragGhost.boundPx}
		{monochromeFlip}
		{showColor}
		{showLines}
	/>
{/if}

<style>
	.puzzle-layout-root {
		flex: 1 1 0;
		width: 100%;
		min-height: 0;
		height: 100%;
		display: flex;
		flex-direction: column;
		align-items: stretch;
		justify-content: flex-start;
		overflow-x: visible;
		overflow-y: hidden;
	}

	.templates-divider {
		height: 1px;
		flex-shrink: 0;
		background: linear-gradient(
			90deg,
			transparent,
			rgba(255, 255, 255, 0.7) 20%,
			rgba(209, 213, 219, 0.5) 50%,
			rgba(255, 255, 255, 0.7) 80%,
			transparent
		);
		margin: 0.35rem 0;
		border: none;
		width: 100%;
	}

	.templates-area {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		flex-shrink: 0;
		gap: 0.5rem;
		width: 100%;
		max-width: 100%;
		box-sizing: border-box;
		overflow-x: auto;
		overflow-y: visible;
		-webkit-overflow-scrolling: touch;
		scrollbar-width: none;
	}

	.templates-area::-webkit-scrollbar {
		display: none;
	}

	.templates-row {
		display: flex;
		flex-wrap: nowrap;
		align-items: center;
		justify-content: center;
		flex-shrink: 0;
		gap: 0.75rem;
		width: max-content;
		max-width: none;
	}

	:global(.lens-housing.template-item) {
		cursor: pointer;
		touch-action: none;
	}

	.template-scale-slot {
		display: flex;
		align-items: center;
		justify-content: center;
		flex-shrink: 0;
		overflow: visible;
		position: relative;
		z-index: 1;
	}

	.template-scale-slot.shape-hidden {
		visibility: hidden;
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
</style>
