/**
 * 14×14 monkey face — ASCII density shading (# dark, % mid, @ light).
 * Maps to a dark → tan → cream progression in the RYB palette.
 */

import { buildImagePuzzle, parseArtRows } from '../imagePuzzle.js';
import type { PackDefinition, Pigment, PuzzleConfig } from '../types.js';

/** Matches classic ASCII greyscale density: # darkest, % mid-tone, @ lightest. */
const MONKEY_ART_CHARS: Record<string, Pigment> = {
	'.': 0,
	'#': 7, // dark brown — outline, ears, eyes, mouth
	'%': 3, // warm tan fur — mid-tone between dark outline and light face
	'@': 0 // cream face — lightest tone (white; reads against tan fur)
};

const MONKEY_ART = [
	'..............',
	'....######....',
	'..##%%%%%%##..',
	'.#%%%%%%%%%%#.',
	'#%##@@@@@@##%#',
	'#%#@@@@@@@@#%#',
	'##@@#@@@@#@@##',
	'.#@@@@@@@@@@#.',
	'.#@#@@@@@@#@#.',
	'.#@@######@@#.',
	'..#@@@@@@@@#..',
	'...########...',
	'..............',
	'..............'
];

export const monkeyImage = parseArtRows(MONKEY_ART, MONKEY_ART_CHARS);

/** Two pigment layers (brown + tan), each split top/bottom → 4 moves. */
export const monkeyPuzzle: PuzzleConfig = buildImagePuzzle(monkeyImage, {
	splitsPerColor: 2,
	allowTemplateRotation: true
});

export const animalPack: PackDefinition = {
	name: 'Animal Portraits',
	slug: 'animal-portraits',
	access: 'free',
	puzzles: {
		1: monkeyPuzzle
	}
};
