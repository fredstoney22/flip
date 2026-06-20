import { describe, expect, it } from 'vitest';
import {
  applyTemplateToStartState,
  createEmptyGrid,
  normalizeTemplateForExport,
  resizeTemplate,
  rotateLabTemplate,
  templateFitsAt
} from './puzzleLab';
import type { PuzzleTemplate } from '@flip/game';

describe('puzzleLab template helpers', () => {
  it('exports templates as unified shape grids', () => {
    const template: PuzzleTemplate = {
      shape: [
        [4, 4],
        [0, 0]
      ]
    };
    expect(normalizeTemplateForExport(template)).toEqual({
      shape: [
        [4, 4],
        [0, 0]
      ]
    });
  });

  it('preserves multi-color templates on export', () => {
    const template: PuzzleTemplate = {
      shape: [
        [1, 2],
        [0, 4]
      ]
    };
    expect(normalizeTemplateForExport(template)).toEqual({
      shape: [
        [1, 2],
        [0, 4]
      ]
    });
  });

  it('resizes unified shape grids', () => {
    const template: PuzzleTemplate = {
      shape: [[2, 3]]
    };
    const resized = resizeTemplate(template, 2, 2);
    expect(resized.shape).toEqual([
      [2, 3],
      [0, 0]
    ]);
  });

  it('rotates a template 90° clockwise', () => {
    const template: PuzzleTemplate = {
      shape: [
        [1, 0],
        [1, 0]
      ]
    };
    expect(rotateLabTemplate(template).shape).toEqual([
      [1, 1],
      [0, 0]
    ]);
  });

  it('applies a template to the start state with XOR', () => {
    const startState = createEmptyGrid(3);
    startState[1][1] = 1;
    const template: PuzzleTemplate = {
      shape: [[1]]
    };
    expect(applyTemplateToStartState(startState, template, 1, 1)).toEqual([
      [0, 0, 0],
      [0, 0, 0],
      [0, 0, 0]
    ]);
  });

  it('checks template placement bounds', () => {
    const template: PuzzleTemplate = { shape: [[1, 1], [1, 1]] };
    expect(templateFitsAt(3, template, 0, 0)).toBe(true);
    expect(templateFitsAt(3, template, 2, 2)).toBe(false);
  });
});
