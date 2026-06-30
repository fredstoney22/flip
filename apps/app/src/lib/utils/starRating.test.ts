import { describe, expect, it } from 'vitest';
import { isOptimalSolve } from './starRating';

describe('isOptimalSolve', () => {
  it('returns true when par is unknown', () => {
    expect(isOptimalSolve(10, null)).toBe(true);
  });

  it('returns true at or under par', () => {
    expect(isOptimalSolve(3, 3)).toBe(true);
    expect(isOptimalSolve(2, 3)).toBe(true);
  });

  it('returns false when over par', () => {
    expect(isOptimalSolve(4, 3)).toBe(false);
    expect(isOptimalSolve(6, 3)).toBe(false);
  });

  it('does not penalize beating a previous personal best', () => {
    expect(isOptimalSolve(3, 4)).toBe(true);
  });
});
