<script lang="ts">
	import { onMount } from 'svelte';
	import PuzzleShell from './PuzzleShell.svelte';
	import Square9x9 from './Square9x9.svelte';
	import ColorSquare from './ColorSquare.svelte';
	import { settings } from '$lib/stores/settings';
	import {
	  rotateRight,
	  applyColorTemplate,
	  PIGMENT_HEX,
	  PIGMENT_NAME,
	  findHintMove
	} from '@flip/game';
	import type { PuzzleConfig, ColorPuzzleConfig, ColorGrid, Pigment } from '@flip/game';

	// Binary is a subset of color: one pigment (1). Same XOR apply; solved = all 1 vs color all 0.
	const SOLVED_BINARY = 1;
	const SOLVED_COLOR = 0;

	/** One solve check for both modes: solved when every cell equals target (1 = binary, 0 = color). */
	function isPuzzleSolved(state: number[][], solvedValue: number): boolean {
		return state.length > 0 && state.every((r) => r.every((c) => c === solvedValue));
	}

	/** One apply for both: color apply with shape + pigment. Binary uses pigment 1 (flip 0↔1). */
	function applyAtPosition(
		state: ColorGrid,
		shape: number[][],
		pigment: Pigment,
		row: number,
		col: number
	): ColorGrid {
		return applyColorTemplate(state, { shape, pigment }, row, col);
	}

	// Tile appearance for color template previews (R=H, Y=V, B=D)
	let tileMode = $state<'color' | 'lines' | 'colorAndLines'>('colorAndLines');
	onMount(() => settings.subscribe((s) => (tileMode = s.tileAppearanceMode)));
	const showColor = $derived(tileMode === 'color' || tileMode === 'colorAndLines');
	const showLines = $derived(tileMode === 'lines' || tileMode === 'colorAndLines');
	function lineFlags(pigment: Pigment) {
	  return { h: (pigment & 1) !== 0, v: (pigment & 2) !== 0, d: (pigment & 4) !== 0 };
	}

	type Mode = 'binary' | 'color';

	interface Props {
		mode: Mode;
		puzzleConfig?: PuzzleConfig;
		colorConfig?: ColorPuzzleConfig | null;
		packSlug?: string;
		packName?: string;
		puzzleId?: number | null;
		bestMoveCount?: number | null;
		onSolve?: (data: { packSlug: string; puzzleId: number; moveCount: number }) => void;
		onNextPuzzle?: () => void;
	}

	let {
	  mode,
	  puzzleConfig,
	  colorConfig,
	  packSlug,
	  packName,
	  puzzleId,
	  bestMoveCount = null,
	  onSolve,
	  onNextPuzzle
	}: Props = $props();

	const MAX_HISTORY = 20;

	const isColorMode = $derived(mode === 'color');

	// ——— Shared logic (same code path for both modes) ———

	/** Snap to nearest valid placement: one implementation for binary and color. */
	function getSnapToCenterPosition(
	  templateRows: number,
	  templateCols: number,
	  gridRows: number,
	  gridCols: number,
	  hoverRow: number,
	  hoverCol: number
	): [number, number] | null {
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

	/** Rotate shape by 90° clockwise n times. */
	function getRotatedShape(shape: number[][], rotationCount: number): number[][] {
	  let out = shape.map((r) => [...r]);
	  for (let i = 0; i < rotationCount; i++) out = rotateRight(out);
	  return out;
	}

	function rotateTemplateAt(rotations: number[], index: number): number[] {
	  const next = [...rotations];
	  next[index] = (next[index] + 1) % 4;
	  return next;
	}

	/** Template tap: same behavior for both modes. */
	function getTemplateTapResult(
	  index: number,
	  selectedIndex: number | null,
	  rotations: number[]
	): { selectedIndex: number | null; rotations: number[] } {
	  if (selectedIndex === index) {
	    return { selectedIndex, rotations: rotateTemplateAt(rotations, index) };
	  }
	  return { selectedIndex: index, rotations };
	}

	function performUndo<T>(history: T[], moveCount: number): { history: T[]; state: T; moveCount: number } | null {
	  if (history.length === 0) return null;
	  const state = history[history.length - 1] as T;
	  return {
	    history: history.slice(0, -1),
	    state,
	    moveCount: Math.max(0, moveCount - 1)
	  };
	}

	// Binary puzzle state
	let binaryState = $state<number[][]>([]);
	let binarySelectedTemplateIndex = $state<number | null>(null);
	let binaryTemplateRotations = $state<number[]>([]);
	let binaryAnimatingTemplateIndex = $state<number | null>(null);
	let binaryAnimatingDeg = $state(0);
	const ROTATE_DURATION_MS = 280;
	let binaryRotationCommitTimeout: ReturnType<typeof setTimeout> | null = null;
	let binaryIsSolved = $state(false);
	let binaryMoveCount = $state(0);
	let binaryHistory = $state<number[][][]>([]);
	let binaryHoverPosition = $state<[number, number] | null>(null);
	let binaryHintRegion = $state<{ row: number; col: number; w: number; h: number } | null>(null);
	let binarySquareSize = $state(50);
	let binaryTemplateSquareSize = $state(30);

	// Color puzzle state
	let colorState = $state<ColorGrid>([]);
	let colorSelectedTemplateIndex = $state<number | null>(null);
	let colorTemplateRotations = $state<number[]>([]);
	let colorIsSolved = $state(false);
	let colorMoveCount = $state(0);
	let colorHistory = $state<ColorGrid[]>([]);
	let colorHoverPosition = $state<[number, number] | null>(null);
	let colorCellSize = $state(52);

	// Reset when configs or mode change
	$effect(() => {
	  if (isColorMode) {
	    const cfg = colorConfig;
	    if (!cfg) return;
	    colorState = cfg.startState.map((r) => [...r]) as ColorGrid;
	    colorTemplateRotations = new Array(cfg.templates.length).fill(0);
	    colorSelectedTemplateIndex = null;
	    colorIsSolved = false;
	    colorMoveCount = 0;
	    colorHistory = [];
	    colorHoverPosition = null;
	  } else {
	    const cfg = puzzleConfig;
	    if (!cfg) return;
	    binaryState = cfg.startState.map((r) => [...r]);
	    binaryTemplateRotations = new Array(cfg.templates.length).fill(0);
	    binaryAnimatingTemplateIndex = null;
	    binaryAnimatingDeg = 0;
	    binarySelectedTemplateIndex = null;
	    binaryIsSolved = false;
	    binaryMoveCount = 0;
	    binaryHistory = [];
	    binaryHoverPosition = null;
	    binaryHintRegion = null;
	  }
	});

	// Win detection
	$effect(() => {
	  if (!isColorMode) {
	    if (!binaryIsSolved && isPuzzleSolved(binaryState, SOLVED_BINARY)) {
	      binaryIsSolved = true;
	      onSolve?.({
	        packSlug: packSlug ?? '',
	        puzzleId: puzzleId ?? 0,
	        moveCount: binaryMoveCount
	      });
	    }
	  } else {
	    if (!colorIsSolved && isPuzzleSolved(colorState, SOLVED_COLOR)) {
	      colorIsSolved = true;
	      onSolve?.({
	        packSlug: packSlug ?? '',
	        puzzleId: puzzleId ?? 0,
	        moveCount: colorMoveCount
	      });
	    }
	  }
	});

	// Shared sizing: same formula and result for both modes so the page looks identical
	function updateSizes() {
	  const isMobile = window.innerWidth <= 768;
	  const isDesktop = window.innerWidth >= 1200;
	  const maxSize = isMobile ? 40 : isDesktop ? 70 : 50;
	  const minSize = isMobile ? 20 : isDesktop ? 40 : 25;

	  const usedHeight =
			(isMobile ? 45 : 60) +
			(isMobile ? 35 : 50) +
			(isMobile ? 110 : isDesktop ? 180 : 150) +
			(isMobile ? 32 : 40) +
			(isMobile ? 16 : isDesktop ? 120 : 80);

	  const availableHeight = window.innerHeight - usedHeight;
	  const containerWidth = isDesktop ? 1200 : window.innerWidth;
	  const availableWidth = containerWidth - (isMobile ? 20 : isDesktop ? 80 : 40);

	  const cols = isColorMode ? (colorState[0]?.length ?? 3) : (binaryState[0]?.length ?? 3);
	  const rows = isColorMode ? colorState.length : binaryState.length;
	  const calculated = Math.min(
	    Math.floor(availableWidth / cols),
	    Math.floor(availableHeight / rows)
	  );
	  const cellSize = Math.max(minSize, Math.min(maxSize, calculated));
	  binarySquareSize = cellSize;
	  colorCellSize = cellSize;
	  binaryTemplateSquareSize = isMobile ? 20 : isDesktop ? 40 : 30;
	}

	onMount(() => {
	  updateSizes();
	  window.addEventListener('resize', updateSizes);
	  window.addEventListener('keydown', handleKeyDown);
	  return () => {
	    window.removeEventListener('resize', updateSizes);
	    window.removeEventListener('keydown', handleKeyDown);
	  };
	});

	function handleKeyDown(e: KeyboardEvent) {
	  if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
	    e.preventDefault();
	    if (isColorMode) {
	      handleColorUndo();
	    } else {
	      handleBinaryUndo();
	    }
	  }
	}

	// Binary helpers (delegate to shared logic)
	function getRotatedBinaryTemplate(index: number): number[][] {
	  if (!puzzleConfig) return [];
	  return getRotatedShape(puzzleConfig.templates[index], binaryTemplateRotations[index] ?? 0);
	}

	function getBinaryCenteredPosition(template: number[][], hoverRow: number, hoverCol: number): [number, number] | null {
	  return getSnapToCenterPosition(
	    template.length,
	    template[0]?.length ?? 0,
	    binaryState.length,
	    binaryState[0]?.length ?? 0,
	    hoverRow,
	    hoverCol
	  );
	}

	function applyBinaryTemplateToPuzzle(templateIndex: number, row: number, col: number) {
	  if (binaryIsSolved || !puzzleConfig) return;
	  const snapshot = binaryState.map((r) => [...r]);
	  binaryHistory = [...binaryHistory.slice(-(MAX_HISTORY - 1)), snapshot];
	  const rotated = getRotatedBinaryTemplate(templateIndex);
	  binaryState = applyAtPosition(binaryState as ColorGrid, rotated, 1, row, col) as number[][];
	  binaryHoverPosition = null;
	  binaryHintRegion = null;
	  binaryMoveCount += 1;
	  binarySelectedTemplateIndex = null;
	}

	function handleBinaryUndo() {
	  if (binaryIsSolved) return;
	  const result = performUndo(binaryHistory, binaryMoveCount);
	  if (!result) return;
	  binaryState = result.state.map((r: number[]) => [...r]);
	  binaryHistory = result.history;
	  binaryMoveCount = result.moveCount;
	  binarySelectedTemplateIndex = null;
	  binaryHoverPosition = null;
	  binaryHintRegion = null;
	}

	function resetBinaryPuzzle() {
	  if (!puzzleConfig) return;
	  binaryState = puzzleConfig.startState.map((r) => [...r]);
	  binaryTemplateRotations = new Array(puzzleConfig.templates.length).fill(0);
	  binarySelectedTemplateIndex = null;
	  binaryIsSolved = false;
	  binaryMoveCount = 0;
	  binaryHistory = [];
	  binaryHoverPosition = null;
	  binaryHintRegion = null;
	}

	function commitBinaryRotation(index: number) {
	  if (binaryRotationCommitTimeout !== null) {
	    clearTimeout(binaryRotationCommitTimeout);
	    binaryRotationCommitTimeout = null;
	  }
	  if (binaryAnimatingTemplateIndex !== index) return;
	  binaryTemplateRotations = rotateTemplateAt(binaryTemplateRotations, index);
	  binaryAnimatingTemplateIndex = null;
	  binaryAnimatingDeg = 0;
	}

	function handleBinaryRotateTransitionEnd(index: number, e: TransitionEvent) {
	  if (e.propertyName === 'transform' && binaryAnimatingTemplateIndex === index) {
	    commitBinaryRotation(index);
	  }
	}

	function handleBinaryTemplateTap(index: number) {
	  if (binarySelectedTemplateIndex === index) {
	    // Same template: rotate with animation
	    if (binaryAnimatingTemplateIndex !== null) return;
	    binaryAnimatingTemplateIndex = index;
	    binaryAnimatingDeg = 0;
	    requestAnimationFrame(() => {
	      requestAnimationFrame(() => {
	        binaryAnimatingDeg = 90;
	      });
	    });
	    if (binaryRotationCommitTimeout !== null) clearTimeout(binaryRotationCommitTimeout);
	    binaryRotationCommitTimeout = setTimeout(() => commitBinaryRotation(index), ROTATE_DURATION_MS);
	  } else {
	    binarySelectedTemplateIndex = index;
	  }
	  binaryHoverPosition = null;
	}

	function handleBinarySquareClick(row: number, col: number) {
	  if (binarySelectedTemplateIndex === null) return;
	  const template = getRotatedBinaryTemplate(binarySelectedTemplateIndex);
	  const pos = getBinaryCenteredPosition(template, row, col);
	  if (pos) applyBinaryTemplateToPuzzle(binarySelectedTemplateIndex, pos[0], pos[1]);
	}

	function handleBinarySquareHover(row: number, col: number) {
	  if (binarySelectedTemplateIndex === null) return;
	  const template = getRotatedBinaryTemplate(binarySelectedTemplateIndex);
	  binaryHoverPosition = getBinaryCenteredPosition(template, row, col);
	}

	function handleBinarySquareLeave() {
	  binaryHoverPosition = null;
	}

	const binaryRenderState = $derived(
	  binarySelectedTemplateIndex === null || !binaryHoverPosition
	    ? binaryState
	    : (() => {
	      const rotated = getRotatedBinaryTemplate(binarySelectedTemplateIndex);
	      return applyAtPosition(
	        binaryState as ColorGrid,
	        rotated,
	        1,
	        binaryHoverPosition[0],
	        binaryHoverPosition[1]
	      ) as number[][];
	    })()
	);

	function getHighlightFromHover(
	  hoverPos: [number, number] | null,
	  templateCols: number,
	  templateRows: number
	): { start: [number, number]; dim: [number, number] } | undefined {
	  if (!hoverPos) return undefined;
	  return { start: [hoverPos[1], hoverPos[0]], dim: [templateCols, templateRows] };
	}

	const binaryHighlight = $derived(
	  (() => {
	    if (binarySelectedTemplateIndex === null || !binaryHoverPosition) return undefined;
	    const t = getRotatedBinaryTemplate(binarySelectedTemplateIndex);
	    return getHighlightFromHover(binaryHoverPosition, t[0]?.length ?? 0, t.length);
	  })()
	);
	const binaryHighlightStart = $derived(binaryHighlight?.start);
	const binaryHighlightDim = $derived(binaryHighlight?.dim);

	const binaryHintHighlightStart = $derived(
	  binaryHintRegion ? ([binaryHintRegion.col, binaryHintRegion.row] as [number, number]) : undefined
	);
	const binaryHintHighlightDim = $derived(
	  binaryHintRegion ? ([binaryHintRegion.w, binaryHintRegion.h] as [number, number]) : undefined
	);

	function handleBinaryHint() {
	  if (binaryIsSolved || !puzzleConfig) return;

	  const base = puzzleConfig.minMovesToSolve ?? 6;
	  const maxDepth = Math.max(base + 2, 6);
	  const move = findHintMove(binaryState, puzzleConfig.templates, maxDepth);
	  if (!move) {
	    if (typeof window !== 'undefined') {
	      window.alert('No hint available from this position. Try undoing a move or resetting.');
	    }
	    return;
	  }

	  // Show hint: select template, set rotation, highlight where to place (do not apply).
	  binarySelectedTemplateIndex = move.templateIndex;
	  const rotations = [...binaryTemplateRotations];
	  rotations[move.templateIndex] = move.rotation;
	  binaryTemplateRotations = rotations;
	  let tpl = puzzleConfig.templates[move.templateIndex].map((r) => [...r]);
	  for (let i = 0; i < move.rotation; i++) {
	    tpl = rotateRight(tpl);
	  }
	  const w = tpl[0]?.length ?? 0;
	  const h = tpl.length;
	  binaryHintRegion = { row: move.row, col: move.col, w, h };
	  binaryHoverPosition = null;
	}

	// Color helpers (delegate to shared logic)
	function getColorCenteredPosition(template: { shape: number[][] }, hoverRow: number, hoverCol: number): [number, number] | null {
	  const sh = template.shape;
	  return getSnapToCenterPosition(
	    sh.length,
	    sh[0]?.length ?? 0,
	    colorState.length,
	    colorState[0]?.length ?? 0,
	    hoverRow,
	    hoverCol
	  );
	}

	function getRotatedColorTemplate(index: number) {
	  if (!colorConfig) return null;
	  const base = colorConfig.templates[index];
	  return { ...base, shape: getRotatedShape(base.shape, colorTemplateRotations[index] ?? 0) };
	}

	function handleColorTemplateTap(index: number) {
	  const { selectedIndex, rotations } = getTemplateTapResult(
	    index,
	    colorSelectedTemplateIndex,
	    colorTemplateRotations
	  );
	  colorSelectedTemplateIndex = selectedIndex;
	  colorTemplateRotations = rotations;
	  colorHoverPosition = null;
	}

	function handleColorCellClick(row: number, col: number) {
	  if (colorSelectedTemplateIndex === null || colorIsSolved || !colorConfig) return;
	  const template = getRotatedColorTemplate(colorSelectedTemplateIndex);
	  if (!template) return;
	  const pos = getColorCenteredPosition(template, row, col);
	  if (!pos) return;

	  const snapshot = colorState.map((r) => [...r]) as ColorGrid;
	  colorHistory = [...colorHistory.slice(-(MAX_HISTORY - 1)), snapshot];
	  colorState = applyAtPosition(colorState, template.shape, template.pigment, pos[0], pos[1]);
	  colorMoveCount += 1;
	  colorHoverPosition = null;
	}

	function handleColorCellHover(row: number, col: number) {
	  if (colorSelectedTemplateIndex === null || !colorConfig) return;
	  const template = getRotatedColorTemplate(colorSelectedTemplateIndex);
	  if (!template) return;
	  colorHoverPosition = getColorCenteredPosition(template, row, col);
	}

	function handleColorLeave() {
	  colorHoverPosition = null;
	}

	function handleColorUndo() {
	  if (colorIsSolved) return;
	  const result = performUndo(colorHistory, colorMoveCount);
	  if (!result) return;
	  colorState = (result.state as ColorGrid).map((r) => [...r]) as ColorGrid;
	  colorHistory = result.history as ColorGrid[];
	  colorMoveCount = result.moveCount;
	  colorSelectedTemplateIndex = null;
	  colorHoverPosition = null;
	}

	function resetColorPuzzle() {
	  if (!colorConfig) return;
	  colorState = colorConfig.startState.map((r) => [...r]) as ColorGrid;
	  colorTemplateRotations = new Array(colorConfig.templates.length).fill(0);
	  colorSelectedTemplateIndex = null;
	  colorIsSolved = false;
	  colorMoveCount = 0;
	  colorHistory = [];
	  colorHoverPosition = null;
	}

	const colorHighlight = $derived(
	  (() => {
	    if (colorSelectedTemplateIndex === null || !colorHoverPosition) return undefined;
	    const t = getRotatedColorTemplate(colorSelectedTemplateIndex);
	    if (!t) return undefined;
	    return getHighlightFromHover(colorHoverPosition, t.shape[0]?.length ?? 0, t.shape.length);
	  })()
	);
	const colorHighlightStart = $derived(colorHighlight?.start);
	const colorHighlightDim = $derived(colorHighlight?.dim);

	// Same as binary: hover preview = state after applying template at hover position (respects template shape).
	const colorRenderState = $derived(
	  colorSelectedTemplateIndex === null || !colorHoverPosition
	    ? colorState
	    : (() => {
	        const template = getRotatedColorTemplate(colorSelectedTemplateIndex);
	        if (!template) return colorState;
	        return applyAtPosition(
	          colorState,
	          template.shape,
	          template.pigment,
	          colorHoverPosition[0],
	          colorHoverPosition[1]
	        );
	      })()
	);

	// Shared view state
	const activeMoveCount = $derived(isColorMode ? colorMoveCount : binaryMoveCount);
	const activeIsSolved = $derived(isColorMode ? colorIsSolved : binaryIsSolved);
	const canUndo = $derived(
	  isColorMode ? colorHistory.length > 0 : binaryHistory.length > 0
	);

	const handleUndo = () => {
	  if (isColorMode) {
	    handleColorUndo();
	  } else {
	    handleBinaryUndo();
	  }
	};

	const handleReset = () => {
	  if (isColorMode) {
	    resetColorPuzzle();
	  } else {
	    resetBinaryPuzzle();
	  }
	};
