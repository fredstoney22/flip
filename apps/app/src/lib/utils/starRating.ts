/**
 * Whether a solve counts as optimal (at or under par).
 * When par is unknown, treat the solve as optimal.
 */
export function isOptimalSolve(moves: number, par: number | null): boolean {
  if (par === null) return true;
  return moves <= par;
}
