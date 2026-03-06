/**
 * Game logic for the color puzzle experiment.
 *
 * The color model is a natural extension of the binary XOR mechanic:
 * instead of flipping 0↔1, we XOR a 3-bit RYB pigment bitmask.
 */

import type { ColorGrid, ColorPuzzleConfig, ColorTemplate, Pigment } from './colorTypes.js';

/**
 * Applies a colored template to the puzzle state at the given position.
 * XORs the template's pigment into every cell covered by the template shape.
 * Returns a new grid without mutating the original.
 */
export function applyColorTemplate(
	state: ColorGrid,
	template: ColorTemplate,
	startRow: number,
	startCol: number
): ColorGrid {
	return state.map((row, r) =>
		row.map((cell, c) => {
			const tr = r - startRow;
			const tc = c - startCol;
			if (
				tr >= 0 &&
				tr < template.shape.length &&
				tc >= 0 &&
				tc < template.shape[0].length &&
				template.shape[tr][tc] === 1
			) {
				return ((cell ^ template.pigment) & 0b111) as Pigment;
			}
			return cell;
		})
	);
}

/** Returns true when every cell in the grid is white/clear (pigment === 0). */
export function isColorSolved(state: ColorGrid): boolean {
	return state.every((row) => row.every((cell) => cell === 0));
}

/**
 * Returns valid top-left positions where a template shape can be placed
 * without overflowing the grid bounds.
 */
export function getValidPositions(
	state: ColorGrid,
	template: ColorTemplate
): [number, number][] {
	const positions: [number, number][] = [];
	const maxRow = state.length - template.shape.length;
	const maxCol = state[0].length - template.shape[0].length;
	for (let r = 0; r <= maxRow; r++) {
		for (let c = 0; c <= maxCol; c++) {
			positions.push([r, c]);
		}
	}
	return positions;
}

/**
 * Returns the centered top-left start position for placing a template
 * such that the template is centered over the clicked cell.
 * Returns null if the template would overflow the grid.
 */
export function getCenteredColorPosition(
	state: ColorGrid,
	template: ColorTemplate,
	centerRow: number,
	centerCol: number
): [number, number] | null {
	const startRow = centerRow - Math.floor(template.shape.length / 2);
	const startCol = centerCol - Math.floor(template.shape[0].length / 2);
	if (
		startRow >= 0 &&
		startCol >= 0 &&
		startRow + template.shape.length <= state.length &&
		startCol + template.shape[0].length <= state[0].length
	) {
		return [startRow, startCol];
	}
	return null;
}

// ---------------------------------------------------------------------------
// Sample color puzzles for the experiment
// ---------------------------------------------------------------------------

/**
 * Puzzle 1 — Starter
 * A 3×3 grid with a single orange cell in the centre.
 * Templates: Yellow and Red (the two pigments that make orange).
 * Solution: apply Yellow to the centre, then Red — or vice versa.
 */
const puzzle1: ColorPuzzleConfig = {
	startState: [
		[0, 0, 0],
		[0, 3, 0], // 3 = Orange (Red+Yellow)
		[0, 0, 0]
	] as ColorGrid,
	templates: [
		{
			shape: [
				[0, 0, 0],
				[0, 1, 0],
				[0, 0, 0]
			],
			pigment: 2 // Yellow
		},
		{
			shape: [
				[0, 0, 0],
				[0, 1, 0],
				[0, 0, 0]
			],
			pigment: 1 // Red
		}
	]
};

/**
 * Puzzle 2 — Mix it up
 * A 3×3 grid with scattered primary colours.
 * Templates: the three primaries, each covering a 2×2 area.
 */
const puzzle2: ColorPuzzleConfig = {
	startState: [
		[1, 0, 2], // Red, clear, Yellow
		[0, 4, 0], // clear, Blue, clear
		[2, 0, 1]  // Yellow, clear, Red
	] as ColorGrid,
	templates: [
		{
			shape: [
				[1, 1],
				[1, 1]
			],
			pigment: 1 // Red
		},
		{
			shape: [
				[1, 1],
				[1, 1]
			],
			pigment: 2 // Yellow
		},
		{
			shape: [
				[1, 1],
				[1, 1]
			],
			pigment: 4 // Blue
		}
	]
};

/**
 * Puzzle 3 — All three
 * Every cell is Brown (all three pigments mixed).
 * Apply each primary to clear the whole grid.
 * Templates span the full grid so one application clears all.
 */
const puzzle3: ColorPuzzleConfig = {
	startState: [
		[7, 7, 7], // Brown = R+Y+B
		[7, 7, 7],
		[7, 7, 7]
	] as ColorGrid,
	templates: [
		{
			shape: [
				[1, 1, 1],
				[1, 1, 1],
				[1, 1, 1]
			],
			pigment: 1 // Red — removes Red component
		},
		{
			shape: [
				[1, 1, 1],
				[1, 1, 1],
				[1, 1, 1]
			],
			pigment: 2 // Yellow
		},
		{
			shape: [
				[1, 1, 1],
				[1, 1, 1],
				[1, 1, 1]
			],
			pigment: 4 // Blue
		}
	]
};

/**
 * Puzzle 4 — Complementary
 * A 3×3 grid where each row is a different mixed colour.
 * Templates are the three primaries with varying shapes.
 */
const puzzle4: ColorPuzzleConfig = {
	startState: [
		[3, 3, 3], // Orange row  (R+Y)
		[5, 5, 5], // Purple row  (R+B)
		[6, 6, 6]  // Green row   (Y+B)
	] as ColorGrid,
	templates: [
		{
			shape: [
				[1, 0, 0],
				[1, 0, 0],
				[1, 0, 0]
			],
			pigment: 1 // Red (clears orange & purple left column)
		},
		{
			shape: [
				[0, 1, 0],
				[0, 1, 0],
				[0, 1, 0]
			],
			pigment: 2 // Yellow (clears orange & green mid column)
		},
		{
			shape: [
				[0, 0, 1],
				[0, 0, 1],
				[0, 0, 1]
			],
			pigment: 4 // Blue (clears purple & green right column)
		}
	]
};