</script>

<PuzzleShell
	moveCount={activeMoveCount}
	isSolved={activeIsSolved}
	bestMoveCount={isColorMode ? null : bestMoveCount}
	canUndo={canUndo}
	onUndo={handleUndo}
	onReset={handleReset}
	onNextPuzzle={isColorMode ? undefined : onNextPuzzle}
	onHint={isColorMode ? undefined : handleBinaryHint}
	packSlug={packSlug}
	packName={packName}
	puzzleId={puzzleId}
	enableShareAndRating={true}
>
	<svelte:fragment slot="grid">
		{#if isColorMode}
			<ColorSquare
				grid={colorRenderState}
				cellSize={colorCellSize}
				highlightStart={colorHighlightStart}
				highlightDim={colorHighlightDim}
				onCellClick={handleColorCellClick}
				onCellHover={handleColorCellHover}
				onLeave={handleColorLeave}
			/>
		{:else}
			<Square9x9
				square={binaryRenderState}
				squareSize={binarySquareSize}
				highlightStart={binaryHighlightStart}
				highlightDim={binaryHighlightDim}
				hintHighlightStart={binaryHintHighlightStart}
				hintHighlightDim={binaryHintHighlightDim}
				onSquareClick={handleBinarySquareClick}
				onSquareHover={handleBinarySquareHover}
				onSquareLeave={handleBinarySquareLeave}
				testIdPrefix="puzzle-square"
			/>
		{/if}
	</svelte:fragment>

	<svelte:fragment slot="templates">
		<div class="templates-divider" aria-hidden="true"></div>
		<div class="templates-grid">
		{#if isColorMode && colorConfig}
				{#each colorConfig.templates as template, index}
					{@const isSelected = colorSelectedTemplateIndex === index}
					{@const pigHex = PIGMENT_HEX[template.pigment]}
					{@const rotatedShape = getRotatedColorTemplate(index)?.shape ?? template.shape}
					<div
						class="template-item"
						class:selected={isSelected}
						role="button"
						tabindex="0"
						aria-label="Template {index + 1}{isSelected ? ' (selected)' : ''}"
						data-testid="template-{index}"
						onclick={() => handleColorTemplateTap(index)}
						onkeydown={(e) => e.key === 'Enter' && handleColorTemplateTap(index)}
					>
						<!-- Same as binary: only mini grid, same cell size; difference is fill color + optional lines -->
						<div class="template-item-shape template-item-shape-unified">
							{#each rotatedShape as shapeRow}
								<div class="template-item-shape-row">
									{#each shapeRow as cell}
										{@const filled = cell === 1}
										{@const lines = filled ? lineFlags(template.pigment) : { h: false, v: false, d: false }}
										<div
											class="template-item-shape-cell"
											class:filled
											class:with-lines={showLines && filled && (lines.h || lines.v || lines.d)}
											style:width="{binaryTemplateSquareSize}px"
											style:height="{binaryTemplateSquareSize}px"
											style:background={filled ? (showColor ? pigHex : '#e5e7eb') : '#f9fafb'}
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
				{/each}
		{:else if puzzleConfig}
			{#each puzzleConfig.templates as _, index}
				{@const rotated = getRotatedBinaryTemplate(index)}
				{@const isSelected = binarySelectedTemplateIndex === index}
				{@const isAnimating = binaryAnimatingTemplateIndex === index}
				<div
					class="template-item"
					class:selected={isSelected}
					role="button"
					tabindex="0"
					aria-label="Template {index + 1}{isSelected ? ' (selected)' : ''}"
					data-testid="template-{index}"
					onclick={() => handleBinaryTemplateTap(index)}
					onkeydown={(e) => e.key === 'Enter' && handleBinaryTemplateTap(index)}
				>
					<div
						class="template-rotate-wrapper"
						class:animating={isAnimating}
						style="transform: rotate({isAnimating ? binaryAnimatingDeg : 0}deg)"
						ontransitionend={(e) => handleBinaryRotateTransitionEnd(index, e)}
					>
						<Square9x9
							square={rotated}
							squareSize={binaryTemplateSquareSize}
							testIdPrefix="template-square"
						/>
					</div>
				</div>
			{/each}
		{/if}
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

	/* Same card for both binary and color templates so the experience looks identical */
	.template-item {
		position: relative;
		display: flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.5rem;
		border: 2px solid transparent;
		border-radius: 8px;
		cursor: pointer;
		transition: border-color 0.15s, box-shadow 0.15s;
		background: white;
		text-align: left;
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
		display: inline-block;
		transform-origin: center center;
	}

	.template-rotate-wrapper.animating {
		transition: transform 0.28s ease-out;
	}

	/* Template mini grid: same layout for binary and color (binary uses Square9x9, color uses this) */
	.template-item-shape-unified {
		display: flex;
		flex-direction: column;
		gap: 2px;
	}

	.template-item-shape-unified .template-item-shape-row {
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

	.template-item-shape-cell .template-line {
		position: absolute;
		background: #1f2937;
		border-radius: 1px;
	}

	.template-item-shape-cell .template-line-h {
		width: 65%;
		height: 2px;
	}

	.template-item-shape-cell .template-line-v {
		width: 2px;
		height: 65%;
	}

	.template-item-shape-cell .template-line-d {
		width: 90%;
		height: 2px;
		transform: rotate(-45deg);
	}
</style>

