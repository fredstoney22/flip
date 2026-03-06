/**
 * Static pack and puzzle data — used only by packages/db/seed.ts.
 * At runtime, pack and puzzle data is served from the database.
 */

import type { PackDefinition } from './types.js';

// ---- BEGIN AUTO-GENERATED DIFFICULTY PACKS ----
// Generated via: npx tsx packages/game/scripts/generate-difficulty-packs.ts
// If you regenerate, paste the new constant here and adjust `packs` below as needed.
export const generatedDifficultyPacks: PackDefinition[] = [
  {
    name: 'Tutorial (Auto)',
    slug: 'tutorial-auto',
    access: 'free',
    puzzles: {
      1: {
        startState: [
          [1, 1, 1],
          [1, 0, 1],
          [1, 1, 1]
        ],
        templates: [
          [
            [1, 1],
            [0, 1]
          ],
          [
            [0, 0, 1],
            [1, 0, 1],
            [0, 0, 0]
          ]
        ],
        minMovesToSolve: 1
      },
      2: {
        startState: [
          [1, 1, 1],
          [0, 1, 1],
          [1, 1, 1]
        ],
        templates: [
          [
            [1, 0],
            [1, 1]
          ],
          [
            [1, 1, 0],
            [0, 0, 0],
            [0, 0, 0]
          ]
        ],
        minMovesToSolve: 1
      },
      3: {
        startState: [
          [1, 0, 1],
          [1, 0, 1],
          [1, 1, 1]
        ],
        templates: [
          [
            [0, 1],
            [0, 1]
          ],
          [
            [0, 0, 0],
            [0, 1, 0],
            [1, 0, 0]
          ]
        ],
        minMovesToSolve: 1
      },
      4: {
        startState: [
          [0, 0, 1],
          [1, 1, 1],
          [1, 1, 1]
        ],
        templates: [
          [
            [1, 0],
            [1, 0]
          ],
          [
            [1, 0, 1],
            [0, 0, 0],
            [0, 1, 1]
          ]
        ],
        minMovesToSolve: 1
      },
      5: {
        startState: [
          [1, 1, 0],
          [1, 1, 1],
          [1, 1, 1]
        ],
        templates: [
          [
            [0, 1],
            [1, 1]
          ],
          [
            [1, 0, 1],
            [1, 0, 0],
            [1, 1, 0]
          ]
        ],
        minMovesToSolve: 1
      }
    }
  },
  {
    name: 'Easy (Auto)',
    slug: 'easy-auto',
    access: 'free',
    puzzles: {
      1: {
        startState: [
          [1, 1, 1],
          [0, 1, 0],
          [0, 0, 0]
        ],
        templates: [
          [
            [1, 0],
            [0, 0]
          ],
          [
            [0, 0],
            [1, 1]
          ],
          [
            [1, 0, 0],
            [0, 0, 0],
            [1, 1, 1]
          ]
        ],
        minMovesToSolve: 2
      },
      2: {
        startState: [
          [1, 1, 1],
          [1, 0, 0],
          [0, 0, 1]
        ],
        templates: [
          [
            [0, 1],
            [0, 0]
          ],
          [
            [1, 0],
            [0, 1]
          ],
          [
            [1, 0, 1],
            [0, 0, 0],
            [1, 0, 0]
          ]
        ],
        minMovesToSolve: 2
      },
      3: {
        startState: [
          [1, 1, 0],
          [1, 0, 1],
          [0, 1, 1]
        ],
        templates: [
          [
            [1, 0],
            [0, 0]
          ],
          [
            [1, 0],
            [0, 1]
          ],
          [
            [0, 1, 1],
            [1, 1, 1],
            [1, 0, 1]
          ]
        ],
        minMovesToSolve: 2
      },
      4: {
        startState: [
          [1, 1, 1],
          [0, 0, 1],
          [1, 1, 1]
        ],
        templates: [
          [
            [0, 1],
            [1, 1]
          ],
          [
            [0, 0],
            [0, 1]
          ],
          [
            [1, 1, 1],
            [0, 0, 1],
            [1, 1, 0]
          ]
        ],
        minMovesToSolve: 2
      },
      5: {
        startState: [
          [1, 1, 1],
          [1, 1, 0],
          [1, 0, 1]
        ],
        templates: [
          [
            [1, 0],
            [0, 0]
          ],
          [
            [1, 1],
            [0, 1]
          ],
          [
            [1, 1, 1],
            [0, 0, 0],
            [0, 0, 0]
          ]
        ],
        minMovesToSolve: 2
      }
    }
  },
  {
    name: 'Medium (Auto)',
    slug: 'medium-auto',
    access: 'free',
    puzzles: {
      1: {
        startState: [
          [1, 0, 1],
          [1, 0, 0],
          [1, 1, 1]
        ],
        templates: [
          [
            [1, 1],
            [1, 1]
          ],
          [
            [1, 0, 1],
            [1, 1, 1],
            [0, 0, 0]
          ],
          [
            [1, 0, 0],
            [0, 0, 1],
            [0, 1, 1]
          ]
        ],
        minMovesToSolve: 3
      },
      2: {
        startState: [
          [0, 1, 0],
          [1, 0, 0],
          [0, 1, 1]
        ],
        templates: [
          [
            [0, 0],
            [1, 1]
          ],
          [
            [0, 1],
            [1, 0]
          ],
          [
            [1, 1, 1],
            [0, 1, 0],
            [0, 0, 1]
          ]
        ],
        minMovesToSolve: 3
      },
      3: {
        startState: [
          [1, 1, 1],
          [0, 0, 1],
          [0, 1, 1]
        ],
        templates: [
          [
            [1, 1],
            [1, 1]
          ],
          [
            [0, 1],
            [1, 1]
          ],
          [
            [1, 1, 0],
            [1, 1, 0],
            [0, 1, 1]
          ]
        ],
        minMovesToSolve: 3
      },
      4: {
        startState: [
          [1, 0, 0],
          [1, 1, 0],
          [1, 1, 1]
        ],
        templates: [
          [
            [1, 0],
            [0, 1]
          ],
          [
            [1, 1],
            [1, 0]
          ],
          [
            [0, 1, 1],
            [0, 1, 1],
            [0, 1, 1]
          ]
        ],
        minMovesToSolve: 3
      },
      5: {
        startState: [
          [1, 1, 1],
          [0, 0, 1],
          [0, 0, 0]
        ],
        templates: [
          [
            [0, 0],
            [1, 1]
          ],
          [
            [0, 0],
            [1, 1]
          ],
          [
            [1, 0, 0],
            [0, 0, 0],
            [1, 1, 1]
          ]
        ],
        minMovesToSolve: 3
      }
    }
  },
  {
    name: 'Hard (Auto)',
    slug: 'hard-auto',
    access: 'paid',
    puzzles: {
      1: {
        startState: [
          [1, 0, 1],
          [1, 0, 0],
          [1, 1, 0]
        ],
        templates: [
          [
            [1, 0, 0],
            [1, 1, 0],
            [1, 0, 1]
          ],
          [
            [0, 0, 1],
            [1, 1, 1],
            [0, 1, 1]
          ],
          [
            [0, 1, 1],
            [1, 1, 1],
            [0, 0, 1]
          ]
        ],
        minMovesToSolve: 4
      },
      2: {
        startState: [
          [0, 1, 1],
          [1, 1, 0],
          [1, 1, 0]
        ],
        templates: [
          [
            [0, 0, 1],
            [1, 0, 1],
            [1, 0, 0]
          ],
          [
            [0, 1, 1],
            [1, 0, 1],
            [0, 0, 0]
          ],
          [
            [1, 1, 0],
            [1, 1, 1],
            [1, 0, 1]
          ]
        ],
        minMovesToSolve: 4
      },
      3: {
        startState: [
          [1, 1, 1],
          [0, 1, 1],
          [0, 0, 0]
        ],
        templates: [
          [
            [0, 1, 1],
            [1, 0, 1],
            [1, 0, 1]
          ],
          [
            [1, 0, 1],
            [1, 0, 0],
            [1, 1, 0]
          ],
          [
            [1, 1, 1],
            [1, 0, 0],
            [1, 0, 0]
          ]
        ],
        minMovesToSolve: 4
      },
      4: {
        startState: [
          [1, 0, 0],
          [0, 0, 1],
          [1, 0, 0]
        ],
        templates: [
          [
            [0, 0, 1],
            [1, 1, 0],
            [1, 1, 0]
          ],
          [
            [1, 0, 1],
            [0, 0, 1],
            [1, 0, 1]
          ],
          [
            [0, 0, 0],
            [0, 0, 1],
            [0, 1, 1]
          ]
        ],
        minMovesToSolve: 4
      },
      5: {
        startState: [
          [1, 1, 1],
          [1, 0, 1],
          [1, 0, 0]
        ],
        templates: [
          [
            [1, 0, 1],
            [1, 1, 1],
            [1, 1, 0]
          ],
          [
            [1, 1, 1],
            [1, 1, 0],
            [1, 1, 1]
          ],
          [
            [0, 0, 1],
            [0, 0, 1],
            [1, 1, 0]
          ]
        ],
        minMovesToSolve: 4
      }
    }
  },
  {
    name: 'Expert (Auto)',
    slug: 'expert-auto',
    access: 'paid',
    puzzles: {
      1: {
        startState: [
          [0, 1, 1],
          [1, 0, 1],
          [0, 1, 0]
        ],
        templates: [
          [
            [0, 0, 1],
            [0, 0, 1],
            [0, 1, 1]
          ],
          [
            [0, 1, 0],
            [1, 1, 1],
            [0, 0, 1]
          ],
          [
            [1, 1, 0],
            [0, 0, 0],
            [1, 1, 1]
          ]
        ],
        minMovesToSolve: 5
      },
      2: {
        startState: [
          [0, 0, 1],
          [1, 1, 1],
          [1, 1, 1]
        ],
        templates: [
          [
            [1, 1, 0],
            [0, 1, 1],
            [0, 1, 0]
          ],
          [
            [0, 0, 1],
            [1, 1, 0],
            [0, 0, 1]
          ],
          [
            [0, 1, 0],
            [0, 0, 1],
            [0, 0, 0]
          ]
        ],
        minMovesToSolve: 5
      },
      3: {
        startState: [
          [1, 1, 1],
          [1, 0, 0],
          [1, 1, 1]
        ],
        templates: [
          [
            [1, 1, 0],
            [1, 0, 1],
            [0, 0, 1]
          ],
          [
            [0, 0, 1],
            [0, 0, 0],
            [1, 0, 0]
          ],
          [
            [0, 1, 0],
            [1, 1, 1],
            [0, 0, 1]
          ]
        ],
        minMovesToSolve: 5
      },
      4: {
        startState: [
          [1, 0, 1],
          [1, 0, 0],
          [1, 1, 0]
        ],
        templates: [
          [
            [0, 1, 0],
            [1, 0, 0],
            [0, 0, 1]
          ],
          [
            [0, 0, 1],
            [0, 1, 1],
            [1, 1, 1]
          ],
          [
            [1, 1, 1],
            [1, 0, 0],
            [1, 1, 0]
          ]
        ],
        minMovesToSolve: 5
      },
      5: {
        startState: [
          [1, 1, 1],
          [1, 1, 1],
          [1, 1, 0]
        ],
        templates: [
          [
            [1, 0, 0],
            [0, 0, 1],
            [1, 0, 1]
          ],
          [
            [0, 0, 1],
            [0, 1, 0],
            [0, 1, 1]
          ],
          [
            [1, 1, 0],
            [0, 0, 0],
            [0, 1, 1]
          ]
        ],
        minMovesToSolve: 5
      }
    }
  }
];
// ---- END AUTO-GENERATED DIFFICULTY PACKS ----

