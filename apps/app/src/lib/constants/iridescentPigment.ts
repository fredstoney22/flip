import type { Pigment } from '@flip/game';

/** Pigment value when red, yellow, and blue combine (all RYB bits set). */
export const IRIDESCENT_PIGMENT: Pigment = 7;

export function isIridescentPigment(cell: Pigment): boolean {
  return cell === IRIDESCENT_PIGMENT;
}

export interface IridescentSheetSize {
	width: number;
	height: number;
}

export interface PrismCellPosition {
	row: number;
	col: number;
}

export interface GapCoverRect {
	top: number;
	left: number;
	width: number;
	height: number;
}

/** Opaque bars that sit in flex gaps so foil cannot bleed into gutters. */
export function iridescentGapCoverRects(
  rows: number,
  cols: number,
  originTop: number,
  originLeft: number,
  cellSize: number,
  cellGap: number
): GapCoverRect[] {
  if (rows <= 0 || cols <= 0 || cellGap <= 0) return [];

  const step = cellSize + cellGap;
  const rowSpanWidth = cols * cellSize + Math.max(0, cols - 1) * cellGap;
  const rects: GapCoverRect[] = [];

  for (let row = 0; row < rows - 1; row++) {
    rects.push({
      top: originTop + (row + 1) * cellSize + row * cellGap,
      left: originLeft,
      width: rowSpanWidth,
      height: cellGap
    });
  }

  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols - 1; col++) {
      rects.push({
        top: originTop + row * step,
        left: originLeft + (col + 1) * cellSize + col * cellGap,
        width: cellGap,
        height: cellSize
      });
    }
  }

  return rects;
}

/** SVG mask so foil only paints inside prism cell rects (gaps stay grid gray). */
export function iridescentSheetMaskImage(
  prismCells: PrismCellPosition[],
  sheetWidth: number,
  sheetHeight: number,
  cellSize: number,
  cellGap: number
): string | undefined {
  if (prismCells.length === 0 || sheetWidth <= 0 || sheetHeight <= 0) return undefined;

  const step = cellSize + cellGap;
  const rects = prismCells
    .map(
      ({ row, col }) =>
        `<rect x="${col * step}" y="${row * step}" width="${cellSize}" height="${cellSize}" fill="white"/>`
    )
    .join('');
  const svg =
		`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${sheetWidth} ${sheetHeight}">` +
		`<rect width="100%" height="100%" fill="black"/>${rects}</svg>`;

  return `url("data:image/svg+xml,${encodeURIComponent(svg)}")`;
}

/** Pixel size of the shared holographic sheet covering a cell grid. */
export function iridescentSheetSize(
  rows: number,
  cols: number,
  cellSize: number,
  cellGap: number
): IridescentSheetSize {
  const width = cols > 0 ? cols * cellSize + Math.max(0, cols - 1) * cellGap : 0;
  const height = rows > 0 ? rows * cellSize + Math.max(0, rows - 1) * cellGap : 0;
  return { width, height };
}

/** CSS custom properties for sheet dimensions (optional; width/height also set inline). */
export function iridescentSheetStyle(
  rows: number,
  cols: number,
  cellSize: number,
  cellGap: number
): Record<string, string> {
  const sheet = iridescentSheetSize(rows, cols, cellSize, cellGap);
  return {
    width: `${sheet.width}px`,
    height: `${sheet.height}px`
  };
}

/** @deprecated Per-cell window — use a single grid sheet instead. */
export function iridescentCellStyle(
  row: number,
  col: number,
  rows: number,
  cols: number,
  cellSize: number,
  cellGap: number
): Record<string, string> {
  const step = cellSize + cellGap;
  const sheet = iridescentSheetSize(rows, cols, cellSize, cellGap);
  return {
    '--iri-sheet-w': `${sheet.width}px`,
    '--iri-sheet-h': `${sheet.height}px`,
    '--iri-offset-x': `${-col * step}px`,
    '--iri-offset-y': `${-row * step}px`
  };
}
