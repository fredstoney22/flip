/** Geometric center of a template placed at (startRow, startCol). */
export function templateCenterAt(
  startRow: number,
  startCol: number,
  templateRows: number,
  templateCols: number
): [number, number] {
  return [startRow + templateRows / 2, startCol + templateCols / 2];
}

/** All top-left placements that keep the template fully inside the grid. */
export function listValidTemplatePlacements(
  templateRows: number,
  templateCols: number,
  gridRows: number,
  gridCols: number
): Array<[number, number]> {
  if (!templateRows || !templateCols || !gridRows || !gridCols) return [];
  if (templateRows > gridRows || templateCols > gridCols) return [];

  const placements: Array<[number, number]> = [];
  for (let startRow = 0; startRow <= gridRows - templateRows; startRow++) {
    for (let startCol = 0; startCol <= gridCols - templateCols; startCol++) {
      placements.push([startRow, startCol]);
    }
  }
  return placements;
}

/**
 * Snap a template so its geometric center is as close as possible to the pointer.
 *
 * `hoverRow` / `hoverCol` are fractional grid coordinates (0 = top/left edge of row/col 0).
 * The pointer is treated as where the user wants the center of the template footprint.
 */
export function getSnapToCenterPosition(
  templateRows: number,
  templateCols: number,
  gridRows: number,
  gridCols: number,
  hoverRow: number,
  hoverCol: number
): [number, number] | null {
  const placements = listValidTemplatePlacements(templateRows, templateCols, gridRows, gridCols);
  if (placements.length === 0) return null;

  let best = placements[0];
  let bestDist = Number.POSITIVE_INFINITY;

  for (const [startRow, startCol] of placements) {
    const [centerRow, centerCol] = templateCenterAt(startRow, startCol, templateRows, templateCols);
    const distSq = (centerRow - hoverRow) ** 2 + (centerCol - hoverCol) ** 2;
    if (
      distSq < bestDist ||
      (distSq === bestDist && (startRow < best[0] || (startRow === best[0] && startCol < best[1])))
    ) {
      bestDist = distSq;
      best = [startRow, startCol];
    }
  }

  return best;
}
