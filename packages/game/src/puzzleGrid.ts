/**
 * Grid serialization and rotation-canonical keys.
 */

import { rotateRight } from './PuzzleFunctions.js';
import type { PuzzleGrid } from './types.js';

export function gridToKey(grid: PuzzleGrid): string {
	return grid.map((row) => row.join(',')).join('|');
}

export function getDistinctRotations(shape: number[][]): number[][] {
	const seen = new Set<string>();
	const result: number[][] = [];
	let current = shape.map((row) => [...row]);
	for (let i = 0; i < 4; i++) {
		const key = current.map((row) => row.join('')).join('|');
		if (!seen.has(key)) {
			seen.add(key);
			result.push(current.map((row) => [...row]));
		}
		current = rotateRight(current);
	}
	return result;
}

export function canonicalizeGrid(grid: PuzzleGrid): string {
	if (!grid.length || !grid[0]?.length) return gridToKey(grid);
	let key = gridToKey(grid);
	let current = grid.map((row) => [...row]);
	for (let i = 0; i < 3; i++) {
		current = rotateRight(current);
		const rotKey = gridToKey(current);
		if (rotKey < key) key = rotKey;
	}
	return key;
}