export const packs: PackDefinition[] = [
	...generatedDifficultyPacks,
	{
		name: 'Intro Pack',
		slug: 'intro-pack',
		access: 'free',
		puzzles: {
			1: {
				// 8 dark, 1 light center; template (dark = flip) flips the 8 → all zeros (solved)
				startState: [
					[1, 1, 1],
					[1, 0, 1],
					[1, 1, 1],
				],
				templates: [
					[
						[0, 0, 0],
						[0, 1, 0],
						[0, 0, 0],
					],
				],
			},
			2: {
				startState: [
					[0, 1, 0],
					[1, 0, 0],
					[0, 0, 0],
				],
				templates: [
					[
						[1, 0, 1],
						[1, 1, 0],
						[1, 1, 1],
					],
				],
			},
			3: {
				startState: [
					[1, 0, 0],
					[0, 1, 0],
					[1, 0, 0],
				],
				templates: [
					[
						[1, 0, 0],
						[1, 0, 0],
						[0, 0, 0],
					],
					[
						[0, 1, 0],
						[1, 0, 0],
						[0, 0, 0],
					],
				],
			},
			4: {
				startState: [
					[1, 1, 1],
					[1, 0, 0],
					[0, 0, 1],
				],
				templates: [
					[
						[1, 1, 0],
						[0, 0, 1],
						[0, 0, 1],
					],
					[
						[1, 0, 1],
						[1, 1, 1],
						[0, 0, 1],
					],
				],
			},
			5: {
				startState: [
					[1, 1, 1],
					[0, 0, 0],
					[0, 0, 0],
				],
				templates: [
					[
						[1, 0, 0],
						[0, 1, 0],
						[1, 1, 0],
					],
					[
						[0, 0, 0],
						[1, 1, 1],
						[0, 1, 0],
					],
				],
			},
			6: {
				startState: [
					[1, 0, 1],
					[0, 0, 0],
					[1, 1, 1],
				],
				templates: [
					[
						[1, 0, 1],
						[1, 0, 1],
						[0, 0, 0],
					],
					[
						[1, 1, 0],
						[1, 1, 0],
						[1, 1, 0],
					],
				],
			},
			7: {
				startState: [
					[1, 1, 0],
					[1, 0, 1],
					[1, 0, 0],
				],
				templates: [
					[
						[1, 0, 1],
						[0, 0, 0],
						[1, 0, 0],
					],
					[
						[0, 0, 1],
						[1, 1, 0],
						[1, 0, 1],
					],
					[
						[0, 0, 1],
						[0, 1, 0],
						[1, 0, 0],
					],
				],
			},
			8: {
				startState: [
					[0, 0, 0],
					[0, 1, 0],
					[0, 1, 1],
				],
				templates: [
					[
						[1, 1, 0],
						[0, 0, 1],
						[0, 1, 1],
					],
					[
						[0, 1, 1],
						[0, 0, 0],
						[1, 0, 1],
					],
					[
						[0, 1, 0],
						[0, 0, 0],
						[0, 1, 0],
					],
				],
			},
			9: {
				startState: [
					[1, 0, 0],
					[0, 0, 1],
					[0, 0, 0],
				],
				templates: [
					[
						[1, 1, 1],
						[0, 0, 0],
						[1, 0, 1],
					],
					[
						[0, 1, 0],
						[0, 1, 1],
						[1, 1, 0],
					],
					[
						[0, 1, 0],
						[1, 0, 0],
						[0, 1, 0],
					],
				],
			},
			10: {
				startState: [
					[0, 1, 0],
					[0, 0, 1],
					[0, 1, 0],
				],
				templates: [
					[
						[1, 0, 0],
						[1, 0, 1],
						[1, 0, 0],
					],
					[
						[1, 0, 0],
						[1, 0, 0],
						[1, 0, 1],
					],
					[
						[1, 0, 1],
						[0, 1, 0],
						[1, 0, 0],
					],
				],
			},
		},
	},
	{
		name: 'Medium',
		slug: 'medium',
		access: 'free',
		puzzles: {
			10: {
				startState: [
					[0, 0, 1],
					[0, 0, 0],
					[0, 1, 1],
				],
				templates: [
					[
						[0, 1, 0],
						[0, 1, 0],
						[0, 1, 0],
					],
					[
						[1, 1, 0],
						[0, 0, 0],
						[0, 1, 1],
					],
					[
						[1, 0, 1],
						[1, 0, 1],
						[0, 1, 0],
					],
				],
			},
			15: {
				startState: [
					[1, 0, 1],
					[0, 1, 1],
					[1, 0, 1],
				],
				templates: [
					[
						[0, 0, 0],
						[0, 0, 1],
						[1, 0, 0],
					],
					[
						[0, 0, 0],
						[1, 1, 0],
						[0, 1, 1],
					],
					[
						[0, 1, 1],
						[0, 0, 0],
						[1, 0, 0],
					],
				],
			},
		},
	},
	{
		name: 'Hard in 3',
		slug: 'hard-in-3',
		access: 'paid',
		puzzles: {
			1: {
				startState: [
					[0, 0, 0],
					[0, 0, 0],
					[0, 0, 1],
				],
				templates: [
					[
						[0, 1, 1],
						[1, 0, 1],
						[1, 0, 0],
					],
					[
						[1, 0, 0],
						[1, 1, 1],
						[1, 0, 1],
					],
				],
			},
		},
	},
];

