/** Shared layout constants — keep in sync with ColorSquare grid chrome. */
export const GRID_CELL_GAP = 2;
export const GRID_PADDING = 4;
export const TEMPLATE_CELL_GAP = 2;

/** Outer pixel size of a square grid (cells + gaps + padding). */
export function gridPixelSize(dim: number, cellSize: number): number {
  if (dim <= 0) return 0;
  return dim * cellSize + (dim - 1) * GRID_CELL_GAP + 2 * GRID_PADDING;
}

/** Max cell size that fits `dim` cells in `available` pixels. */
export function cellSizeForDimension(dim: number, available: number): number {
  if (dim <= 0 || available <= 0) return 0;
  const chrome = (dim - 1) * GRID_CELL_GAP + 2 * GRID_PADDING;
  return Math.floor((available - chrome) / dim);
}

/** Outer pixel size of a template preview (cells + gaps, no extra padding). */
export function templatePixelSize(boundDim: number, squareSize: number): number {
  if (boundDim <= 0) return 0;
  return boundDim * squareSize + (boundDim - 1) * TEMPLATE_CELL_GAP;
}

export function templateSquareSizeForDimension(boundDim: number, available: number): number {
  if (boundDim <= 0 || available <= 0) return 0;
  const chrome = (boundDim - 1) * TEMPLATE_CELL_GAP;
  return Math.floor((available - chrome) / boundDim);
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

/** Template card padding + border (matches .template-item in Puzzle.svelte). */
export const TEMPLATE_ITEM_CHROME = 20;
/** Gap between template cards in the templates row (matches .templates-grid gap: 0.5rem). */
export const TEMPLATE_ITEM_GAP = 8;

/** Total pixel width of all template cards in a single row. */
export function templateRowPixelWidth(
  templateBoundDims: number[],
  squareSize: number,
  itemChrome = TEMPLATE_ITEM_CHROME,
  gap = TEMPLATE_ITEM_GAP
): number {
  if (templateBoundDims.length === 0) return 0;
  const items = templateBoundDims.reduce(
    (sum, dim) => sum + templatePixelSize(dim, squareSize) + itemChrome,
    0
  );
  return items + Math.max(0, templateBoundDims.length - 1) * gap;
}

/** Max cell size so every template fits in one row without horizontal scroll. */
export function templateSquareSizeForRow(
  templateBoundDims: number[],
  availableWidth: number,
  itemChrome = TEMPLATE_ITEM_CHROME,
  gap = TEMPLATE_ITEM_GAP
): number {
  if (templateBoundDims.length === 0 || availableWidth <= 0) return 0;

  const gaps = Math.max(0, templateBoundDims.length - 1) * gap;
  const chrome = templateBoundDims.length * itemChrome;
  const remaining = availableWidth - gaps - chrome;
  if (remaining <= 0) return 0;

  const dimSum = templateBoundDims.reduce((sum, dim) => sum + dim, 0);
  const cellGapSum = templateBoundDims.reduce(
    (sum, dim) => sum + (dim - 1) * TEMPLATE_CELL_GAP,
    0
  );
  if (dimSum <= 0) return 0;

  return Math.floor((remaining - cellGapSum) / dimSum);
}

function estimateTemplateAreaHeight(
  maxTemplateDim: number,
  _templateCount: number,
  _availableWidth: number,
  squareSize: number
): number {
  // Templates render in a single horizontal row — all must fit without scrolling.
  return templatePixelSize(maxTemplateDim, squareSize) + TEMPLATE_ITEM_CHROME + 12;
}

export interface PuzzleLayoutInput {
	rows: number;
	cols: number;
	templateBoundDims: number[];
	templateCount: number;
	availableWidth: number;
	availableHeight: number;
	isMobile: boolean;
}

export interface PuzzleLayout {
	cellSize: number;
	templateSquareSize: number;
	/** Reserved height for the template row — use for stable layout. */
	templateAreaHeight: number;
}

export function measureTemplateAreaHeight(
  maxTemplateDim: number,
  templateCount: number,
  availableWidth: number,
  squareSize: number
): number {
  return estimateTemplateAreaHeight(maxTemplateDim, templateCount, availableWidth, squareSize);
}

/**
 * Computes puzzle grid and template preview sizes so both fit in the available area.
 * Accounts for cell gaps, padding, and fitting all templates in one row without scrolling.
 */
export function computePuzzleLayout(input: PuzzleLayoutInput): PuzzleLayout {
  const {
    rows,
    cols,
    templateBoundDims,
    templateCount,
    availableWidth,
    availableHeight,
    isMobile
  } = input;

  const fallback = {
    cellSize: isMobile ? 28 : 40,
    templateSquareSize: isMobile ? 20 : 30,
    templateAreaHeight: isMobile ? 120 : 140
  };
  if (availableWidth <= 0 || availableHeight <= 0 || rows <= 0 || cols <= 0) {
    return fallback;
  }

  const maxTemplateDim = Math.max(1, ...templateBoundDims);
  const maxGridDim = Math.max(rows, cols);

  const shellChrome = isMobile ? 92 : 112;
  const minCellSize = Math.max(6, Math.min(14, Math.floor(260 / maxGridDim)));
  const maxCellSize = isMobile ? 44 : 72;
  const minTemplateSquare = 5;
  const maxTemplateSquare = isMobile ? 32 : 44;

  const contentHeight = Math.max(80, availableHeight - shellChrome);
  const contentWidth = availableWidth;

  let templateSquareSize = clamp(
    minTemplateSquare,
    maxTemplateSquare,
    templateSquareSizeForRow(templateBoundDims, contentWidth)
  );

  let templateHeight = estimateTemplateAreaHeight(
    maxTemplateDim,
    templateCount,
    contentWidth,
    templateSquareSize
  );

  let cellSize = clamp(
    minCellSize,
    maxCellSize,
    Math.min(
      cellSizeForDimension(cols, contentWidth),
      cellSizeForDimension(rows, Math.max(minCellSize, contentHeight - templateHeight))
    )
  );

  for (let i = 0; i < 300; i++) {
    const gridW = gridPixelSize(cols, cellSize);
    const gridH = gridPixelSize(rows, cellSize);
    templateHeight = estimateTemplateAreaHeight(
      maxTemplateDim,
      templateCount,
      contentWidth,
      templateSquareSize
    );
    const totalH = gridH + templateHeight + shellChrome;
    const templateW = templateRowPixelWidth(templateBoundDims, templateSquareSize);

    if (totalH <= availableHeight && gridW <= contentWidth && templateW <= contentWidth) {
      break;
    }

    if (gridW > contentWidth && cellSize > minCellSize) {
      cellSize--;
      continue;
    }

    if (templateW > contentWidth && templateSquareSize > minTemplateSquare) {
      templateSquareSize--;
      continue;
    }

    if (totalH > availableHeight) {
      if (cellSize > minCellSize && gridH > contentHeight - templateHeight) {
        cellSize--;
        continue;
      }
      if (templateSquareSize > minTemplateSquare) {
        templateSquareSize--;
        continue;
      }
      if (cellSize > minCellSize) {
        cellSize--;
        continue;
      }
    }

    break;
  }

  const finalTemplateSquare = Math.max(minTemplateSquare, templateSquareSize);
  const finalRowWidth = templateRowPixelWidth(templateBoundDims, finalTemplateSquare);
  const effectiveTemplateSquare =
		finalRowWidth > contentWidth && finalRowWidth > 0
		  ? Math.max(1, Math.floor(finalTemplateSquare * (contentWidth / finalRowWidth)))
		  : finalTemplateSquare;
  const templateAreaHeight = estimateTemplateAreaHeight(
    maxTemplateDim,
    templateCount,
    contentWidth,
    effectiveTemplateSquare
  );

  return {
    cellSize: Math.max(minCellSize, cellSize),
    templateSquareSize: effectiveTemplateSquare,
    templateAreaHeight
  };
}
