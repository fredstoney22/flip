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
/** Gap between template cards in a row (matches .templates-row gap: 0.5rem). */
export const TEMPLATE_ITEM_GAP = 8;
/** Gap between template rows (matches .templates-area gap). */
export const TEMPLATE_ROW_GAP = 8;
/** Move counter + divider + action bar + vertical gaps in PuzzleShell. */
export const SHELL_CHROME_MOBILE = 108;
export const SHELL_CHROME_DESKTOP = 124;

/** Total pixel width of template cards in a single row. */
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

/** Max cell size so every template in a row fits without horizontal scroll. */
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

/** Split `count` items across `rowCount` rows as evenly as possible. */
export function distributeToRows(count: number, rowCount: number): number[] {
  if (count <= 0 || rowCount <= 0) return [];
  const rows = Math.min(rowCount, count);
  const base = Math.floor(count / rows);
  const remainder = count % rows;
  const result: number[] = [];
  for (let i = 0; i < rows; i++) {
    result.push(base + (i < remainder ? 1 : 0));
  }
  return result;
}

/** Group template bound dims into rows for layout. */
export function getTemplateRowGroups(
  templateBoundDims: number[],
  rowCount: number
): number[][] {
  const counts = distributeToRows(templateBoundDims.length, rowCount);
  const groups: number[][] = [];
  let offset = 0;
  for (const c of counts) {
    groups.push(templateBoundDims.slice(offset, offset + c));
    offset += c;
  }
  return groups;
}

/** Group template indices into rows (for rendering). */
export function getTemplateIndexRowGroups(
  templateCount: number,
  rowCount: number
): number[][] {
  const counts = distributeToRows(templateCount, rowCount);
  const groups: number[][] = [];
  let offset = 0;
  for (const c of counts) {
    const row: number[] = [];
    for (let i = 0; i < c; i++) row.push(offset + i);
    groups.push(row);
    offset += c;
  }
  return groups;
}

function estimateTemplateAreaHeight(
  templateRowGroups: number[][],
  squareSize: number
): number {
  if (templateRowGroups.length === 0) return 0;

  const rowHeights = templateRowGroups.map((group) => {
    const maxDim = Math.max(1, ...group);
    return templatePixelSize(maxDim, squareSize) + TEMPLATE_ITEM_CHROME;
  });

  const rowGaps = Math.max(0, rowHeights.length - 1) * TEMPLATE_ROW_GAP;
  return rowHeights.reduce((sum, h) => sum + h, 0) + rowGaps + 8;
}

function templateSquareSizeForRowGroups(
  templateRowGroups: number[][],
  availableWidth: number
): number {
  if (templateRowGroups.length === 0) return 0;
  const perRow = templateRowGroups.map((group) =>
    templateSquareSizeForRow(group, availableWidth)
  );
  return Math.min(...perRow);
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
	/** Reserved height for the template area — use for stable layout. */
	templateAreaHeight: number;
	/** Number of template rows (1 = single horizontal strip). */
	templateRowCount: number;
	/** Template indices grouped per row for rendering. */
	templateIndexRowGroups: number[][];
}

export function measureTemplateAreaHeight(
  maxTemplateDim: number,
  templateCount: number,
  availableWidth: number,
  squareSize: number
): number {
  const groups = getTemplateRowGroups(
    Array.from({ length: templateCount }, () => maxTemplateDim),
    1
  );
  return estimateTemplateAreaHeight(groups, squareSize);
}

interface LayoutCandidate {
  cellSize: number;
  templateSquareSize: number;
  templateAreaHeight: number;
  templateRowCount: number;
  templateIndexRowGroups: number[][];
}

