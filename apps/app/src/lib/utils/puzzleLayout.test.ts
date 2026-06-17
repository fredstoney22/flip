import { describe, expect, it } from 'vitest';
import {
  cellSizeForDimension,
  computePuzzleLayout,
  gridPixelSize,
  templatePixelSize,
  templateRowPixelWidth
} from './puzzleLayout.js';

describe('puzzleLayout', () => {
  it('cellSizeForDimension accounts for gaps and padding', () => {
    // 14 cells in 390px: (390 - 13*2 - 8) / 14 = 25
    expect(cellSizeForDimension(14, 390)).toBe(25);
    expect(gridPixelSize(14, 25)).toBeLessThanOrEqual(390);
  });

  it('fits a 14×14 grid and large templates in a phone viewport', () => {
    const layout = computePuzzleLayout({
      rows: 14,
      cols: 14,
      templateBoundDims: [14, 14, 14],
      templateCount: 3,
      availableWidth: 390,
      availableHeight: 620,
      isMobile: true
    });

    const gridW = gridPixelSize(14, layout.cellSize);
    const gridH = gridPixelSize(14, layout.cellSize);
    const templateH = templatePixelSize(14, layout.templateSquareSize);

    expect(gridW).toBeLessThanOrEqual(390);
    expect(gridH + templateH).toBeLessThan(620);
    expect(layout.cellSize).toBeGreaterThanOrEqual(6);
  });

  it('keeps small puzzles at a comfortable cell size on desktop', () => {
    const layout = computePuzzleLayout({
      rows: 3,
      cols: 3,
      templateBoundDims: [3, 3, 3],
      templateCount: 3,
      availableWidth: 900,
      availableHeight: 700,
      isMobile: false
    });

    expect(layout.cellSize).toBeGreaterThanOrEqual(40);
  });

  it('fits many templates in one row without horizontal overflow', () => {
    const templateBoundDims = [4, 4, 4, 4, 4, 4];
    const availableWidth = 390;
    const layout = computePuzzleLayout({
      rows: 9,
      cols: 9,
      templateBoundDims,
      templateCount: templateBoundDims.length,
      availableWidth,
      availableHeight: 620,
      isMobile: true
    });

    const rowWidth = templateRowPixelWidth(templateBoundDims, layout.templateSquareSize);
    expect(rowWidth).toBeLessThanOrEqual(availableWidth);
    expect(layout.templateSquareSize).toBeGreaterThanOrEqual(5);
  });
});