/**
 * Puzzle 5 — Checker
 * A 4×4 checkerboard of alternating Red and Blue cells.
 * Templates: small cross shapes in Yellow, Red and Blue.
 */
const puzzle5: ColorPuzzleConfig = {
	startState: [
		[1, 4, 1, 4],
		[4, 1, 4, 1],
		[1, 4, 1, 4],
		[4, 1, 4, 1]
	] as ColorGrid,
	templates: [
		{
			shape: [
				[0, 1, 0],
				[1, 1, 1],
				[0, 1, 0]
			],
			pigment: 1 // Red
		},
		{
			shape: [
				[0, 1, 0],
				[1, 1, 1],
				[0, 1, 0]
			],
			pigment: 4 // Blue
		},
		{
			shape: [
				[1, 0],
				[0, 1]
			],
			pigment: 5 // Purple (R+B — cancels both at once)
		}
	]
};

export const COLOR_SAMPLE_PUZZLES: { title: string; description: string; config: ColorPuzzleConfig }[] = [
	{
		title: 'Orange & Out',
		description: 'One orange cell. Apply yellow then red to clear it.',
		config: puzzle1
	},
	{
		title: 'Primary Scatter',
		description: 'Red, yellow and blue cells scattered across the grid.',
		config: puzzle2
	},
	{
		title: 'Muddy Grid',
		description: 'Every cell is brown (all three pigments). Apply each primary once.',
		config: puzzle3
	},
	{
		title: 'Complementary Rows',
		description: 'Orange, purple and green rows. Columns of primary templates clear them.',
		config: puzzle4
	},
	{
		title: 'Checkerboard',
		description: 'Alternating red and blue. The purple template cancels both at once.',
		config: puzzle5
	}
];

// ---- BEGIN AUTO-GENERATED COLOR PACK ----
// Generated via: npx tsx packages/game/scripts/generate-color-pack.ts
// This is used by the Color Lab pack in the main app.
export const GENERATED_COLOR_PACK: { title: string; description: string; config: ColorPuzzleConfig }[] = [
  {
    title: 'Warmup',
    description: 'Clears in exactly 2 moves.',
    config: {
      startState: [
        [2, 0, 2],
        [2, 0, 2],
        [0, 2, 2]
      ] as ColorGrid,
      templates: [
        {
          shape: [
            [0, 1, 1],
            [1, 0, 1],
            [0, 1, 1]
          ],
          pigment: 2
        },
        {
          shape: [
            [1, 1],
            [1, 1],
            [0, 1]
          ],
          pigment: 2
        },
        {
          shape: [
            [0, 0],
            [1, 0]
          ],
          pigment: 2
        }
      ]
    }
  },
  {
    title: 'Mixer',
    description: 'Clears in exactly 3 moves.',
    config: {
      startState: [
        [1, 1, 1],
        [0, 1, 4],
        [1, 1, 0]
      ] as ColorGrid,
      templates: [
        {
          shape: [
            [0, 1],
            [0, 1]
          ],
          pigment: 4
        },
        {
          shape: [
            [1, 1, 1],
            [0, 1, 0],
            [1, 1, 0]
          ],
          pigment: 1
        },
        {
          shape: [
            [1, 1],
            [1, 0]
          ],
          pigment: 4
        }
      ]
    }
  },
  {
    title: 'Tertiary Twist',
    description: 'Clears in exactly 3 moves.',
    config: {
      startState: [
        [4, 0, 4],
        [4, 0, 0],
        [4, 0, 4]
      ] as ColorGrid,
      templates: [
        {
          shape: [
            [1, 0],
            [0, 0],
            [0, 1]
          ],
          pigment: 4
        },
        {
          shape: [
            [0, 1, 1],
            [1, 0, 0],
            [1, 1, 0]
          ],
          pigment: 4
        },
        {
          shape: [
            [1, 1, 0],
            [1, 0, 1],
            [0, 1, 0]
          ],
          pigment: 2
        }
      ]
    }
  },
  {
    title: 'Deep Shade',
    description: 'Clears in exactly 4 moves.',
    config: {
      startState: [
        [5, 4, 1],
        [5, 0, 1],
        [1, 4, 1]
      ] as ColorGrid,
      templates: [
        {
          shape: [
            [1, 0, 1],
            [1, 0, 1],
            [1, 0, 1]
          ],
          pigment: 1
        },
        {
          shape: [
            [1, 0],
            [1, 0]
          ],
          pigment: 4
        },
        {
          shape: [
            [0, 1, 1],
            [1, 0, 0]
          ],
          pigment: 1
        }
      ]
    }
  },
  {
    title: 'Chromatic Knot',
    description: 'Clears in exactly 4 moves.',
    config: {
      startState: [
        [1, 4, 0],
        [0, 0, 0],
        [1, 0, 5]
      ] as ColorGrid,
      templates: [
        {
          shape: [
            [1, 1, 1],
            [1, 0, 1],
            [1, 1, 1]
          ],
          pigment: 4
        },
        {
          shape: [
            [1, 0],
            [0, 0],
            [0, 1]
          ],
          pigment: 4
        },
        {
          shape: [
            [1, 0],
            [1, 1]
          ],
          pigment: 1
        }
      ]
    }
  }
];
// ---- END AUTO-GENERATED COLOR PACK ----