/**
 * Finds a pack definition by its slug.
 */
export function getPackBySlug(slug: string): PackDefinition | undefined {
	return packs.find((p) => p.slug === slug);
}

/**
 * Retrieves a specific puzzle config from a pack by puzzle ID.
 * Returns a deep clone to prevent mutation of the source data.
 */
export function getPuzzleById(packSlug: string, puzzleId: number) {
	const pack = getPackBySlug(packSlug);
	const config = pack?.puzzles[puzzleId];
	if (!config) return undefined;
	return JSON.parse(JSON.stringify(config)) as typeof config;
}

/**
 * Returns the next puzzle ID in a pack after the given ID, or null if it's the last.
 */
export function getNextPuzzleId(packSlug: string, currentId: number): number | null {
	const pack = getPackBySlug(packSlug);
	if (!pack) return null;
	const ids = Object.keys(pack.puzzles).map(Number).sort((a, b) => a - b);
	const idx = ids.indexOf(currentId);
	if (idx === -1 || idx === ids.length - 1) return null;
	return ids[idx + 1];
}

/**
 * Returns the total number of puzzles in a pack.
 */
export function getPackPuzzleCount(packSlug: string): number {
	return Object.keys(getPackBySlug(packSlug)?.puzzles ?? {}).length;
}
