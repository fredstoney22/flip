import {
  applyTemplate,
  archivedFirstStepsPuzzle5,
  distinctPigmentsInTemplate,
  isSolved,
  orientTemplate,
  PIGMENT_CLEAR_SOLVED_VALUE,
  PIGMENT_NAME,
  solveMinMoves,
  type Pigment,
  type PuzzleConfig,
  type PuzzleGrid,
  type PuzzleTemplate
} from '@flip/game';

/** Puzzle lab always targets an all-white (clear) solved grid. */
export const LAB_SOLVED_VALUE = PIGMENT_CLEAR_SOLVED_VALUE;

export type GridEditorMode = 'pigment' | 'mask';

export interface LabState {
  gridSize: number;
  startState: PuzzleGrid;
  templates: PuzzleTemplate[];
  selectedTemplateIndex: number;
  allowTemplateRotation: boolean;
  minMovesToSolve: number | null;
}

export interface LabValidation {
  ok: boolean;
  minMoves: number | null;
  messages: string[];
}

const PIGMENTS: Pigment[] = [0, 1, 2, 3, 4, 5, 6, 7];
const TEMPLATE_PIGMENTS: Pigment[] = [1, 2, 3, 4, 5, 6, 7];

export function createEmptyGrid(size: number, fill: Pigment = LAB_SOLVED_VALUE): PuzzleGrid {
  return Array.from({ length: size }, () => Array<Pigment>(size).fill(fill));
}

export function createEmptyTemplateGrid(rows: number, cols: number): Pigment[][] {
  return Array.from({ length: rows }, () => Array<Pigment>(cols).fill(0));
}

export function defaultLabState(): LabState {
  const gridSize = 3;
  return {
    gridSize,
    startState: createEmptyGrid(gridSize),
    templates: [
      {
        shape: [
          [1, 1],
          [0, 0]
        ]
      }
    ],
    selectedTemplateIndex: 0,
    allowTemplateRotation: true,
    minMovesToSolve: null
  };
}

export function resizeGrid(grid: PuzzleGrid, size: number, fill: Pigment = LAB_SOLVED_VALUE): PuzzleGrid {
  const next = createEmptyGrid(size, fill);
  for (let r = 0; r < Math.min(size, grid.length); r++) {
    const row = grid[r] ?? [];
    for (let c = 0; c < Math.min(size, row.length); c++) {
      next[r][c] = row[c];
    }
  }
  return next;
}

export function resizeTemplateGrid(
  grid: Pigment[][],
  rows: number,
  cols: number
): Pigment[][] {
  const next = createEmptyTemplateGrid(rows, cols);
  for (let r = 0; r < Math.min(rows, grid.length); r++) {
    const row = grid[r] ?? [];
    for (let c = 0; c < Math.min(cols, row.length); c++) {
      next[r][c] = row[c];
    }
  }
  return next;
}

export function resizeTemplate(template: PuzzleTemplate, rows: number, cols: number): PuzzleTemplate {
  return {
    shape: resizeTemplateGrid(template.shape, rows, cols)
  };
}

/** Rotate the selected template 90° clockwise (same as in-game lens rotation). */
export function rotateLabTemplate(template: PuzzleTemplate): PuzzleTemplate {
  return orientTemplate(template, 1);
}

/** Whether a template fits on the grid when placed with its top-left at (startRow, startCol). */
export function templateFitsAt(
  gridSize: number,
  template: PuzzleTemplate,
  startRow: number,
  startCol: number
): boolean {
  const rows = template.shape.length;
  const cols = template.shape[0]?.length ?? 0;
  if (rows === 0 || cols === 0) return false;
  return (
    startRow >= 0 &&
    startCol >= 0 &&
    startRow + rows <= gridSize &&
    startCol + cols <= gridSize
  );
}

/** XOR the template onto a copy of the start grid (lab preview of one in-game move). */
export function applyTemplateToStartState(
  startState: PuzzleGrid,
  template: PuzzleTemplate,
  startRow: number,
  startCol: number
): PuzzleGrid {
  return applyTemplate(startState, template, startRow, startCol);
}

export function getTemplateCellPigment(template: PuzzleTemplate, row: number, col: number): Pigment {
  return template.shape[row]?.[col] ?? 0;
}

export function templateHasActiveCells(template: PuzzleTemplate): boolean {
  return template.shape.some((row) => row.some((cell) => cell !== 0));
}

export function isMultiColoredTemplate(template: PuzzleTemplate): boolean {
  return distinctPigmentsInTemplate(template).length > 1;
}

export function templateSummaryLabel(template: PuzzleTemplate): string {
  const names = distinctPigmentsInTemplate(template).map((p) => PIGMENT_NAME[p]);
  if (names.length === 0) return 'Empty';
  if (names.length === 1) return names[0];
  return names.join(' + ');
}

