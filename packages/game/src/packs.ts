/**
 * Static pack and puzzle data — used only by packages/db/seed.ts.
 * At runtime, pack and puzzle data is served from the database.
 */

import type { PackDefinition, PuzzleConfig } from './types.js';
import { animalPack } from './puzzles/monkey.js';
import { firstStepsPack } from './puzzles/firstSteps.js';

export const packs: PackDefinition[] = [
  {
    "name": "Tutorial (Auto)",
    "slug": "tutorial-auto",
    "access": "free",
    "puzzles": {
      "1": {
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
                0
              ]
            ]
          }
        ],
        "solvedValue": 1,
        "allowTemplateRotation": true,
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
            1,
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
          }
        ],
        "solvedValue": 1,
        "allowTemplateRotation": true,
        "minMovesToSolve": 2
      },
      "3": {
        "startState": [
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
                0,
                1,
                0
              ]
            ]
          }
        ],
        "solvedValue": 1,
        "allowTemplateRotation": true,
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
            0,
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
          }
        ],
        "solvedValue": 1,
        "allowTemplateRotation": true,
        "minMovesToSolve": 2
      },
      "5": {
        "startState": [
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
        "solvedValue": 1,
        "allowTemplateRotation": true,
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
                0,
                0
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
          }
        ],
        "solvedValue": 1,
        "allowTemplateRotation": true,
        "minMovesToSolve": 3
      },
      "2": {
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
                0
              ]
            ]
          }
        ],
        "solvedValue": 1,
        "allowTemplateRotation": true,
        "minMovesToSolve": 3
      },
      "3": {
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
        "solvedValue": 1,
        "allowTemplateRotation": true,
        "minMovesToSolve": 3
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
            1,
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
        "solvedValue": 1,
        "allowTemplateRotation": true,
        "minMovesToSolve": 3
      },
      "5": {
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
                0
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
          }
        ],
        "solvedValue": 1,
        "allowTemplateRotation": true,
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
        "solvedValue": 1,
        "allowTemplateRotation": true,
        "minMovesToSolve": 3
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
                0
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
        "solvedValue": 1,
        "allowTemplateRotation": true,
        "minMovesToSolve": 3
      },
      "3": {
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
                0
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
                1,
                0
              ]
            ]
          }
        ],
        "solvedValue": 1,
        "allowTemplateRotation": true,
        "minMovesToSolve": 3
      },
      "4": {
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
          }
        ],
        "solvedValue": 1,
        "allowTemplateRotation": true,
        "minMovesToSolve": 3
      },
      "5": {
        "startState": [
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
                1
              ]
            ]
          }
        ],
        "solvedValue": 1,
        "allowTemplateRotation": true,
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
        "solvedValue": 1,
        "allowTemplateRotation": true,
        "minMovesToSolve": 4
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
        "solvedValue": 1,
        "allowTemplateRotation": true,
        "minMovesToSolve": 4
      },
      "3": {
        "startState": [
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
                1,
                1
              ]
            ]
          }
        ],
        "solvedValue": 1,
        "allowTemplateRotation": true,
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
            1,
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
                0
              ]
            ]
          }
        ],
        "solvedValue": 1,
        "allowTemplateRotation": true,
        "minMovesToSolve": 4
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
          }
        ],
        "solvedValue": 1,
        "allowTemplateRotation": true,
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
          }
        ],
        "solvedValue": 1,
        "allowTemplateRotation": true,
        "minMovesToSolve": 5
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
                1,
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
                1,
                1
              ]
            ]
          }
        ],
        "solvedValue": 1,
        "allowTemplateRotation": true,
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
            0,
            1,
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
                1,
                1
              ]
            ]
          }
        ],
        "solvedValue": 1,
        "allowTemplateRotation": true,
        "minMovesToSolve": 5
      },
      "4": {
        "startState": [
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
            1
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
        "solvedValue": 1,
        "allowTemplateRotation": true,
        "minMovesToSolve": 5
      },
      "5": {
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
                1
              ]
            ]
          }
        ],
        "solvedValue": 1,
        "allowTemplateRotation": true,
        "minMovesToSolve": 5
      }
    }
  },
  firstStepsPack,
  {
    "name": "Intro Pack",
    "slug": "intro-pack",
    "access": "free",
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
                0,
                1
              ]
            ]
          }
        ],
        "solvedValue": 1,
        "allowTemplateRotation": true,
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
        "solvedValue": 0,
        "allowTemplateRotation": true
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
        "solvedValue": 0,
        "allowTemplateRotation": true
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
        "solvedValue": 0,
        "allowTemplateRotation": true
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
        "solvedValue": 0,
        "allowTemplateRotation": true
      },
      "6": {
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
        "solvedValue": 1,
        "allowTemplateRotation": true,
        "minMovesToSolve": 2
      },
      "7": {
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
        "solvedValue": 1,
        "allowTemplateRotation": true,
        "minMovesToSolve": 3
      },
      "8": {
        "startState": [
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
        "solvedValue": 1,
        "allowTemplateRotation": true,
        "minMovesToSolve": 3
      },
      "9": {
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
            1,
            0
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
        "solvedValue": 1,
        "allowTemplateRotation": true,
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
        "solvedValue": 0,
        "allowTemplateRotation": true
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
        "solvedValue": 0,
        "allowTemplateRotation": true
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
        "solvedValue": 0,
        "allowTemplateRotation": true
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
        "solvedValue": 0,
        "allowTemplateRotation": true
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
        "allowTemplateRotation": true,
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
        "allowTemplateRotation": true,
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
        "allowTemplateRotation": true,
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
        "allowTemplateRotation": true,
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
        "allowTemplateRotation": true,
        "minMovesToSolve": 6
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
            2,
            0
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
                2,
                0
              ],
              [
                0,
                2
              ]
            ]
          },
          {
            "shape": [
              [
                2,
                0
              ],
              [
                2,
                0
              ]
            ]
          }
        ],
        "solvedValue": 0,
        "allowTemplateRotation": true,
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
                0
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
          }
        ],
        "solvedValue": 0,
        "allowTemplateRotation": true,
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
            4,
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
                0
              ],
              [
                4,
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
                4,
                0,
                0
              ],
              [
                0,
                4,
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
        "allowTemplateRotation": true,
        "minMovesToSolve": 2
      },
      "4": {
        "startState": [
          [
            3,
            0,
            3
          ],
          [
            3,
            3,
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
                3,
                3
              ],
              [
                3,
                3
              ],
              [
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
                3,
                0,
                3
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
                0,
                3
              ],
              [
                0,
                0,
                3
              ],
              [
                0,
                3,
                3
              ]
            ]
          }
        ],
        "solvedValue": 0,
        "allowTemplateRotation": true,
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
            0,
            0,
            6
          ],
          [
            6,
            6,
            0
          ]
        ],
        "templates": [
          {
            "shape": [
              [
                6,
                0,
                0
              ],
              [
                6,
                6,
                0
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
                6,
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
                6,
                0
              ]
            ]
          }
        ],
        "solvedValue": 0,
        "allowTemplateRotation": true,
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
            5,
            5,
            0
          ],
          [
            0,
            5,
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
                5,
                5
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
                5,
                5
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
                0,
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
        "allowTemplateRotation": true,
        "minMovesToSolve": 3
      },
      "7": {
        "startState": [
          [
            1,
            2,
            2
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
                1,
                0
              ]
            ]
          },
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
                1,
                0
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
                2
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
          }
        ],
        "solvedValue": 0,
        "allowTemplateRotation": true,
        "minMovesToSolve": 4
      },
      "8": {
        "startState": [
          [
            2,
            2,
            2
          ],
          [
            5,
            1,
            7
          ],
          [
            0,
            6,
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
                2
              ],
              [
                2,
                2,
                2
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
                0
              ],
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
                4,
                4
              ],
              [
                0,
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
                4,
                0,
                1
              ],
              [
                1,
                0,
                2
              ],
              [
                2,
                0,
                0
              ]
            ]
          }
        ],
        "solvedValue": 0,
        "allowTemplateRotation": true,
        "minMovesToSolve": 6
      },
      "9": {
        "startState": [
          [
            6,
            3,
            0
          ],
          [
            5,
            5,
            6
          ],
          [
            6,
            5,
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
                0,
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
                5,
                0,
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
                0,
                0,
                5
              ]
            ]
          },
          {
            "shape": [
              [
                0,
                5,
                6
              ],
              [
                0,
                3,
                0
              ]
            ]
          },
          {
            "shape": [
              [
                5,
                3
              ],
              [
                5,
                6
              ]
            ]
          }
        ],
        "solvedValue": 0,
        "allowTemplateRotation": true,
        "minMovesToSolve": 6
      },
      "10": {
        "startState": [
          [
            3,
            1,
            0
          ],
          [
            0,
            0,
            4
          ],
          [
            0,
            5,
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
                3,
                0,
                0
              ],
              [
                3,
                0,
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
                0,
                3
              ],
              [
                0,
                3,
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
                0,
                6
              ],
              [
                1,
                3
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
                6,
                3
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
        "allowTemplateRotation": true,
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
            0,
            2
          ],
          [
            2,
            2,
            0
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
                0
              ],
              [
                0,
                2
              ]
            ]
          }
        ],
        "solvedValue": 0,
        "allowTemplateRotation": true,
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
                0,
                1
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
        "allowTemplateRotation": true,
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
            4,
            0
          ],
          [
            4,
            4,
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
                4,
                0
              ]
            ]
          }
        ],
        "solvedValue": 0,
        "allowTemplateRotation": true,
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
            3,
            3
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
                3,
                0
              ],
              [
                3,
                3,
                3
              ]
            ]
          }
        ],
        "solvedValue": 0,
        "allowTemplateRotation": true,
        "minMovesToSolve": 3
      },
      "5": {
        "startState": [
          [
            0,
            6,
            6
          ],
          [
            6,
            0,
            6
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
                6,
                0
              ],
              [
                6,
                0
              ]
            ]
          }
        ],
        "solvedValue": 0,
        "allowTemplateRotation": true,
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
            0,
            5,
            0
          ],
          [
            0,
            5,
            0
          ]
        ],
        "templates": [
          {
            "shape": [
              [
                0,
                5
              ],
              [
                5,
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
        "allowTemplateRotation": true,
        "minMovesToSolve": 3
      },
      "7": {
        "startState": [
          [
            0,
            1,
            1
          ],
          [
            2,
            1,
            0
          ],
          [
            2,
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
          },
          {
            "shape": [
              [
                0,
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
                0,
                0
              ],
              [
                2,
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
                2
              ],
              [
                2,
                0,
                1
              ]
            ]
          }
        ],
        "solvedValue": 0,
        "allowTemplateRotation": true,
        "minMovesToSolve": 4
      },
      "8": {
        "startState": [
          [
            5,
            6,
            1
          ],
          [
            6,
            2,
            1
          ],
          [
            4,
            1,
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
                1,
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
                2,
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
                0
              ]
            ]
          },
          {
            "shape": [
              [
                2,
                0
              ],
              [
                0,
                2
              ],
              [
                0,
                2
              ]
            ]
          },
          {
            "shape": [
              [
                4,
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
                2,
                4,
                0
              ]
            ]
          }
        ],
        "solvedValue": 0,
        "allowTemplateRotation": true,
        "minMovesToSolve": 6
      },
      "9": {
        "startState": [
          [
            0,
            3,
            6
          ],
          [
            3,
            3,
            3
          ],
          [
            5,
            6,
            6
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
                3,
                3,
                0
              ],
              [
                3,
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
                5,
                5,
                0
              ],
              [
                0,
                5,
                5
              ]
            ]
          },
          {
            "shape": [
              [
                5,
                0,
                0
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
                5,
                6
              ],
              [
                3,
                0
              ],
              [
                5,
                3
              ]
            ]
          },
          {
            "shape": [
              [
                6,
                0,
                5
              ],
              [
                0,
                5,
                0
              ],
              [
                3,
                0,
                6
              ]
            ]
          }
        ],
        "solvedValue": 0,
        "allowTemplateRotation": true,
        "minMovesToSolve": 6
      },
      "10": {
        "startState": [
          [
            5,
            1,
            3
          ],
          [
            0,
            4,
            4
          ],
          [
            7,
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
                4,
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
                0,
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
                1,
                0
              ],
              [
                4,
                1
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
                1,
                6
              ],
              [
                4,
                0
              ],
              [
                0,
                0
              ]
            ]
          }
        ],
        "solvedValue": 0,
        "allowTemplateRotation": true,
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
        "allowTemplateRotation": true,
        "minMovesToSolve": 3
      }
    }
  }
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
