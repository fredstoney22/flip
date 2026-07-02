import { describe, expect, it } from 'vitest';
import { iridescentSheetSize, iridescentSheetStyle } from './iridescentPigment';

describe('iridescentSheetSize', () => {
  it('sums cells and gaps for a 3×3 grid', () => {
    expect(iridescentSheetSize(3, 3, 48, 2)).toEqual({ width: 148, height: 148 });
  });
});

describe('iridescentSheetStyle', () => {
  it('returns pixel dimensions for the shared sheet', () => {
    expect(iridescentSheetStyle(3, 3, 48, 2)).toEqual({
      width: '148px',
      height: '148px'
    });
  });
});