/** Deep-clone a template for lab editing. */
export function normalizeTemplateForExport(template: PuzzleTemplate): PuzzleTemplate {
  return {
    shape: template.shape.map((row) => [...row])
  };
}

function cloneTemplate(template: PuzzleTemplate): PuzzleTemplate {
  return {
    shape: template.shape.map((row) => [...row])
  };
}

export function cyclePigment(current: Pigment, direction: 1 | -1): Pigment {
  const index = PIGMENTS.indexOf(current);
  const next = (index + direction + PIGMENTS.length) % PIGMENTS.length;
  return PIGMENTS[next];
}

/** Cycle pigments used on active template cells (excludes clear/white). */
export function cycleTemplatePigment(current: Pigment, direction: 1 | -1): Pigment {
  const index = Math.max(0, TEMPLATE_PIGMENTS.indexOf(current));
  const safeIndex = index === -1 ? 0 : index;
  const next = (safeIndex + direction + TEMPLATE_PIGMENTS.length) % TEMPLATE_PIGMENTS.length;
  return TEMPLATE_PIGMENTS[next];
}

export function toggleMaskCell(current: number): number {
  return current === 1 ? 0 : 1;
}

export function labStateToConfig(state: LabState): PuzzleConfig {
  return {
    startState: state.startState.map((row) => [...row]),
    templates: state.templates.map((t) => normalizeTemplateForExport(t)),
    solvedValue: LAB_SOLVED_VALUE,
    allowTemplateRotation: state.allowTemplateRotation,
    ...(state.minMovesToSolve !== null ? { minMovesToSolve: state.minMovesToSolve } : {})
  };
}

export function configToLabState(config: PuzzleConfig): LabState {
  const gridSize = config.startState.length;
  return {
    gridSize,
    startState: config.startState.map((row) => [...row]),
    templates: config.templates.map((t) => cloneTemplate(t)),
    selectedTemplateIndex: 0,
    allowTemplateRotation: config.allowTemplateRotation ?? true,
    minMovesToSolve: config.minMovesToSolve ?? null
  };
}

export function validateLabConfig(config: PuzzleConfig): LabValidation {
  const messages: string[] = [];

  if (config.solvedValue !== LAB_SOLVED_VALUE) {
    messages.push(
      `solvedValue is ${config.solvedValue}; lab puzzles must clear to white (${LAB_SOLVED_VALUE}). Export will use ${LAB_SOLVED_VALUE}.`
    );
  }

  if (config.startState.length === 0) {
    messages.push('Start state is empty.');
  }

  if (config.templates.length === 0) {
    messages.push('Add at least one template.');
  }

  for (let i = 0; i < config.templates.length; i++) {
    const template = config.templates[i];
    const active = template.shape.some((row) => row.some((cell) => cell !== 0));
    if (!active) {
      messages.push(`Template ${i + 1} has no active cells.`);
    }
  }

  const labConfig = { ...config, solvedValue: LAB_SOLVED_VALUE };

  if (isSolved(labConfig.startState, LAB_SOLVED_VALUE)) {
    messages.push('Start state is already solved (all white). Paint some cells to create a puzzle.');
  }

  const minMoves = solveMinMoves(labConfig);
  if (minMoves === null) {
    messages.push('Puzzle is not solvable (using every template once).');
  } else {
    messages.push(`Minimum moves: ${minMoves}`);
    if (config.minMovesToSolve !== undefined && config.minMovesToSolve !== minMoves) {
      messages.push(
        `Par (minMovesToSolve=${config.minMovesToSolve}) differs from solver minimum (${minMoves}).`
      );
    }
  }

  const hasErrors = messages.some(
    (m) =>
      m.includes('empty') ||
      m.includes('Add at least') ||
      m.includes('no active cells') ||
      m.includes('already solved') ||
      m.includes('not solvable')
  );

  return { ok: !hasErrors && minMoves !== null, minMoves, messages };
}

export function exportConfigJson(config: PuzzleConfig): string {
  return JSON.stringify({ ...config, solvedValue: LAB_SOLVED_VALUE }, null, 2);
}

export function parseConfigJson(raw: string): PuzzleConfig {
  const parsed = JSON.parse(raw) as PuzzleConfig;
  if (!parsed?.startState || !parsed?.templates) {
    throw new Error('JSON must include startState and templates');
  }
  return { ...parsed, solvedValue: LAB_SOLVED_VALUE };
}


/** Example puzzle that clears to white (archived First Steps #5 — blue intro). */
export const EXAMPLE_CONFIG: PuzzleConfig = {
  ...archivedFirstStepsPuzzle5,
  solvedValue: LAB_SOLVED_VALUE
};
