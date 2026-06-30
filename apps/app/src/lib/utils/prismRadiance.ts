import { PIGMENT_HEX, type Pigment, type PuzzleGrid } from '@flip/game';

export interface PrismLightCell {
	row: number;
	col: number;
	color: string;
	angleDeg: number;
	reach: number;
	isCenter: boolean;
}

export function hexToRgba(hex: string, alpha: number): string {
  const normalized = hex.replace('#', '');
  const value =
		normalized.length === 3
		  ? normalized
		    .split('')
		    .map((char) => char + char)
		    .join('')
		  : normalized;
  const r = Number.parseInt(value.slice(0, 2), 16);
  const g = Number.parseInt(value.slice(2, 4), 16);
  const b = Number.parseInt(value.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

/** Colored light cast from each grid cell outward through the prism. */
export function prismLightCellsFromGrid(
  grid: PuzzleGrid,
  options: { monochromeFlip: boolean; alpha?: number; strength?: number }
): PrismLightCell[] | null {
  if (options.monochromeFlip) return null;

  const rows = grid.length;
  const cols = grid[0]?.length ?? 0;
  if (rows === 0 || cols === 0) return null;

  const centerRow = (rows - 1) / 2;
  const centerCol = (cols - 1) / 2;
  const maxDistance =
		Math.sqrt(centerRow ** 2 + centerCol ** 2) ||
		Math.sqrt((rows - 1) ** 2 + (cols - 1) ** 2) / 2 ||
		1;

  const coloredCells = grid.flatMap((row, rowIndex) =>
    row.flatMap((cell, colIndex) =>
      cell === 0 ? [] : [{ cell: cell as Pigment, rowIndex, colIndex }]
    )
  );

  if (coloredCells.length === 0) return null;

  const strength = options.strength ?? 2;
  const baseAlpha = options.alpha ?? 0.7;
  const alphaScale = strength / Math.max(1, Math.sqrt(coloredCells.length) * 0.3);

  return coloredCells.map(({ cell, rowIndex, colIndex }) => {
    const deltaRow = rowIndex - centerRow;
    const deltaCol = colIndex - centerCol;
    const distance = Math.hypot(deltaRow, deltaCol);

    if (distance < 0.05) {
      return {
        row: rowIndex,
        col: colIndex,
        color: hexToRgba(PIGMENT_HEX[cell], Math.min(1, baseAlpha * alphaScale * 0.9)),
        angleDeg: 0,
        reach: 0.55,
        isCenter: true
      };
    }

    return {
      row: rowIndex,
      col: colIndex,
      color: hexToRgba(PIGMENT_HEX[cell], Math.min(1, baseAlpha * alphaScale)),
      angleDeg: (Math.atan2(deltaCol, -deltaRow) * 180) / Math.PI,
      reach: 0.5 + 0.65 * (distance / maxDistance),
      isCenter: false
    };
  });
}
