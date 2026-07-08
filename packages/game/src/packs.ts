/**
 * Static pack and puzzle data — used only by packages/db/seed.ts.
 * At runtime, pack and puzzle data is served from the database.
 */

import type { PackDefinition, PuzzleConfig } from './types.js';
import { animalPack } from './puzzles/monkey.js';
import { firstStepsPack } from './puzzles/firstSteps.js';
import { simpleMonoDevPack } from './puzzles/simpleMonoDev.js';

export const packs: PackDefinition[] = [
  {
    "name": "Tutorial (Auto)",
    "slug": "tutorial-auto",
    "access": "free",
    "puzzles": {
      "1": {
        "startState": [
          [
            0,
            0,
            1
          ],
          [
            0,
            0,
            1
          ],
          [
            1,
            1,
            0
          ]
        ],
        "templates": [
          {
            "shape": [
              [
                1,
                1
              ],
              [
                1,
                1
              ]
            ]
          },
          {
            "shape": [
              [
                0,
                0,
                0
              ],
              [
                1,
                1,
                1
              ],
              [
                0,
                0,
                1
              ]
            ]
          }
        ],
        "solvedValue": 0,
        "minMovesToSolve": 2
      },
      "2": {
        "startState": [
          [
            1,
            0,
            0
          ],
          [
            0,
            1,
            1
          ],
          [
            0,
            1,
            1
          ]
        ],
        "templates": [
          {
            "shape": [
              [
                1,
                1
              ],
              [
                1,
                1
              ]
            ]
          },
          {
            "shape": [
              [
                1,
                1,
                0
              ],
              [
                0,
                0,
                0
              ],
              [
                1,
                1,
                1
              ]
            ]
          }
        ],
        "solvedValue": 0,
        "minMovesToSolve": 2
      },
      "3": {
        "startState": [
          [
            0,
            0,
            1
          ],
          [
            1,
            1,
            1
          ],
          [
            0,
            0,
            0
          ]
        ],
        "templates": [
          {
            "shape": [
              [
                1,
                1
              ],
              [
                1,
                1
              ]
            ]
          },
          {
            "shape": [
              [
                1,
                0,
                0
              ],
              [
                1,
                0,
                0
              ],
              [
                0,
                1,
                1
              ]
            ]
          }
        ],
        "solvedValue": 0,
        "minMovesToSolve": 2
      },
      "4": {
        "startState": [
          [
            1,
            1,
            1
          ],
          [
            1,
            1,
            0
          ],
          [
            0,
            0,
            0
          ]
        ],
        "templates": [
          {
            "shape": [
              [
                1,
                1
              ],
              [
                1,
                1
              ]
            ]
          },
          {
            "shape": [
              [
                0,
                0,
                0
              ],
              [
                1,
                0,
                1
              ],
              [
                0,
                0,
                1
              ]
            ]
          }
        ],
        "solvedValue": 0,
        "minMovesToSolve": 2
      },
      "5": {
        "startState": [
          [
            1,
            0,
            0
          ],
          [
            0,
            0,
            0
          ],
          [
            1,
            0,
            1
          ]
        ],
        "templates": [
          {
            "shape": [
              [
                1,
                1
              ],
              [
                1,
                1
              ]
            ]
          },
          {
            "shape": [
              [
                0,
                1,
                0
              ],
              [
                0,
                1,
                1
              ],
              [
                1,
                0,
                1
              ]
            ]
          }
        ],
        "solvedValue": 0,
        "minMovesToSolve": 2
      }
    }
  },
  {
    "name": "Easy (Auto)",
    "slug": "easy-auto",
    "access": "free",
    "puzzles": {
      "1": {
        "startState": [
          [
            1,
            0,
            0
          ],
          [
            1,
            0,
            0
          ],
          [
            0,
            0,
            1
          ]
        ],
        "templates": [
          {
            "shape": [
              [
                1,
                1
              ],
              [
                1,
                1
              ]
            ]
          },
          {
            "shape": [
              [
                1,
                0,
                0
              ],
              [
                0,
                1,
                0
              ],
              [
                1,
                1,
                0
              ]
            ]
          },
          {
            "shape": [
              [
                1,
                0,
                1
              ],
              [
                1,
                0,
                1
              ],
              [
                1,
                1,
                1
              ]
            ]
          }
        ],
        "solvedValue": 0,
        "minMovesToSolve": 3
      },
      "2": {
        "startState": [
          [
            1,
            0,
            1
          ],
          [
            1,
            0,
            1
          ],
          [
            0,
            0,
            1
          ]
        ],
        "templates": [
          {
            "shape": [
              [
                1,
                1
              ],
              [
                1,
                1
              ]
            ]
          },
          {
            "shape": [
              [
                0,
                0,
                1
              ],
              [
                0,
                0,
                0
              ],
              [
                1,
                0,
                1
              ]
            ]
          },
          {
            "shape": [
              [
                0,
                0,
                1
              ],
              [
                1,
                1,
                0
              ],
              [
                0,
                0,
                0
              ]
            ]
          }
        ],
        "solvedValue": 0,
        "minMovesToSolve": 3
      },
      "3": {
        "startState": [
          [
            1,
            1,
            1
          ],
          [
            0,
            0,
            0
          ],
          [
            0,
            1,
            1
          ]
        ],
        "templates": [
          {
            "shape": [
              [
                1,
                1
              ],
              [
                1,
                1
              ]
            ]
          },
          {
            "shape": [
              [
                0,
                1,
                1
              ],
              [
                0,
                1,
                0
              ],
              [
                1,
                1,
                1
              ]
            ]
          },
          {
            "shape": [
              [
                1,
                1,
                1
              ],
              [
                1,
                0,
                0
              ],
              [
                0,
                0,
                1
              ]
            ]
          }
        ],
        "solvedValue": 0,
        "minMovesToSolve": 3
      },
      "4": {
        "startState": [
          [
            0,
            0,
            0
          ],
          [
            0,
            1,
            0
          ],
          [
            1,
            0,
            0
          ]
        ],
        "templates": [
          {
            "shape": [
              [
                1,
                1
              ],
              [
                1,
                1
              ]
            ]
          },
          {
            "shape": [
              [
                0,
                1,
                0
              ],
              [
                0,
                1,
                0
              ],
              [
                0,
                1,
                1
              ]
            ]
          },
          {
            "shape": [
              [
                1,
                0,
                1
              ],
              [
                0,
                1,
                0
              ],
              [
                0,
                0,
                0
              ]
            ]
          }
        ],
        "solvedValue": 0,
        "minMovesToSolve": 3
      },
      "5": {
        "startState": [
          [
            1,
            1,
            0
          ],
          [
            1,
            1,
            0
          ],
          [
            1,
            0,
            0
          ]
        ],
        "templates": [
          {
            "shape": [
              [
                1,
                1
              ],
              [
                1,
                1
              ]
            ]
          },
          {
            "shape": [
              [
                0,
                1,
                1
              ],
              [
                0,
                0,
                1
              ],
              [
                1,
                0,
                1
              ]
            ]
          },
          {
            "shape": [
              [
                0,
                1,
                1
              ],
              [
                1,
                0,
                0
              ],
              [
                1,
                0,
                0
              ]
            ]
          }
        ],
        "solvedValue": 0,
        "minMovesToSolve": 3
      }
    }
  },
  {
    "name": "Medium (Auto)",
    "slug": "medium-auto",
    "access": "free",
    "puzzles": {
      "1": {
        "startState": [
          [
            1,
            1,
            0
          ],
          [
            0,
            0,
            1
          ],
          [
            0,
            0,
            1
          ]
        ],
        "templates": [
          {
            "shape": [
              [
                1,
                1
              ],
              [
                1,
                1
              ]
            ]
          },
          {
            "shape": [
              [
                1,
                0,
                0
              ],
              [
                1,
                0,
                0
              ],
              [
                0,
                0,
                0
              ]
            ]
          },
          {
            "shape": [
              [
                1,
                1,
                0
              ],
              [
                0,
                1,
                0
              ],
              [
                1,
                0,
                0
              ]
            ]
          }
        ],
        "solvedValue": 0,
        "minMovesToSolve": 3
      },
      "2": {
        "startState": [
          [
            0,
            1,
            1
          ],
          [
            1,
            1,
            1
          ],
          [
            0,
            0,
            1
          ]
        ],
        "templates": [
          {
            "shape": [
              [
                1,
                1
              ],
              [
                1,
                1
              ]
            ]
          },
          {
            "shape": [
              [
                1,
                0,
                1
              ],
              [
                1,
                0,
                0
              ],
              [
                0,
                0,
                0
              ]
            ]
          },
          {
            "shape": [
              [
                1,
                0,
                1
              ],
              [
                0,
                1,
                1
              ],
              [
                0,
                0,
                0
              ]
            ]
          }
        ],
        "solvedValue": 0,
        "minMovesToSolve": 3
      },
      "3": {
        "startState": [
          [
            1,
            0,
            0
          ],
          [
            1,
            1,
            1
          ],
          [
            0,
            0,
            0
          ]
        ],
        "templates": [
          {
            "shape": [
              [
                1,
                1
              ],
              [
                1,
                1
              ]
            ]
          },
          {
            "shape": [
              [
                1,
                0,
                1
              ],
              [
                1,
                0,
                1
              ],
              [
                0,
                0,
                1
              ]
            ]
          },
          {
            "shape": [
              [
                1,
                1,
                0
              ],
              [
                1,
                0,
                0
              ],
              [
                1,
                0,
                1
              ]
            ]
          }
        ],
        "solvedValue": 0,
        "minMovesToSolve": 3
      },
      "4": {
        "startState": [
          [
            0,
            1,
            0
          ],
          [
            1,
            1,
            0
          ],
          [
            1,
            0,
            0
          ]
        ],
        "templates": [
          {
            "shape": [
              [
                1,
                1
              ],
              [
                1,
                1
              ]
            ]
          },
          {
            "shape": [
              [
                0,
                1,
                0
              ],
              [
                0,
                0,
                0
              ],
              [
                0,
                0,
                1
              ]
            ]
          },
          {
            "shape": [
              [
                0,
                0,
                0
              ],
              [
                1,
                0,
                0
              ],
              [
                0,
                1,
                0
              ]
            ]
          }
        ],
        "solvedValue": 0,
        "minMovesToSolve": 3
      },
      "5": {
        "startState": [
          [
            1,
            0,
            0
          ],
          [
            0,
            1,
            0
          ],
          [
            0,
            1,
            0
          ]
        ],
        "templates": [
          {
            "shape": [
              [
                1,
                1
              ],
              [
                1,
                1
              ]
            ]
          },
          {
            "shape": [
              [
                1,
                0,
                0
              ],
              [
                0,
                1,
                0
              ],
              [
                1,
                1,
                0
              ]
            ]
          },
          {
            "shape": [
              [
                0,
                1,
                0
              ],
              [
                0,
                1,
                0
              ],
              [
                1,
                1,
                1
              ]
            ]
          }
        ],
        "solvedValue": 0,
        "minMovesToSolve": 3
      }
    }
  },
  {
    "name": "Hard (Auto)",
    "slug": "hard-auto",
    "access": "paid",
    "puzzles": {
      "1": {
        "startState": [
          [
            0,
            0,
            0
          ],
          [
            1,
            0,
            1
          ],
          [
            1,
            0,
            1
          ]
        ],
        "templates": [
          {
            "shape": [
              [
                0,
                0,
                0
              ],
              [
                0,
                0,
                1
              ],
              [
                1,
                1,
                0
              ]
            ]
          },
          {
            "shape": [
              [
                1,
                1,
                0
              ],
              [
                1,
                0,
                0
              ],
              [
                1,
                0,
                0
              ]
            ]
          },
          {
            "shape": [
              [
                1,
                0,
                0
              ],
              [
                1,
                1,
                1
              ],
              [
                1,
                0,
                1
              ]
            ]
          }
        ],
        "solvedValue": 0,
        "minMovesToSolve": 4
      },
      "2": {
        "startState": [
          [
            0,
            1,
            0
          ],
          [
            1,
            1,
            1
          ],
          [
            0,
            1,
            0
          ]
        ],
        "templates": [
          {
            "shape": [
              [
                1,
                1,
                1
              ],
              [
                1,
                1,
                0
              ],
              [
                1,
                1,
                0
              ]
            ]
          },
          {
            "shape": [
              [
                1,
                1,
                0
              ],
              [
                0,
                0,
                1
              ],
              [
                0,
                1,
                0
              ]
            ]
          },
          {
            "shape": [
              [
                1,
                0,
                1
              ],
              [
                1,
                1,
                1
              ],
              [
                1,
                0,
                1
              ]
            ]
          }
        ],
        "solvedValue": 0,
        "minMovesToSolve": 4
      },
      "3": {
        "startState": [
          [
            1,
            0,
            0
          ],
          [
            0,
            1,
            0
          ],
          [
            1,
            0,
            0
          ]
        ],
        "templates": [
          {
            "shape": [
              [
                1,
                1,
                0
              ],
              [
                1,
                1,
                1
              ],
              [
                0,
                1,
                0
              ]
            ]
          },
          {
            "shape": [
              [
                1,
                0,
                1
              ],
              [
                0,
                1,
                1
              ],
              [
                0,
                1,
                0
              ]
            ]
          },
          {
            "shape": [
              [
                1,
                0,
                1
              ],
              [
                1,
                0,
                0
              ],
              [
                0,
                1,
                0
              ]
            ]
          }
        ],
        "solvedValue": 0,
        "minMovesToSolve": 4
      },
      "4": {
        "startState": [
          [
            1,
            0,
            1
          ],
          [
            0,
            0,
            0
          ],
          [
            0,
            0,
            0
          ]
        ],
        "templates": [
          {
            "shape": [
              [
                1,
                0,
                1
              ],
              [
                0,
                0,
                0
              ],
              [
                1,
                1,
                0
              ]
            ]
          },
          {
            "shape": [
              [
                0,
                1,
                1
              ],
              [
                0,
                1,
                0
              ],
              [
                0,
                1,
                0
              ]
            ]
          },
          {
            "shape": [
              [
                0,
                1,
                0
              ],
              [
                0,
                0,
                1
              ],
              [
                1,
                0,
                1
              ]
            ]
          }
        ],
        "solvedValue": 0,
        "minMovesToSolve": 4
      },
      "5": {
        "startState": [
          [
            1,
            1,
            0
          ],
          [
            0,
            0,
            0
          ],
          [
            1,
            1,
            0
          ]
        ],
        "templates": [
          {
            "shape": [
              [
                1,
                0,
                1
              ],
              [
                0,
                0,
                0
              ],
              [
                1,
                0,
                1
              ]
            ]
          },
          {
            "shape": [
              [
                0,
                0,
                0
              ],
              [
                1,
                0,
                1
              ],
              [
                1,
                0,
                0
              ]
            ]
          },
          {
            "shape": [
              [
                1,
                1,
                0
              ],
              [
                1,
                0,
                0
              ],
              [
                1,
                0,
                1
              ]
            ]
          }
        ],
        "solvedValue": 0,
        "minMovesToSolve": 4
      }
    }
  },
  {
    "name": "Expert (Auto)",
    "slug": "expert-auto",
    "access": "paid",
    "puzzles": {
      "1": {
        "startState": [
          [
            1,
            1,
            0
          ],
          [
            1,
            1,
            0
          ],
          [
            1,
            1,
            0
          ]
        ],
        "templates": [
          {
            "shape": [
              [
                0,
                1,
                1
              ],
              [
                1,
                1,
                0
              ],
              [
                0,
                1,
                1
              ]
            ]
          },
          {
            "shape": [
              [
                0,
                1,
                1
              ],
              [
                1,
                0,
                0
              ],
              [
                1,
                0,
                1
              ]
            ]
          },
          {
            "shape": [
              [
                1,
                1,
                1
              ],
              [
                0,
                0,
                1
              ],
              [
                0,
                0,
                1
              ]
            ]
          }
        ],
        "solvedValue": 0,
        "minMovesToSolve": 5
      },
      "2": {
        "startState": [
          [
            1,
            0,
            0
          ],
          [
            1,
            0,
            0
          ],
          [
            0,
            0,
            0
          ]
        ],
        "templates": [
          {
            "shape": [
              [
                1,
                1,
                1
              ],
              [
                1,
                0,
                1
              ],
              [
                1,
                1,
                0
              ]
            ]
          },
          {
            "shape": [
              [
                1,
                1,
                1
              ],
              [
                0,
                1,
                1
              ],
              [
                1,
                1,
                0
              ]
            ]
          },
          {
            "shape": [
              [
                1,
                1,
                0
              ],
              [
                0,
                1,
                0
              ],
              [
                1,
                1,
                1
              ]
            ]
          }
        ],
        "solvedValue": 0,
        "minMovesToSolve": 5
      },
      "3": {
        "startState": [
          [
            1,
            0,
            1
          ],
          [
            1,
            1,
            1
          ],
          [
            1,
            0,
            0
          ]
        ],
        "templates": [
          {
            "shape": [
              [
                1,
                0,
                0
              ],
              [
                1,
                1,
                0
              ],
              [
                1,
                0,
                0
              ]
            ]
          },
          {
            "shape": [
              [
                1,
                0,
                0
              ],
              [
                1,
                0,
                1
              ],
              [
                1,
                0,
                1
              ]
            ]
          },
          {
            "shape": [
              [
                0,
                1,
                1
              ],
              [
                1,
                0,
                0
              ],
              [
                1,
                1,
                0
              ]
            ]
          }
        ],
        "solvedValue": 0,
        "minMovesToSolve": 5
      },
      "4": {
        "startState": [
          [
            1,
            0,
            0
          ],
          [
            0,
            0,
            0
          ],
          [
            1,
            0,
            1
          ]
        ],
        "templates": [
          {
            "shape": [
              [
                0,
                0,
                1
              ],
              [
                0,
                0,
                0
              ],
              [
                1,
                1,
                0
              ]
            ]
          },
          {
            "shape": [
              [
                0,
                0,
                0
              ],
              [
                1,
                1,
                1
              ],
              [
                0,
                1,
                1
              ]
            ]
          },
          {
            "shape": [
              [
                1,
                0,
                1
              ],
              [
                0,
                1,
                0
              ],
              [
                0,
                0,
                0
              ]
            ]
          }
        ],
        "solvedValue": 0,
        "minMovesToSolve": 5
      },
      "5": {
        "startState": [
          [
            1,
            0,
            0
          ],
          [
            1,
            1,
            0
          ],
          [
            1,
            0,
            0
          ]
        ],
        "templates": [
          {
            "shape": [
              [
                1,
                0,
                0
              ],
              [
                1,
                0,
                1
              ],
              [
                0,
                0,
                0
              ]
            ]
          },
          {
            "shape": [
              [
                1,
                0,
                1
              ],
              [
                0,
                1,
                0
              ],
              [
                1,
                1,
                1
              ]
            ]
          },
          {
            "shape": [
              [
                0,
                0,
                1
              ],
              [
                1,
                1,
                1
              ],
              [
                1,
                0,
                0
              ]
            ]
          }
        ],
        "solvedValue": 0,
        "minMovesToSolve": 5
      }
    }
  },
  {
    "name": "Color Spectrum",
    "slug": "color-spectrum",
    "access": "free",
    "puzzles": {
      "1": {
        "startState": [
          [
            0,
            0,
            2
          ],
          [
            2,
            0,
            2
          ],
          [
            2,
            0,
            0
          ]
        ],
        "templates": [
          {
            "shape": [
              [
                0,
                2,
                2
              ],
              [
                0,
                2,
                0
              ],
              [
                0,
                0,
                2
              ]
            ]
          },
          {
            "shape": [
              [
                2,
                0,
                2
              ],
              [
                0,
                2,
                0
              ],
              [
                0,
                2,
                0
              ]
            ]
          }
        ],
        "solvedValue": 0,
        "minMovesToSolve": 2
      },
      "2": {
        "startState": [
          [
            0,
            1,
            0
          ],
          [
            0,
            0,
            0
          ],
          [
            0,
            0,
            0
          ]
        ],
        "templates": [
          {
            "shape": [
              [
                1,
                1
              ],
              [
                1,
                0
              ]
            ]
          },
          {
            "shape": [
              [
                0,
                0
              ],
              [
                0,
                0
              ],
              [
                1,
                1
              ]
            ]
          }
        ],
        "solvedValue": 0,
        "minMovesToSolve": 2
      },
      "3": {
        "startState": [
          [
            0,
            0,
            4
          ],
          [
            0,
            4,
            4
          ],
          [
            0,
            4,
            0
          ]
        ],
        "templates": [
          {
            "shape": [
              [
                4,
                0
              ],
              [
                4,
                0
              ]
            ]
          },
          {
            "shape": [
              [
                4,
                0,
                0
              ],
              [
                0,
                0,
                4
              ]
            ]
          }
        ],
        "solvedValue": 0,
        "minMovesToSolve": 2
      },
      "4": {
        "startState": [
          [
            0,
            3,
            3
          ],
          [
            0,
            0,
            0
          ],
          [
            0,
            0,
            3
          ]
        ],
        "templates": [
          {
            "shape": [
              [
                3,
                3,
                0
              ],
              [
                0,
                0,
                3
              ]
            ]
          },
          {
            "shape": [
              [
                0,
                3,
                0
              ],
              [
                0,
                0,
                0
              ],
              [
                3,
                0,
                0
              ]
            ]
          },
          {
            "shape": [
              [
                0,
                3
              ],
              [
                3,
                3
              ]
            ]
          }
        ],
        "solvedValue": 0,
        "minMovesToSolve": 3
      },
      "5": {
        "startState": [
          [
            6,
            0,
            6
          ],
          [
            0,
            0,
            0
          ],
          [
            0,
            6,
            0
          ]
        ],
        "templates": [
          {
            "shape": [
              [
                6,
                6,
                6
              ],
              [
                6,
                6,
                0
              ],
              [
                6,
                0,
                0
              ]
            ]
          },
          {
            "shape": [
              [
                6,
                6,
                0
              ],
              [
                6,
                0,
                6
              ],
              [
                6,
                6,
                6
              ]
            ]
          },
          {
            "shape": [
              [
                6,
                6,
                0
              ],
              [
                6,
                6,
                6
              ],
              [
                0,
                0,
                6
              ]
            ]
          }
        ],
        "solvedValue": 0,
        "minMovesToSolve": 3
      },
      "6": {
        "startState": [
          [
            0,
            0,
            0
          ],
          [
            0,
            0,
            0
          ],
          [
            5,
            0,
            0
          ]
        ],
        "templates": [
          {
            "shape": [
              [
                5,
                0
              ],
              [
                5,
                5
              ],
              [
                5,
                0
              ]
            ]
          },
          {
            "shape": [
              [
                5,
                5,
                5
              ],
              [
                0,
                0,
                5
              ],
              [
                5,
                5,
                5
              ]
            ]
          },
          {
            "shape": [
              [
                0,
                0
              ],
              [
                5,
                5
              ],
              [
                5,
                5
              ]
            ]
          }
        ],
        "solvedValue": 0,
        "minMovesToSolve": 3
      },
      "7": {
        "startState": [
          [
            3,
            0,
            1
          ],
          [
            3,
            3,
            0
          ],
          [
            1,
            3,
            1
          ]
        ],
        "templates": [
          {
            "shape": [
              [
                1,
                0,
                0
              ],
              [
                1,
                1,
                0
              ]
            ]
          },
          {
            "shape": [
              [
                0,
                1,
                1
              ],
              [
                1,
                0,
                0
              ],
              [
                1,
                0,
                0
              ]
            ]
          },
          {
            "shape": [
              [
                2,
                0,
                2
              ],
              [
                0,
                2,
                0
              ],
              [
                2,
                0,
                2
              ]
            ]
          },
          {
            "shape": [
              [
                2,
                1
              ],
              [
                0,
                2
              ],
              [
                0,
                0
              ]
            ]
          }
        ],
        "solvedValue": 0,
        "minMovesToSolve": 4
      },
      "8": {
        "startState": [
          [
            1,
            6,
            1
          ],
          [
            4,
            1,
            2
          ],
          [
            1,
            1,
            0
          ]
        ],
        "templates": [
          {
            "shape": [
              [
                1,
                1
              ],
              [
                1,
                0
              ],
              [
                0,
                0
              ]
            ]
          },
          {
            "shape": [
              [
                1,
                0,
                1
              ],
              [
                1,
                0,
                1
              ],
              [
                1,
                0,
                0
              ]
            ]
          },
          {
            "shape": [
              [
                0,
                2,
                0
              ],
              [
                2,
                0,
                0
              ]
            ]
          },
          {
            "shape": [
              [
                2,
                2
              ],
              [
                2,
                2
              ]
            ]
          },
          {
            "shape": [
              [
                0,
                0
              ],
              [
                4,
                4
              ],
              [
                0,
                0
              ]
            ]
          },
          {
            "shape": [
              [
                4,
                0,
                0
              ],
              [
                2,
                0,
                0
              ],
              [
                2,
                0,
                2
              ]
            ]
          }
        ],
        "solvedValue": 0,
        "minMovesToSolve": 6
      },
      "9": {
        "startState": [
          [
            0,
            6,
            0
          ],
          [
            0,
            0,
            3
          ],
          [
            3,
            3,
            5
          ]
        ],
        "templates": [
          {
            "shape": [
              [
                3,
                3
              ],
              [
                3,
                0
              ],
              [
                0,
                0
              ]
            ]
          },
          {
            "shape": [
              [
                3,
                3
              ],
              [
                0,
                0
              ],
              [
                3,
                0
              ]
            ]
          },
          {
            "shape": [
              [
                5,
                5,
                5
              ],
              [
                0,
                0,
                0
              ]
            ]
          },
          {
            "shape": [
              [
                5,
                5
              ],
              [
                5,
                5
              ]
            ]
          },
          {
            "shape": [
              [
                0,
                0,
                0
              ],
              [
                0,
                0,
                6
              ],
              [
                0,
                5,
                0
              ]
            ]
          },
          {
            "shape": [
              [
                0,
                6,
                5
              ],
              [
                5,
                5,
                0
              ]
            ]
          }
        ],
        "solvedValue": 0,
        "minMovesToSolve": 6
      },
      "10": {
        "startState": [
          [
            4,
            0,
            6
          ],
          [
            5,
            1,
            5
          ],
          [
            6,
            3,
            7
          ]
        ],
        "templates": [
          {
            "shape": [
              [
                1,
                0,
                0
              ],
              [
                0,
                1,
                0
              ],
              [
                0,
                0,
                1
              ]
            ]
          },
          {
            "shape": [
              [
                1,
                0
              ],
              [
                1,
                0
              ],
              [
                0,
                1
              ]
            ]
          },
          {
            "shape": [
              [
                0,
                0
              ],
              [
                3,
                3
              ],
              [
                3,
                3
              ]
            ]
          },
          {
            "shape": [
              [
                0,
                0,
                0
              ],
              [
                0,
                0,
                3
              ],
              [
                3,
                0,
                3
              ]
            ]
          },
          {
            "shape": [
              [
                6,
                0
              ],
              [
                3,
                0
              ],
              [
                6,
                0
              ]
            ]
          },
          {
            "shape": [
              [
                0,
                3,
                0
              ],
              [
                0,
                0,
                0
              ],
              [
                0,
                6,
                0
              ]
            ]
          }
        ],
        "solvedValue": 0,
        "minMovesToSolve": 6
      }
    }
  },
  {
    "name": "Chromatic Ascent",
    "slug": "chromatic-ascent",
    "access": "paid",
    "puzzles": {
      "1": {
        "startState": [
          [
            0,
            2,
            0
          ],
          [
            0,
            0,
            2
          ],
          [
            0,
            0,
            0
          ]
        ],
        "templates": [
          {
            "shape": [
              [
                0,
                0
              ],
              [
                2,
                2
              ],
              [
                0,
                0
              ]
            ]
          }
        ],
        "solvedValue": 0,
        "minMovesToSolve": 2
      },
      "2": {
        "startState": [
          [
            0,
            0,
            0
          ],
          [
            1,
            0,
            1
          ],
          [
            0,
            0,
            0
          ]
        ],
        "templates": [
          {
            "shape": [
              [
                0,
                1,
                0
              ],
              [
                0,
                1,
                0
              ]
            ]
          }
        ],
        "solvedValue": 0,
        "minMovesToSolve": 2
      },
      "3": {
        "startState": [
          [
            0,
            0,
            0
          ],
          [
            4,
            0,
            0
          ],
          [
            4,
            4,
            4
          ]
        ],
        "templates": [
          {
            "shape": [
              [
                4,
                4,
                0
              ],
              [
                0,
                0,
                0
              ]
            ]
          }
        ],
        "solvedValue": 0,
        "minMovesToSolve": 2
      },
      "4": {
        "startState": [
          [
            3,
            3,
            0
          ],
          [
            3,
            3,
            3
          ],
          [
            0,
            0,
            0
          ]
        ],
        "templates": [
          {
            "shape": [
              [
                3,
                0
              ],
              [
                3,
                3
              ]
            ]
          }
        ],
        "solvedValue": 0,
        "minMovesToSolve": 3
      },
      "5": {
        "startState": [
          [
            0,
            6,
            0
          ],
          [
            6,
            6,
            0
          ],
          [
            0,
            6,
            0
          ]
        ],
        "templates": [
          {
            "shape": [
              [
                0,
                6,
                0
              ],
              [
                0,
                6,
                0
              ]
            ]
          }
        ],
        "solvedValue": 0,
        "minMovesToSolve": 3
      },
      "6": {
        "startState": [
          [
            0,
            0,
            5
          ],
          [
            0,
            5,
            0
          ],
          [
            5,
            0,
            5
          ]
        ],
        "templates": [
          {
            "shape": [
              [
                5,
                0
              ],
              [
                0,
                5
              ],
              [
                0,
                0
              ]
            ]
          }
        ],
        "solvedValue": 0,
        "minMovesToSolve": 3
      },
      "7": {
        "startState": [
          [
            1,
            0,
            2
          ],
          [
            0,
            2,
            1
          ],
          [
            1,
            3,
            2
          ]
        ],
        "templates": [
          {
            "shape": [
              [
                1,
                0,
                0
              ],
              [
                0,
                1,
                1
              ]
            ]
          },
          {
            "shape": [
              [
                1,
                1
              ],
              [
                1,
                0
              ],
              [
                0,
                0
              ]
            ]
          },
          {
            "shape": [
              [
                0,
                0,
                2
              ],
              [
                0,
                2,
                2
              ],
              [
                0,
                0,
                0
              ]
            ]
          },
          {
            "shape": [
              [
                1,
                0,
                2
              ],
              [
                0,
                0,
                0
              ],
              [
                0,
                0,
                1
              ]
            ]
          }
        ],
        "solvedValue": 0,
        "minMovesToSolve": 4
      },
      "8": {
        "startState": [
          [
            7,
            7,
            5
          ],
          [
            6,
            5,
            7
          ],
          [
            0,
            7,
            2
          ]
        ],
        "templates": [
          {
            "shape": [
              [
                0,
                0,
                0
              ],
              [
                1,
                1,
                1
              ],
              [
                0,
                1,
                1
              ]
            ]
          },
          {
            "shape": [
              [
                0,
                1,
                1
              ],
              [
                0,
                0,
                0
              ],
              [
                1,
                1,
                0
              ]
            ]
          },
          {
            "shape": [
              [
                2,
                0,
                0
              ],
              [
                0,
                0,
                2
              ],
              [
                2,
                0,
                2
              ]
            ]
          },
          {
            "shape": [
              [
                2,
                2
              ],
              [
                2,
                0
              ],
              [
                2,
                2
              ]
            ]
          },
          {
            "shape": [
              [
                0,
                0,
                0
              ],
              [
                4,
                4,
                0
              ],
              [
                4,
                4,
                4
              ]
            ]
          },
          {
            "shape": [
              [
                0,
                0,
                4
              ],
              [
                0,
                4,
                0
              ],
              [
                1,
                0,
                4
              ]
            ]
          }
        ],
        "solvedValue": 0,
        "minMovesToSolve": 6
      },
      "9": {
        "startState": [
          [
            3,
            6,
            5
          ],
          [
            0,
            3,
            5
          ],
          [
            6,
            0,
            0
          ]
        ],
        "templates": [
          {
            "shape": [
              [
                3,
                0,
                0
              ],
              [
                3,
                0,
                3
              ]
            ]
          },
          {
            "shape": [
              [
                3,
                3,
                0
              ],
              [
                0,
                0,
                3
              ]
            ]
          },
          {
            "shape": [
              [
                5,
                0,
                5
              ],
              [
                0,
                5,
                0
              ]
            ]
          },
          {
            "shape": [
              [
                5,
                0,
                5
              ],
              [
                5,
                0,
                0
              ]
            ]
          },
          {
            "shape": [
              [
                6,
                5
              ],
              [
                5,
                6
              ]
            ]
          },
          {
            "shape": [
              [
                0,
                0,
                0
              ],
              [
                6,
                3,
                0
              ]
            ]
          }
        ],
        "solvedValue": 0,
        "minMovesToSolve": 6
      },
      "10": {
        "startState": [
          [
            3,
            5,
            4
          ],
          [
            6,
            0,
            1
          ],
          [
            3,
            6,
            1
          ]
        ],
        "templates": [
          {
            "shape": [
              [
                0,
                1
              ],
              [
                1,
                1
              ],
              [
                1,
                0
              ]
            ]
          },
          {
            "shape": [
              [
                0,
                1,
                1
              ],
              [
                0,
                0,
                0
              ]
            ]
          },
          {
            "shape": [
              [
                0,
                4
              ],
              [
                0,
                0
              ],
              [
                4,
                4
              ]
            ]
          },
          {
            "shape": [
              [
                4,
                4
              ],
              [
                4,
                4
              ]
            ]
          },
          {
            "shape": [
              [
                6,
                1,
                0
              ],
              [
                6,
                0,
                0
              ]
            ]
          },
          {
            "shape": [
              [
                0,
                0,
                6
              ],
              [
                4,
                0,
                6
              ]
            ]
          }
        ],
        "solvedValue": 0,
        "minMovesToSolve": 6
      }
    }
  },
  {
    "name": "4×4 Grid (Dev)",
    "slug": "grid-4x4-dev",
    "access": "free",
    "puzzles": {
      "1": {
        "startState": [
          [
            0,
            1,
            1,
            0
          ],
          [
            1,
            0,
            1,
            0
          ],
          [
            1,
            0,
            1,
            0
          ],
          [
            0,
            0,
            0,
            0
          ]
        ],
        "templates": [
          {
            "shape": [
              [
                1,
                1
              ],
              [
                1,
                1
              ]
            ]
          },
          {
            "shape": [
              [
                1,
                1,
                1
              ],
              [
                1,
                0,
                0
              ],
              [
                0,
                1,
                1
              ]
            ]
          },
          {
            "shape": [
              [
                0,
                1,
                1
              ],
              [
                0,
                1,
                0
              ],
              [
                0,
                0,
                1
              ]
            ]
          }
        ],
        "solvedValue": 0,
        "minMovesToSolve": 1
      },
      "2": {
        "startState": [
          [
            1,
            0,
            0,
            0
          ],
          [
            0,
            0,
            1,
            1
          ],
          [
            0,
            0,
            1,
            1
          ],
          [
            0,
            0,
            1,
            1
          ]
        ],
        "templates": [
          {
            "shape": [
              [
                1,
                1
              ],
              [
                1,
                1
              ]
            ]
          },
          {
            "shape": [
              [
                0,
                1,
                0
              ],
              [
                0,
                0,
                0
              ],
              [
                1,
                0,
                0
              ]
            ]
          },
          {
            "shape": [
              [
                0,
                0,
                1
              ],
              [
                0,
                1,
                0
              ],
              [
                1,
                0,
                0
              ]
            ]
          },
          {
            "shape": [
              [
                0,
                1,
                1
              ],
              [
                0,
                1,
                0
              ],
              [
                0,
                0,
                0
              ]
            ]
          }
        ],
        "solvedValue": 0,
        "minMovesToSolve": 3
      },
      "3": {
        "startState": [
          [
            0,
            0,
            0,
            1
          ],
          [
            0,
            0,
            1,
            1
          ],
          [
            0,
            0,
            1,
            0
          ],
          [
            1,
            1,
            1,
            0
          ]
        ],
        "templates": [
          {
            "shape": [
              [
                0,
                0,
                0
              ],
              [
                0,
                1,
                0
              ],
              [
                1,
                0,
                1
              ]
            ]
          },
          {
            "shape": [
              [
                1,
                1
              ],
              [
                1,
                1
              ]
            ]
          },
          {
            "shape": [
              [
                0,
                0,
                0
              ],
              [
                1,
                0,
                0
              ],
              [
                0,
                1,
                1
              ]
            ]
          },
          {
            "shape": [
              [
                0,
                1,
                0
              ],
              [
                0,
                1,
                1
              ],
              [
                1,
                1,
                0
              ]
            ]
          }
        ],
        "solvedValue": 0,
        "minMovesToSolve": 3
      },
      "4": {
        "startState": [
          [
            0,
            1,
            1,
            1
          ],
          [
            1,
            0,
            1,
            1
          ],
          [
            1,
            1,
            0,
            1
          ],
          [
            1,
            1,
            1,
            0
          ]
        ],
        "templates": [
          {
            "shape": [
              [
                1,
                0,
                1
              ],
              [
                0,
                0,
                1
              ],
              [
                1,
                1,
                1
              ]
            ]
          }
        ],
        "solvedValue": 0,
        "minMovesToSolve": 2
      },
      "5": {
        "startState": [
          [
            1,
            1,
            0,
            0
          ],
          [
            0,
            1,
            0,
            1
          ],
          [
            1,
            1,
            1,
            0
          ],
          [
            0,
            0,
            0,
            1
          ]
        ],
        "templates": [
          {
            "shape": [
              [
                1,
                1
              ],
              [
                1,
                1
              ]
            ]
          },
          {
            "shape": [
              [
                0,
                1,
                0
              ],
              [
                0,
                0,
                1
              ],
              [
                0,
                0,
                0
              ]
            ]
          },
          {
            "shape": [
              [
                0,
                0,
                0
              ],
              [
                0,
                0,
                1
              ],
              [
                1,
                0,
                0
              ]
            ]
          },
          {
            "shape": [
              [
                1,
                0,
                1
              ],
              [
                0,
                1,
                0
              ],
              [
                1,
                0,
                0
              ]
            ]
          }
        ],
        "solvedValue": 0,
        "minMovesToSolve": 3
      },
      "6": {
        "startState": [
          [
            0,
            1,
            1,
            0
          ],
          [
            1,
            1,
            0,
            1
          ],
          [
            0,
            0,
            1,
            0
          ],
          [
            0,
            1,
            1,
            0
          ]
        ],
        "templates": [
          {
            "shape": [
              [
                1,
                0,
                1
              ],
              [
                1,
                0,
                0
              ],
              [
                0,
                1,
                0
              ]
            ]
          },
          {
            "shape": [
              [
                1,
                1
              ],
              [
                1,
                1
              ]
            ]
          },
          {
            "shape": [
              [
                0,
                0,
                0
              ],
              [
                1,
                0,
                1
              ],
              [
                1,
                1,
                0
              ]
            ]
          }
        ],
        "solvedValue": 0,
        "minMovesToSolve": 3
      },
      "7": {
        "startState": [
          [
            1,
            0,
            1,
            0
          ],
          [
            1,
            0,
            1,
            0
          ],
          [
            1,
            1,
            1,
            0
          ],
          [
            1,
            1,
            0,
            1
          ]
        ],
        "templates": [
          {
            "shape": [
              [
                1,
                0,
                1
              ],
              [
                0,
                1,
                0
              ],
              [
                1,
                0,
                0
              ]
            ]
          },
          {
            "shape": [
              [
                1,
                0,
                0
              ],
              [
                1,
                0,
                0
              ],
              [
                1,
                1,
                0
              ]
            ]
          }
        ],
        "solvedValue": 0,
        "minMovesToSolve": 3
      },
      "8": {
        "startState": [
          [
            1,
            1,
            1,
            0
          ],
          [
            1,
            0,
            1,
            1
          ],
          [
            1,
            1,
            0,
            1
          ],
          [
            0,
            0,
            1,
            0
          ]
        ],
        "templates": [
          {
            "shape": [
              [
                1,
                0,
                0
              ],
              [
                0,
                0,
                1
              ],
              [
                1,
                1,
                0
              ]
            ]
          },
          {
            "shape": [
              [
                1,
                1
              ],
              [
                1,
                1
              ]
            ]
          },
          {
            "shape": [
              [
                0,
                0,
                1
              ],
              [
                1,
                1,
                1
              ],
              [
                0,
                0,
                1
              ]
            ]
          }
        ],
        "solvedValue": 0,
        "minMovesToSolve": 3
      },
      "9": {
        "startState": [
          [
            0,
            1,
            0,
            0
          ],
          [
            0,
            0,
            1,
            0
          ],
          [
            1,
            0,
            1,
            0
          ],
          [
            1,
            0,
            1,
            0
          ]
        ],
        "templates": [
          {
            "shape": [
              [
                0,
                0,
                1
              ],
              [
                0,
                1,
                0
              ],
              [
                0,
                1,
                1
              ]
            ]
          },
          {
            "shape": [
              [
                1,
                1
              ],
              [
                1,
                1
              ]
            ]
          }
        ],
        "solvedValue": 0,
        "minMovesToSolve": 3
      },
      "10": {
        "startState": [
          [
            1,
            0,
            1,
            0
          ],
          [
            0,
            0,
            0,
            0
          ],
          [
            1,
            0,
            0,
            1
          ],
          [
            1,
            1,
            0,
            0
          ]
        ],
        "templates": [
          {
            "shape": [
              [
                1,
                1
              ],
              [
                1,
                1
              ]
            ]
          },
          {
            "shape": [
              [
                1,
                0,
                0
              ],
              [
                0,
                1,
                1
              ],
              [
                0,
                1,
                0
              ]
            ]
          }
        ],
        "solvedValue": 0,
        "minMovesToSolve": 3
      },
      "11": {
        "startState": [
          [
            0,
            0,
            1,
            0
          ],
          [
            1,
            1,
            1,
            1
          ],
          [
            1,
            0,
            0,
            0
          ],
          [
            0,
            1,
            1,
            0
          ]
        ],
        "templates": [
          {
            "shape": [
              [
                1,
                1
              ],
              [
                1,
                1
              ]
            ]
          },
          {
            "shape": [
              [
                0,
                1,
                0
              ],
              [
                1,
                0,
                0
              ],
              [
                0,
                0,
                0
              ]
            ]
          },
          {
            "shape": [
              [
                0,
                0,
                0
              ],
              [
                0,
                0,
                1
              ],
              [
                0,
                0,
                1
              ]
            ]
          }
        ],
        "solvedValue": 0,
        "minMovesToSolve": 4
      },
      "12": {
        "startState": [
          [
            0,
            1,
            0,
            0
          ],
          [
            0,
            1,
            0,
            0
          ],
          [
            1,
            1,
            0,
            0
          ],
          [
            1,
            1,
            1,
            1
          ]
        ],
        "templates": [
          {
            "shape": [
              [
                1,
                1
              ],
              [
                1,
                1
              ]
            ]
          },
          {
            "shape": [
              [
                0,
                1,
                0
              ],
              [
                0,
                1,
                0
              ],
              [
                0,
                0,
                0
              ]
            ]
          }
        ],
        "solvedValue": 0,
        "minMovesToSolve": 4
      },
      "13": {
        "startState": [
          [
            0,
            1,
            0,
            0
          ],
          [
            1,
            0,
            1,
            0
          ],
          [
            0,
            1,
            1,
            1
          ],
          [
            0,
            1,
            0,
            1
          ]
        ],
        "templates": [
          {
            "shape": [
              [
                1,
                0,
                1
              ],
              [
                1,
                0,
                0
              ],
              [
                1,
                0,
                0
              ]
            ]
          }
        ],
        "solvedValue": 0,
        "minMovesToSolve": 3
      },
      "14": {
        "startState": [
          [
            1,
            1,
            0,
            1
          ],
          [
            0,
            1,
            0,
            0
          ],
          [
            0,
            1,
            1,
            1
          ],
          [
            1,
            1,
            0,
            1
          ]
        ],
        "templates": [
          {
            "shape": [
              [
                0,
                0,
                0
              ],
              [
                0,
                0,
                0
              ],
              [
                1,
                1,
                0
              ]
            ]
          },
          {
            "shape": [
              [
                1,
                0,
                1
              ],
              [
                0,
                1,
                0
              ],
              [
                0,
                0,
                1
              ]
            ]
          },
          {
            "shape": [
              [
                1,
                1
              ],
              [
                1,
                1
              ]
            ]
          },
          {
            "shape": [
              [
                0,
                1,
                0
              ],
              [
                0,
                1,
                0
              ],
              [
                1,
                0,
                0
              ]
            ]
          }
        ],
        "solvedValue": 0,
        "minMovesToSolve": 4
      },
      "15": {
        "startState": [
          [
            1,
            0,
            0,
            0
          ],
          [
            0,
            1,
            0,
            0
          ],
          [
            1,
            0,
            1,
            1
          ],
          [
            0,
            1,
            1,
            1
          ]
        ],
        "templates": [
          {
            "shape": [
              [
                1,
                1
              ],
              [
                1,
                1
              ]
            ]
          },
          {
            "shape": [
              [
                0,
                0,
                0
              ],
              [
                0,
                0,
                1
              ],
              [
                0,
                0,
                1
              ]
            ]
          }
        ],
        "solvedValue": 0,
        "minMovesToSolve": 4
      },
      "16": {
        "startState": [
          [
            1,
            1,
            0,
            0
          ],
          [
            1,
            0,
            1,
            1
          ],
          [
            1,
            1,
            0,
            1
          ],
          [
            1,
            1,
            1,
            1
          ]
        ],
        "templates": [
          {
            "shape": [
              [
                1,
                0,
                1
              ],
              [
                0,
                1,
                0
              ],
              [
                0,
                0,
                0
              ]
            ]
          },
          {
            "shape": [
              [
                1,
                1,
                1
              ],
              [
                0,
                0,
                1
              ],
              [
                0,
                0,
                0
              ]
            ]
          },
          {
            "shape": [
              [
                1,
                1,
                1
              ],
              [
                0,
                0,
                0
              ],
              [
                1,
                1,
                0
              ]
            ]
          }
        ],
        "solvedValue": 0,
        "minMovesToSolve": 3
      },
      "17": {
        "startState": [
          [
            1,
            1,
            1,
            0
          ],
          [
            1,
            1,
            1,
            0
          ],
          [
            1,
            1,
            1,
            1
          ],
          [
            0,
            0,
            1,
            1
          ]
        ],
        "templates": [
          {
            "shape": [
              [
                1,
                1
              ],
              [
                1,
                1
              ]
            ]
          },
          {
            "shape": [
              [
                0,
                0,
                0
              ],
              [
                0,
                1,
                0
              ],
              [
                1,
                0,
                0
              ]
            ]
          }
        ],
        "solvedValue": 0,
        "minMovesToSolve": 4
      },
      "18": {
        "startState": [
          [
            0,
            0,
            0,
            0
          ],
          [
            1,
            1,
            1,
            1
          ],
          [
            0,
            0,
            1,
            1
          ],
          [
            1,
            1,
            1,
            0
          ]
        ],
        "templates": [
          {
            "shape": [
              [
                1,
                1
              ],
              [
                1,
                1
              ]
            ]
          },
          {
            "shape": [
              [
                0,
                0,
                0
              ],
              [
                0,
                0,
                0
              ],
              [
                1,
                1,
                0
              ]
            ]
          },
          {
            "shape": [
              [
                0,
                1,
                0
              ],
              [
                1,
                1,
                0
              ],
              [
                0,
                0,
                0
              ]
            ]
          }
        ],
        "solvedValue": 0,
        "minMovesToSolve": 4
      },
      "19": {
        "startState": [
          [
            1,
            0,
            1,
            0
          ],
          [
            1,
            1,
            0,
            0
          ],
          [
            0,
            0,
            0,
            1
          ],
          [
            0,
            1,
            1,
            0
          ]
        ],
        "templates": [
          {
            "shape": [
              [
                0,
                1,
                1
              ],
              [
                1,
                0,
                0
              ],
              [
                0,
                1,
                0
              ]
            ]
          },
          {
            "shape": [
              [
                1,
                0,
                1
              ],
              [
                1,
                0,
                0
              ],
              [
                1,
                0,
                1
              ]
            ]
          },
          {
            "shape": [
              [
                0,
                0,
                0
              ],
              [
                0,
                1,
                0
              ],
              [
                1,
                0,
                1
              ]
            ]
          }
        ],
        "solvedValue": 0,
        "minMovesToSolve": 3
      },
      "20": {
        "startState": [
          [
            0,
            1,
            0,
            0
          ],
          [
            0,
            1,
            0,
            0
          ],
          [
            0,
            1,
            0,
            1
          ],
          [
            1,
            0,
            0,
            1
          ]
        ],
        "templates": [
          {
            "shape": [
              [
                0,
                0,
                1
              ],
              [
                0,
                0,
                0
              ],
              [
                1,
                1,
                0
              ]
            ]
          }
        ],
        "solvedValue": 0,
        "minMovesToSolve": 4
      },
      "21": {
        "startState": [
          [
            0,
            1,
            1,
            0
          ],
          [
            0,
            1,
            0,
            0
          ],
          [
            1,
            1,
            1,
            1
          ],
          [
            0,
            1,
            1,
            1
          ]
        ],
        "templates": [
          {
            "shape": [
              [
                0,
                1,
                0
              ],
              [
                0,
                0,
                1
              ],
              [
                0,
                0,
                1
              ]
            ]
          },
          {
            "shape": [
              [
                1,
                1
              ],
              [
                1,
                1
              ]
            ]
          },
          {
            "shape": [
              [
                0,
                0,
                1
              ],
              [
                1,
                0,
                0
              ],
              [
                1,
                1,
                1
              ]
            ]
          }
        ],
        "solvedValue": 0,
        "minMovesToSolve": 4
      },
      "22": {
        "startState": [
          [
            0,
            0,
            0,
            0
          ],
          [
            1,
            0,
            1,
            0
          ],
          [
            0,
            0,
            0,
            0
          ],
          [
            1,
            0,
            1,
            1
          ]
        ],
        "templates": [
          {
            "shape": [
              [
                0,
                0,
                0
              ],
              [
                0,
                1,
                0
              ],
              [
                0,
                1,
                1
              ]
            ]
          },
          {
            "shape": [
              [
                1,
                1
              ],
              [
                1,
                1
              ]
            ]
          }
        ],
        "solvedValue": 0,
        "minMovesToSolve": 4
      },
      "23": {
        "startState": [
          [
            0,
            1,
            0,
            0
          ],
          [
            0,
            1,
            1,
            1
          ],
          [
            0,
            0,
            1,
            1
          ],
          [
            1,
            0,
            1,
            1
          ]
        ],
        "templates": [
          {
            "shape": [
              [
                1,
                0,
                1
              ],
              [
                0,
                0,
                0
              ],
              [
                0,
                0,
                1
              ]
            ]
          },
          {
            "shape": [
              [
                0,
                0,
                0
              ],
              [
                1,
                1,
                1
              ],
              [
                0,
                1,
                0
              ]
            ]
          }
        ],
        "solvedValue": 0,
        "minMovesToSolve": 4
      },
      "24": {
        "startState": [
          [
            0,
            0,
            1,
            1
          ],
          [
            0,
            0,
            1,
            1
          ],
          [
            0,
            0,
            1,
            1
          ],
          [
            0,
            1,
            0,
            0
          ]
        ],
        "templates": [
          {
            "shape": [
              [
                1,
                1
              ],
              [
                1,
                1
              ]
            ]
          },
          {
            "shape": [
              [
                1,
                1,
                1
              ],
              [
                0,
                1,
                0
              ],
              [
                1,
                0,
                0
              ]
            ]
          }
        ],
        "solvedValue": 0,
        "minMovesToSolve": 3
      },
      "25": {
        "startState": [
          [
            1,
            0,
            1,
            0
          ],
          [
            1,
            0,
            0,
            0
          ],
          [
            1,
            0,
            1,
            1
          ],
          [
            0,
            1,
            1,
            0
          ]
        ],
        "templates": [
          {
            "shape": [
              [
                0,
                1,
                0
              ],
              [
                1,
                1,
                1
              ],
              [
                1,
                0,
                1
              ]
            ]
          },
          {
            "shape": [
              [
                1,
                1,
                0
              ],
              [
                0,
                0,
                0
              ],
              [
                1,
                1,
                1
              ]
            ]
          }
        ],
        "solvedValue": 0,
        "minMovesToSolve": 3
      },
      "26": {
        "startState": [
          [
            1,
            1,
            0,
            0
          ],
          [
            0,
            1,
            1,
            1
          ],
          [
            1,
            0,
            0,
            1
          ],
          [
            0,
            0,
            1,
            0
          ]
        ],
        "templates": [
          {
            "shape": [
              [
                1,
                0,
                1
              ],
              [
                1,
                1,
                0
              ],
              [
                0,
                0,
                0
              ]
            ]
          },
          {
            "shape": [
              [
                0,
                1,
                0
              ],
              [
                1,
                0,
                1
              ],
              [
                0,
                0,
                1
              ]
            ]
          }
        ],
        "solvedValue": 0,
        "minMovesToSolve": 4
      },
      "27": {
        "startState": [
          [
            1,
            1,
            0,
            0
          ],
          [
            0,
            0,
            1,
            1
          ],
          [
            1,
            0,
            0,
            1
          ],
          [
            0,
            1,
            1,
            0
          ]
        ],
        "templates": [
          {
            "shape": [
              [
                1,
                1
              ],
              [
                1,
                1
              ]
            ]
          },
          {
            "shape": [
              [
                1,
                0,
                1
              ],
              [
                0,
                1,
                1
              ],
              [
                0,
                0,
                0
              ]
            ]
          }
        ],
        "solvedValue": 0,
        "minMovesToSolve": 4
      },
      "28": {
        "startState": [
          [
            0,
            0,
            0,
            0
          ],
          [
            1,
            0,
            1,
            1
          ],
          [
            1,
            0,
            1,
            1
          ],
          [
            0,
            1,
            1,
            1
          ]
        ],
        "templates": [
          {
            "shape": [
              [
                0,
                0,
                0
              ],
              [
                1,
                0,
                0
              ],
              [
                1,
                1,
                1
              ]
            ]
          },
          {
            "shape": [
              [
                0,
                0,
                1
              ],
              [
                0,
                0,
                0
              ],
              [
                1,
                0,
                1
              ]
            ]
          }
        ],
        "solvedValue": 0,
        "minMovesToSolve": 4
      },
      "29": {
        "startState": [
          [
            1,
            0,
            1,
            1
          ],
          [
            1,
            0,
            0,
            0
          ],
          [
            1,
            1,
            0,
            0
          ],
          [
            1,
            0,
            1,
            0
          ]
        ],
        "templates": [
          {
            "shape": [
              [
                1,
                1,
                0
              ],
              [
                0,
                1,
                0
              ],
              [
                1,
                0,
                1
              ]
            ]
          },
          {
            "shape": [
              [
                1,
                1
              ],
              [
                1,
                1
              ]
            ]
          },
          {
            "shape": [
              [
                1,
                1,
                0
              ],
              [
                0,
                0,
                1
              ],
              [
                0,
                0,
                0
              ]
            ]
          }
        ],
        "solvedValue": 0,
        "minMovesToSolve": 4
      },
      "30": {
        "startState": [
          [
            0,
            1,
            0,
            1
          ],
          [
            1,
            1,
            0,
            0
          ],
          [
            0,
            1,
            1,
            1
          ],
          [
            1,
            1,
            0,
            1
          ]
        ],
        "templates": [
          {
            "shape": [
              [
                1,
                1
              ],
              [
                1,
                1
              ]
            ]
          },
          {
            "shape": [
              [
                1,
                0,
                0
              ],
              [
                0,
                0,
                1
              ],
              [
                1,
                1,
                0
              ]
            ]
          }
        ],
        "solvedValue": 0,
        "minMovesToSolve": 4
      }
    }
  },
  {
    "name": "First Steps",
    "slug": "first-steps",
    "access": "free",
    "puzzles": {
      "1": {
        "startState": [
          [
            0,
            1,
            0
          ],
          [
            0,
            0,
            1
          ],
          [
            0,
            1,
            0
          ]
        ],
        "templates": [
          {
            "shape": [
              [
                0,
                1,
                0
              ],
              [
                0,
                0,
                0
              ],
              [
                0,
                0,
                0
              ]
            ]
          }
        ],
        "solvedValue": 0,
        "minMovesToSolve": 1
      },
      "2": {
        "startState": [
          [
            0,
            0,
            1
          ],
          [
            0,
            1,
            0
          ],
          [
            1,
            0,
            1
          ]
        ],
        "templates": [
          {
            "shape": [
              [
                1,
                0,
                0
              ],
              [
                0,
                1,
                0
              ],
              [
                0,
                0,
                0
              ]
            ]
          }
        ],
        "solvedValue": 0,
        "minMovesToSolve": 3
      },
      "3": {
        "startState": [
          [
            1,
            1,
            1
          ],
          [
            1,
            0,
            1
          ],
          [
            0,
            0,
            0
          ]
        ],
        "templates": [
          {
            "shape": [
              [
                0,
                1,
                0
              ],
              [
                1,
                0,
                1
              ],
              [
                0,
                0,
                0
              ]
            ]
          },
          {
            "shape": [
              [
                1,
                0,
                0
              ],
              [
                0,
                0,
                0
              ],
              [
                1,
                0,
                0
              ]
            ]
          }
        ],
        "solvedValue": 0,
        "minMovesToSolve": 2
      },
      "4": {
        "startState": [
          [
            0,
            0,
            0
          ],
          [
            0,
            0,
            0
          ],
          [
            1,
            0,
            0
          ]
        ],
        "templates": [
          {
            "shape": [
              [
                1,
                0,
                0
              ],
              [
                0,
                0,
                0
              ],
              [
                1,
                0,
                1
              ]
            ]
          }
        ],
        "solvedValue": 0,
        "minMovesToSolve": 3
      },
      "5": {
        "startState": [
          [
            0,
            0,
            0
          ],
          [
            2,
            0,
            0
          ],
          [
            1,
            0,
            3
          ]
        ],
        "templates": [
          {
            "shape": [
              [
                1,
                0,
                1
              ],
              [
                0,
                0,
                0
              ],
              [
                0,
                0,
                0
              ]
            ]
          },
          {
            "shape": [
              [
                2,
                0,
                0
              ],
              [
                0,
                0,
                2
              ],
              [
                0,
                0,
                0
              ]
            ]
          }
        ],
        "solvedValue": 0,
        "minMovesToSolve": 2
      },
      "6": {
        "startState": [
          [
            0,
            0,
            0
          ],
          [
            4,
            5,
            1
          ],
          [
            0,
            0,
            0
          ]
        ],
        "templates": [
          {
            "shape": [
              [
                4,
                0,
                0
              ],
              [
                0,
                5,
                0
              ],
              [
                0,
                0,
                1
              ]
            ]
          },
          {
            "shape": [
              [
                4,
                0,
                0
              ],
              [
                4,
                0,
                0
              ],
              [
                0,
                0,
                0
              ]
            ]
          },
          {
            "shape": [
              [
                0,
                0,
                0
              ],
              [
                0,
                0,
                1
              ],
              [
                0,
                0,
                1
              ]
            ]
          }
        ],
        "solvedValue": 0,
        "minMovesToSolve": 3
      },
      "7": {
        "startState": [
          [
            6,
            0,
            1
          ],
          [
            2,
            0,
            7
          ],
          [
            5,
            5,
            2
          ]
        ],
        "templates": [
          {
            "shape": [
              [
                1,
                1,
                0
              ],
              [
                0,
                1,
                1
              ],
              [
                1,
                1,
                0
              ]
            ]
          },
          {
            "shape": [
              [
                2,
                2,
                2
              ],
              [
                2,
                0,
                0
              ],
              [
                0,
                0,
                0
              ]
            ]
          },
          {
            "shape": [
              [
                4,
                4,
                0
              ],
              [
                4,
                0,
                4
              ],
              [
                0,
                0,
                0
              ]
            ]
          }
        ],
        "solvedValue": 0,
        "minMovesToSolve": 6
      },
      "8": {
        "startState": [
          [
            0,
            3,
            1
          ],
          [
            3,
            2,
            0
          ],
          [
            0,
            2,
            1
          ]
        ],
        "templates": [
          {
            "shape": [
              [
                1,
                0,
                1
              ],
              [
                1,
                0,
                1
              ],
              [
                1,
                1,
                1
              ]
            ]
          },
          {
            "shape": [
              [
                0,
                2,
                0
              ],
              [
                1,
                2,
                0
              ],
              [
                1,
                0,
                1
              ]
            ]
          }
        ],
        "solvedValue": 0,
        "minMovesToSolve": 4
      }
    }
  },
  {
    "name": "Intro Pack",
    "slug": "intro-pack",
    "access": "free",
    "puzzles": {
      "1": {
        "startState": [
          [
            0,
            0,
            0
          ],
          [
            0,
            1,
            1
          ],
          [
            0,
            1,
            0
          ]
        ],
        "templates": [
          {
            "shape": [
              [
                1,
                1
              ],
              [
                0,
                1
              ]
            ]
          }
        ],
        "solvedValue": 0,
        "minMovesToSolve": 1
      },
      "2": {
        "startState": [
          [
            1,
            0,
            1
          ],
          [
            0,
            1,
            1
          ],
          [
            1,
            1,
            1
          ]
        ],
        "templates": [
          {
            "shape": [
              [
                1,
                0,
                1
              ],
              [
                1,
                1,
                0
              ],
              [
                1,
                1,
                1
              ]
            ]
          }
        ],
        "solvedValue": 0
      },
      "3": {
        "startState": [
          [
            0,
            1,
            1
          ],
          [
            1,
            0,
            1
          ],
          [
            0,
            1,
            1
          ]
        ],
        "templates": [
          {
            "shape": [
              [
                1,
                0,
                0
              ],
              [
                1,
                0,
                0
              ],
              [
                0,
                0,
                0
              ]
            ]
          },
          {
            "shape": [
              [
                0,
                1,
                0
              ],
              [
                1,
                0,
                0
              ],
              [
                0,
                0,
                0
              ]
            ]
          }
        ],
        "solvedValue": 0
      },
      "4": {
        "startState": [
          [
            0,
            0,
            0
          ],
          [
            0,
            1,
            1
          ],
          [
            1,
            1,
            0
          ]
        ],
        "templates": [
          {
            "shape": [
              [
                1,
                1,
                0
              ],
              [
                0,
                0,
                1
              ],
              [
                0,
                0,
                1
              ]
            ]
          },
          {
            "shape": [
              [
                1,
                0,
                1
              ],
              [
                1,
                1,
                1
              ],
              [
                0,
                0,
                1
              ]
            ]
          }
        ],
        "solvedValue": 0
      },
      "5": {
        "startState": [
          [
            0,
            0,
            0
          ],
          [
            1,
            1,
            1
          ],
          [
            1,
            1,
            1
          ]
        ],
        "templates": [
          {
            "shape": [
              [
                1,
                0,
                0
              ],
              [
                0,
                1,
                0
              ],
              [
                1,
                1,
                0
              ]
            ]
          },
          {
            "shape": [
              [
                0,
                0,
                0
              ],
              [
                1,
                1,
                1
              ],
              [
                0,
                1,
                0
              ]
            ]
          }
        ],
        "solvedValue": 0
      },
      "6": {
        "startState": [
          [
            0,
            1,
            1
          ],
          [
            0,
            0,
            0
          ],
          [
            0,
            0,
            0
          ]
        ],
        "templates": [
          {
            "shape": [
              [
                1,
                1
              ],
              [
                0,
                0
              ]
            ]
          },
          {
            "shape": [
              [
                0,
                0,
                0
              ],
              [
                0,
                1,
                0
              ],
              [
                0,
                0,
                1
              ]
            ]
          }
        ],
        "solvedValue": 0,
        "minMovesToSolve": 2
      },
      "7": {
        "startState": [
          [
            0,
            1,
            0
          ],
          [
            1,
            1,
            1
          ],
          [
            0,
            0,
            0
          ]
        ],
        "templates": [
          {
            "shape": [
              [
                0,
                0
              ],
              [
                1,
                1
              ]
            ]
          },
          {
            "shape": [
              [
                0,
                1,
                0
              ],
              [
                1,
                0,
                0
              ],
              [
                0,
                0,
                0
              ]
            ]
          },
          {
            "shape": [
              [
                1,
                0,
                0
              ],
              [
                0,
                1,
                0
              ],
              [
                0,
                0,
                0
              ]
            ]
          }
        ],
        "solvedValue": 0,
        "minMovesToSolve": 3
      },
      "8": {
        "startState": [
          [
            1,
            0,
            0
          ],
          [
            0,
            1,
            1
          ],
          [
            0,
            1,
            0
          ]
        ],
        "templates": [
          {
            "shape": [
              [
                0,
                1
              ],
              [
                1,
                1
              ]
            ]
          },
          {
            "shape": [
              [
                0,
                0,
                1
              ],
              [
                0,
                0,
                0
              ],
              [
                1,
                1,
                0
              ]
            ]
          },
          {
            "shape": [
              [
                0,
                1,
                1
              ],
              [
                1,
                0,
                0
              ],
              [
                0,
                0,
                1
              ]
            ]
          }
        ],
        "solvedValue": 0,
        "minMovesToSolve": 3
      },
      "9": {
        "startState": [
          [
            1,
            1,
            1
          ],
          [
            0,
            1,
            0
          ],
          [
            1,
            0,
            1
          ]
        ],
        "templates": [
          {
            "shape": [
              [
                1,
                0
              ],
              [
                1,
                1
              ]
            ]
          },
          {
            "shape": [
              [
                1,
                0,
                0
              ],
              [
                1,
                0,
                1
              ],
              [
                1,
                0,
                1
              ]
            ]
          },
          {
            "shape": [
              [
                0,
                1,
                0
              ],
              [
                1,
                0,
                1
              ],
              [
                0,
                0,
                1
              ]
            ]
          }
        ],
        "solvedValue": 0,
        "minMovesToSolve": 3
      },
      "10": {
        "startState": [
          [
            1,
            0,
            1
          ],
          [
            1,
            1,
            0
          ],
          [
            1,
            0,
            1
          ]
        ],
        "templates": [
          {
            "shape": [
              [
                1,
                0,
                0
              ],
              [
                1,
                0,
                1
              ],
              [
                1,
                0,
                0
              ]
            ]
          },
          {
            "shape": [
              [
                1,
                0,
                0
              ],
              [
                1,
                0,
                0
              ],
              [
                1,
                0,
                1
              ]
            ]
          },
          {
            "shape": [
              [
                1,
                0,
                1
              ],
              [
                0,
                1,
                0
              ],
              [
                1,
                0,
                0
              ]
            ]
          }
        ],
        "solvedValue": 0
      }
    }
  },
  {
    "name": "Medium",
    "slug": "medium",
    "access": "free",
    "puzzles": {
      "10": {
        "startState": [
          [
            1,
            1,
            0
          ],
          [
            1,
            1,
            1
          ],
          [
            1,
            0,
            0
          ]
        ],
        "templates": [
          {
            "shape": [
              [
                0,
                1,
                0
              ],
              [
                0,
                1,
                0
              ],
              [
                0,
                1,
                0
              ]
            ]
          },
          {
            "shape": [
              [
                1,
                1,
                0
              ],
              [
                0,
                0,
                0
              ],
              [
                0,
                1,
                1
              ]
            ]
          },
          {
            "shape": [
              [
                1,
                0,
                1
              ],
              [
                1,
                0,
                1
              ],
              [
                0,
                1,
                0
              ]
            ]
          }
        ],
        "solvedValue": 0
      },
      "15": {
        "startState": [
          [
            0,
            1,
            0
          ],
          [
            1,
            0,
            0
          ],
          [
            0,
            1,
            0
          ]
        ],
        "templates": [
          {
            "shape": [
              [
                0,
                0,
                0
              ],
              [
                0,
                0,
                1
              ],
              [
                1,
                0,
                0
              ]
            ]
          },
          {
            "shape": [
              [
                0,
                0,
                0
              ],
              [
                1,
                1,
                0
              ],
              [
                0,
                1,
                1
              ]
            ]
          },
          {
            "shape": [
              [
                0,
                1,
                1
              ],
              [
                0,
                0,
                0
              ],
              [
                1,
                0,
                0
              ]
            ]
          }
        ],
        "solvedValue": 0
      }
    }
  },
  {
    "name": "Hard in 3",
    "slug": "hard-in-3",
    "access": "paid",
    "puzzles": {
      "1": {
        "startState": [
          [
            1,
            1,
            1
          ],
          [
            1,
            1,
            1
          ],
          [
            1,
            1,
            0
          ]
        ],
        "templates": [
          {
            "shape": [
              [
                0,
                1,
                1
              ],
              [
                1,
                0,
                1
              ],
              [
                1,
                0,
                0
              ]
            ]
          },
          {
            "shape": [
              [
                1,
                0,
                0
              ],
              [
                1,
                1,
                1
              ],
              [
                1,
                0,
                1
              ]
            ]
          }
        ],
        "solvedValue": 0
      }
    }
  },
  {
    "name": "Color Lab",
    "slug": "color-lab",
    "access": "free",
    "puzzles": {
      "1": {
        "startState": [
          [
            0,
            0,
            4
          ],
          [
            4,
            0,
            0
          ],
          [
            4,
            4,
            4
          ]
        ],
        "templates": [
          {
            "shape": [
              [
                0,
                0,
                4
              ],
              [
                0,
                0,
                4
              ]
            ]
          },
          {
            "shape": [
              [
                4,
                4
              ],
              [
                0,
                4
              ]
            ]
          },
          {
            "shape": [
              [
                4,
                0,
                0
              ],
              [
                0,
                4,
                0
              ]
            ]
          }
        ],
        "solvedValue": 0,
        "minMovesToSolve": 3
      },
      "2": {
        "startState": [
          [
            3,
            2,
            2
          ],
          [
            3,
            3,
            2
          ],
          [
            3,
            0,
            0
          ]
        ],
        "templates": [
          {
            "shape": [
              [
                1,
                1
              ],
              [
                1,
                1
              ],
              [
                1,
                0
              ]
            ]
          },
          {
            "shape": [
              [
                1,
                1
              ],
              [
                0,
                0
              ],
              [
                0,
                1
              ]
            ]
          },
          {
            "shape": [
              [
                0,
                0,
                2
              ],
              [
                2,
                0,
                0
              ],
              [
                0,
                0,
                2
              ]
            ]
          },
          {
            "shape": [
              [
                0,
                2,
                0
              ],
              [
                0,
                2,
                2
              ],
              [
                0,
                0,
                2
              ]
            ]
          }
        ],
        "solvedValue": 0,
        "minMovesToSolve": 4
      },
      "3": {
        "startState": [
          [
            4,
            6,
            7
          ],
          [
            1,
            4,
            5
          ],
          [
            2,
            4,
            7
          ]
        ],
        "templates": [
          {
            "shape": [
              [
                0,
                1,
                0
              ],
              [
                1,
                1,
                0
              ],
              [
                0,
                0,
                1
              ]
            ]
          },
          {
            "shape": [
              [
                1,
                1
              ],
              [
                1,
                1
              ]
            ]
          },
          {
            "shape": [
              [
                2,
                2,
                0
              ],
              [
                2,
                0,
                2
              ]
            ]
          },
          {
            "shape": [
              [
                0,
                2,
                2
              ],
              [
                2,
                2,
                0
              ]
            ]
          },
          {
            "shape": [
              [
                4,
                4
              ],
              [
                4,
                0
              ],
              [
                0,
                4
              ]
            ]
          },
          {
            "shape": [
              [
                4,
                4,
                4
              ],
              [
                0,
                4,
                0
              ],
              [
                0,
                4,
                0
              ]
            ]
          }
        ],
        "solvedValue": 0,
        "minMovesToSolve": 6
      },
      "4": {
        "startState": [
          [
            5,
            0,
            6
          ],
          [
            3,
            6,
            5
          ],
          [
            3,
            0,
            3
          ]
        ],
        "templates": [
          {
            "shape": [
              [
                0,
                3
              ],
              [
                3,
                3
              ],
              [
                3,
                0
              ]
            ]
          },
          {
            "shape": [
              [
                3,
                3
              ],
              [
                3,
                0
              ],
              [
                0,
                0
              ]
            ]
          },
          {
            "shape": [
              [
                0,
                0,
                5
              ],
              [
                0,
                5,
                0
              ]
            ]
          },
          {
            "shape": [
              [
                5,
                0
              ],
              [
                0,
                0
              ],
              [
                0,
                5
              ]
            ]
          },
          {
            "shape": [
              [
                6,
                6
              ],
              [
                6,
                6
              ]
            ]
          },
          {
            "shape": [
              [
                6,
                0,
                0
              ],
              [
                6,
                0,
                6
              ],
              [
                0,
                0,
                6
              ]
            ]
          }
        ],
        "solvedValue": 0,
        "minMovesToSolve": 6
      },
      "5": {
        "startState": [
          [
            0,
            0,
            6
          ],
          [
            6,
            2,
            6
          ],
          [
            2,
            6,
            3
          ]
        ],
        "templates": [
          {
            "shape": [
              [
                0,
                1
              ],
              [
                0,
                1
              ],
              [
                0,
                1
              ]
            ]
          },
          {
            "shape": [
              [
                0,
                0,
                0
              ],
              [
                0,
                1,
                1
              ],
              [
                0,
                0,
                1
              ]
            ]
          },
          {
            "shape": [
              [
                0,
                3
              ],
              [
                3,
                0
              ],
              [
                3,
                0
              ]
            ]
          },
          {
            "shape": [
              [
                0,
                0,
                3
              ],
              [
                3,
                0,
                0
              ]
            ]
          },
          {
            "shape": [
              [
                0,
                6,
                0
              ],
              [
                0,
                6,
                6
              ]
            ]
          },
          {
            "shape": [
              [
                0,
                0
              ],
              [
                6,
                0
              ],
              [
                6,
                6
              ]
            ]
          }
        ],
        "solvedValue": 0,
        "minMovesToSolve": 6
      }
    }
  },
  {
    "name": "Animal Portraits",
    "slug": "animal-portraits",
    "access": "free",
    "puzzles": {
      "1": {
        "startState": [
          [
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0
          ],
          [
            0,
            0,
            0,
            0,
            7,
            7,
            7,
            7,
            7,
            7,
            0,
            0,
            0,
            0
          ],
          [
            0,
            0,
            7,
            7,
            3,
            3,
            3,
            3,
            3,
            3,
            7,
            7,
            0,
            0
          ],
          [
            0,
            7,
            3,
            3,
            3,
            3,
            3,
            3,
            3,
            3,
            3,
            3,
            7,
            0
          ],
          [
            7,
            3,
            7,
            7,
            0,
            0,
            0,
            0,
            0,
            0,
            7,
            7,
            3,
            7
          ],
          [
            7,
            3,
            7,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            7,
            3,
            7
          ],
          [
            7,
            7,
            0,
            0,
            7,
            0,
            0,
            0,
            0,
            7,
            0,
            0,
            7,
            7
          ],
          [
            0,
            7,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            7,
            0
          ],
          [
            0,
            7,
            0,
            7,
            0,
            0,
            0,
            0,
            0,
            0,
            7,
            0,
            7,
            0
          ],
          [
            0,
            7,
            0,
            0,
            7,
            7,
            7,
            7,
            7,
            7,
            0,
            0,
            7,
            0
          ],
          [
            0,
            0,
            7,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            7,
            0,
            0
          ],
          [
            0,
            0,
            0,
            7,
            7,
            7,
            7,
            7,
            7,
            7,
            7,
            0,
            0,
            0
          ],
          [
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0
          ],
          [
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0
          ]
        ],
        "templates": [
          {
            "shape": [
              [
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0
              ],
              [
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0
              ],
              [
                0,
                0,
                0,
                0,
                3,
                3,
                3,
                3,
                3,
                3,
                0,
                0,
                0,
                0
              ],
              [
                0,
                0,
                3,
                3,
                3,
                3,
                3,
                3,
                3,
                3,
                3,
                3,
                0,
                0
              ],
              [
                0,
                3,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                3,
                0
              ],
              [
                0,
                3,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                3,
                0
              ],
              [
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0
              ],
              [
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0
              ],
              [
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0
              ],
              [
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0
              ],
              [
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0
              ],
              [
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0
              ],
              [
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0
              ],
              [
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0
              ]
            ]
          },
          {
            "shape": [
              [
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0
              ],
              [
                0,
                0,
                0,
                0,
                7,
                7,
                7,
                7,
                7,
                7,
                0,
                0,
                0,
                0
              ],
              [
                0,
                0,
                7,
                7,
                0,
                0,
                0,
                0,
                0,
                0,
                7,
                7,
                0,
                0
              ],
              [
                0,
                7,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                7,
                0
              ],
              [
                7,
                0,
                7,
                7,
                0,
                0,
                0,
                0,
                0,
                0,
                7,
                7,
                0,
                7
              ],
              [
                7,
                0,
                7,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                7,
                0,
                7
              ],
              [
                7,
                7,
                0,
                0,
                7,
                0,
                0,
                0,
                0,
                7,
                0,
                0,
                7,
                7
              ],
              [
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0
              ],
              [
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0
              ],
              [
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0
              ],
              [
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0
              ],
              [
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0
              ],
              [
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0
              ],
              [
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0
              ]
            ]
          },
          {
            "shape": [
              [
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0
              ],
              [
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0
              ],
              [
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0
              ],
              [
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0
              ],
              [
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0
              ],
              [
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0
              ],
              [
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0
              ],
              [
                0,
                7,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                7,
                0
              ],
              [
                0,
                7,
                0,
                7,
                0,
                0,
                0,
                0,
                0,
                0,
                7,
                0,
                7,
                0
              ],
              [
                0,
                7,
                0,
                0,
                7,
                7,
                7,
                7,
                7,
                7,
                0,
                0,
                7,
                0
              ],
              [
                0,
                0,
                7,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                7,
                0,
                0
              ],
              [
                0,
                0,
                0,
                7,
                7,
                7,
                7,
                7,
                7,
                7,
                7,
                0,
                0,
                0
              ],
              [
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0
              ],
              [
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0
              ]
            ]
          }
        ],
        "solvedValue": 0,
        "minMovesToSolve": 3
      }
    }
  },
  {
    "name": "Color Ladder",
    "slug": "color-ladder",
    "access": "free",
    "puzzles": {
      "1": {
        "startState": [
          [
            0,
            0,
            0
          ],
          [
            0,
            2,
            2
          ],
          [
            0,
            2,
            0
          ]
        ],
        "templates": [
          {
            "shape": [
              [
                2,
                2
              ],
              [
                0,
                0
              ]
            ]
          },
          {
            "shape": [
              [
                2,
                0,
                2
              ],
              [
                0,
                2,
                0
              ]
            ]
          }
        ],
        "solvedValue": 0,
        "minMovesToSolve": 2
      },
      "2": {
        "startState": [
          [
            1,
            1,
            0
          ],
          [
            0,
            0,
            1
          ],
          [
            0,
            0,
            1
          ]
        ],
        "templates": [
          {
            "shape": [
              [
                0,
                0,
                0
              ],
              [
                0,
                1,
                1
              ],
              [
                0,
                0,
                1
              ]
            ]
          },
          {
            "shape": [
              [
                0,
                0
              ],
              [
                1,
                0
              ],
              [
                1,
                1
              ]
            ]
          }
        ],
        "solvedValue": 0,
        "minMovesToSolve": 2
      },
      "3": {
        "startState": [
          [
            0,
            4,
            0
          ],
          [
            0,
            0,
            0
          ],
          [
            4,
            0,
            0
          ]
        ],
        "templates": [
          {
            "shape": [
              [
                4,
                4,
                4
              ],
              [
                0,
                4,
                0
              ],
              [
                0,
                4,
                0
              ]
            ]
          },
          {
            "shape": [
              [
                0,
                4,
                4
              ],
              [
                0,
                4,
                4
              ],
              [
                0,
                4,
                0
              ]
            ]
          }
        ],
        "solvedValue": 0,
        "minMovesToSolve": 2
      },
      "4": {
        "startState": [
          [
            3,
            3,
            3
          ],
          [
            3,
            0,
            3
          ],
          [
            3,
            3,
            0
          ]
        ],
        "templates": [
          {
            "shape": [
              [
                0,
                3,
                0
              ],
              [
                3,
                3,
                0
              ],
              [
                3,
                3,
                3
              ]
            ]
          },
          {
            "shape": [
              [
                3,
                3,
                3
              ],
              [
                0,
                0,
                0
              ],
              [
                3,
                0,
                0
              ]
            ]
          },
          {
            "shape": [
              [
                0,
                0,
                3
              ],
              [
                3,
                3,
                3
              ],
              [
                3,
                0,
                0
              ]
            ]
          }
        ],
        "solvedValue": 0,
        "minMovesToSolve": 3
      },
      "5": {
        "startState": [
          [
            0,
            0,
            6
          ],
          [
            0,
            0,
            6
          ],
          [
            0,
            6,
            6
          ]
        ],
        "templates": [
          {
            "shape": [
              [
                6,
                0
              ],
              [
                0,
                6
              ]
            ]
          },
          {
            "shape": [
              [
                0,
                0
              ],
              [
                6,
                6
              ],
              [
                0,
                0
              ]
            ]
          },
          {
            "shape": [
              [
                6,
                0,
                6
              ],
              [
                0,
                0,
                6
              ],
              [
                0,
                0,
                6
              ]
            ]
          }
        ],
        "solvedValue": 0,
        "minMovesToSolve": 3
      },
      "6": {
        "startState": [
          [
            5,
            0,
            0
          ],
          [
            5,
            5,
            0
          ],
          [
            5,
            0,
            5
          ]
        ],
        "templates": [
          {
            "shape": [
              [
                0,
                5,
                5
              ],
              [
                0,
                0,
                5
              ],
              [
                0,
                0,
                0
              ]
            ]
          },
          {
            "shape": [
              [
                0,
                5
              ],
              [
                5,
                0
              ],
              [
                5,
                0
              ]
            ]
          }
        ],
        "solvedValue": 0,
        "minMovesToSolve": 3
      },
      "7": {
        "startState": [
          [
            0,
            3,
            0
          ],
          [
            1,
            1,
            0
          ],
          [
            0,
            2,
            1
          ]
        ],
        "templates": [
          {
            "shape": [
              [
                1,
                1
              ],
              [
                1,
                0
              ],
              [
                0,
                1
              ]
            ]
          },
          {
            "shape": [
              [
                0,
                2,
                0
              ],
              [
                0,
                2,
                1
              ],
              [
                0,
                0,
                1
              ]
            ]
          }
        ],
        "solvedValue": 0,
        "minMovesToSolve": 4
      },
      "8": {
        "startState": [
          [
            0,
            2,
            0
          ],
          [
            4,
            5,
            6
          ],
          [
            2,
            5,
            3
          ]
        ],
        "templates": [
          {
            "shape": [
              [
                0,
                1,
                0
              ],
              [
                0,
                1,
                1
              ]
            ]
          },
          {
            "shape": [
              [
                0,
                0,
                2
              ],
              [
                0,
                0,
                2
              ],
              [
                0,
                0,
                2
              ]
            ]
          },
          {
            "shape": [
              [
                0,
                4,
                0
              ],
              [
                2,
                4,
                0
              ]
            ]
          }
        ],
        "solvedValue": 0,
        "minMovesToSolve": 5
      },
      "9": {
        "startState": [
          [
            0,
            0,
            2
          ],
          [
            7,
            1,
            0
          ],
          [
            0,
            6,
            4
          ]
        ],
        "templates": [
          {
            "shape": [
              [
                0,
                1
              ],
              [
                0,
                1
              ]
            ]
          },
          {
            "shape": [
              [
                0,
                2
              ],
              [
                4,
                0
              ]
            ]
          },
          {
            "shape": [
              [
                0,
                0,
                2
              ],
              [
                4,
                0,
                0
              ]
            ]
          }
        ],
        "solvedValue": 0,
        "minMovesToSolve": 6
      },
      "10": {
        "startState": [
          [
            7,
            5,
            1
          ],
          [
            0,
            6,
            7
          ],
          [
            1,
            5,
            4
          ]
        ],
        "templates": [
          {
            "shape": [
              [
                1,
                1
              ],
              [
                0,
                0
              ],
              [
                0,
                0
              ]
            ]
          },
          {
            "shape": [
              [
                0,
                6,
                0
              ],
              [
                0,
                0,
                4
              ]
            ]
          },
          {
            "shape": [
              [
                0,
                0,
                0
              ],
              [
                0,
                4,
                6
              ]
            ]
          }
        ],
        "solvedValue": 0,
        "minMovesToSolve": 6
      }
    }
  },
  simpleMonoDevPack
];
export function getPackBySlug(slug: string): PackDefinition | undefined {
	return packs.find((p) => p.slug === slug);
}

/**
 * Retrieves a specific puzzle config from a pack by puzzle ID.
 * Returns a deep clone to prevent mutation of the source data.
 */
export function getPuzzleById(packSlug: string, puzzleId: number): PuzzleConfig | undefined {
	const pack = getPackBySlug(packSlug);
	const config = pack?.puzzles[puzzleId];
	if (!config) return undefined;
	return JSON.parse(JSON.stringify(config)) as PuzzleConfig;
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
