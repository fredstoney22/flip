import { describe, expect, it } from 'vitest';
import {
  getSnapToCenterPosition,
  listValidTemplatePlacements,
  templateCenterAt
} from './templateSnap';

describe('templateCenterAt', () => {
  it('uses the geometric center of the footprint', () => {
    expect(templateCenterAt(0, 0, 2, 2)).toEqual([1, 1]);
    expect(templateCenterAt(0, 0, 3, 3)).toEqual([1.5, 1.5]);
    expect(templateCenterAt(1, 2, 1, 1)).toEqual([1.5, 2.5]);
  });
});

describe('listValidTemplatePlacements', () => {
  it('lists every in-bounds top-left anchor', () => {
    expect(listValidTemplatePlacements(2, 2, 3, 3)).toEqual([
      [0, 0],
      [0, 1],
      [1, 0],
      [1, 1]
    ]);
  });

  it('returns a single placement when template matches the grid', () => {
    expect(listValidTemplatePlacements(3, 3, 3, 3)).toEqual([[0, 0]]);
  });
});

describe('getSnapToCenterPosition', () => {
  it('snaps 2×2 on 3×3 toward top-left when the pointer is in that quadrant', () => {
    expect(getSnapToCenterPosition(2, 2, 3, 3, 1.2, 1.2)).toEqual([0, 0]);
  });

  it('snaps 2×2 on 3×3 toward bottom-right when the pointer is in that quadrant', () => {
    expect(getSnapToCenterPosition(2, 2, 3, 3, 1.8, 1.8)).toEqual([1, 1]);
  });

  it('aligns exactly when the pointer sits on a valid template center', () => {
    expect(getSnapToCenterPosition(2, 2, 3, 3, 1, 1)).toEqual([0, 0]);
    expect(getSnapToCenterPosition(2, 2, 3, 3, 2, 2)).toEqual([1, 1]);
  });

  it('picks the nearest center for 1×1 templates', () => {
    expect(getSnapToCenterPosition(1, 1, 3, 3, 0.2, 0.2)).toEqual([0, 0]);
    expect(getSnapToCenterPosition(1, 1, 3, 3, 0.8, 0.2)).toEqual([0, 0]);
    expect(getSnapToCenterPosition(1, 1, 3, 3, 1.2, 0.2)).toEqual([1, 0]);
  });

  it('centers odd templates on the pointer for larger grids', () => {
    expect(getSnapToCenterPosition(3, 3, 5, 5, 2.5, 2.5)).toEqual([1, 1]);
    expect(getSnapToCenterPosition(3, 3, 9, 9, 4.5, 4.5)).toEqual([3, 3]);
  });

  it('respects grid edges when the pointer is near a border', () => {
    expect(getSnapToCenterPosition(3, 3, 5, 5, 0.5, 0.5)).toEqual([0, 0]);
    expect(getSnapToCenterPosition(3, 3, 5, 5, 4.8, 4.8)).toEqual([2, 2]);
  });

  it('returns null when the template does not fit', () => {
    expect(getSnapToCenterPosition(4, 4, 3, 3, 1, 1)).toBeNull();
  });
});