function computeLayoutForRowCount(
  input: PuzzleLayoutInput,
  rowCount: number,
  shellChrome: number,
  minCellSize: number,
  maxCellSize: number,
  minTemplateSquare: number,
  maxTemplateSquare: number
): LayoutCandidate {
  const { rows, cols, templateBoundDims, templateCount, availableWidth, availableHeight } =
    input;

  const templateRowGroups = getTemplateRowGroups(templateBoundDims, rowCount);
  const templateIndexRowGroups = getTemplateIndexRowGroups(templateCount, rowCount);

  const contentHeight = Math.max(80, availableHeight - shellChrome);
  const contentWidth = availableWidth;

  let templateSquareSize = clamp(
    minTemplateSquare,
    maxTemplateSquare,
    templateSquareSizeForRowGroups(templateRowGroups, contentWidth)
  );

  let templateHeight = estimateTemplateAreaHeight(templateRowGroups, templateSquareSize);

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
    templateHeight = estimateTemplateAreaHeight(templateRowGroups, templateSquareSize);
    const totalH = gridH + templateHeight + shellChrome;

    const rowWidths = templateRowGroups.map((group) =>
      templateRowPixelWidth(group, templateSquareSize)
    );
    const maxRowWidth = Math.max(0, ...rowWidths);

    if (totalH <= availableHeight && gridW <= contentWidth && maxRowWidth <= contentWidth) {
      break;
    }

    if (gridW > contentWidth && cellSize > minCellSize) {
      cellSize--;
      continue;
    }

    if (maxRowWidth > contentWidth && templateSquareSize > minTemplateSquare) {
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
  const rowWidths = templateRowGroups.map((group) =>
    templateRowPixelWidth(group, finalTemplateSquare)
  );
  const maxRowWidth = Math.max(0, ...rowWidths);
  const effectiveTemplateSquare =
    maxRowWidth > contentWidth && maxRowWidth > 0
      ? Math.max(1, Math.floor(finalTemplateSquare * (contentWidth / maxRowWidth)))
      : finalTemplateSquare;

  const templateAreaHeight = estimateTemplateAreaHeight(
    templateRowGroups,
    effectiveTemplateSquare
  );

  return {
    cellSize: Math.max(minCellSize, cellSize),
    templateSquareSize: effectiveTemplateSquare,
    templateAreaHeight,
    templateRowCount: rowCount,
    templateIndexRowGroups
  };
}

/**
 * Computes puzzle grid and template preview sizes so both fit in the available area.
 * Picks the best template row count (1–3) to maximize grid cell size.
 */
export function computePuzzleLayout(input: PuzzleLayoutInput): PuzzleLayout {
  const {
    rows,
    cols,
    templateCount,
    availableWidth,
    availableHeight,
    isMobile
  } = input;

  const fallbackRowGroups = getTemplateIndexRowGroups(templateCount, 1);
  const fallback = {
    cellSize: isMobile ? 28 : 40,
    templateSquareSize: isMobile ? 20 : 30,
    templateAreaHeight: isMobile ? 120 : 140,
    templateRowCount: 1,
    templateIndexRowGroups: fallbackRowGroups
  };

  if (availableWidth <= 0 || availableHeight <= 0 || rows <= 0 || cols <= 0) {
    return fallback;
  }

  const shellChrome = isMobile ? SHELL_CHROME_MOBILE : SHELL_CHROME_DESKTOP;
  const maxGridDim = Math.max(rows, cols);
  const minCellSize = Math.max(6, Math.min(14, Math.floor(260 / maxGridDim)));
  const maxCellSize = isMobile ? 48 : 80;
  const minTemplateSquare = 5;
  const maxTemplateSquare = isMobile ? 36 : 48;

  const maxRowCount = Math.min(templateCount, isMobile ? 3 : 4);
  let best: LayoutCandidate | null = null;

  for (let rowCount = 1; rowCount <= maxRowCount; rowCount++) {
    const candidate = computeLayoutForRowCount(
      input,
      rowCount,
      shellChrome,
      minCellSize,
      maxCellSize,
      minTemplateSquare,
      maxTemplateSquare
    );

    if (!best || candidate.cellSize > best.cellSize) {
      best = candidate;
    } else if (
      candidate.cellSize === best.cellSize &&
      candidate.templateSquareSize > best.templateSquareSize
    ) {
      best = candidate;
    }
  }

  return best ?? fallback;
}
