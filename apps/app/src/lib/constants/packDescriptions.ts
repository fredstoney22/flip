/** Marketing and UI copy for packs. */
export const PACK_DESCRIPTIONS: Record<string, string> = {
  'chromatic-ascent': '10 puzzles · Pigment mixing from easy to expert',
  'first-steps': '9 puzzles · Learn lenses, rotation, and color step by step'
};

/** Short taglines shown on pack cards in the play list. */
export const PACK_SHORT_DESCRIPTIONS: Record<string, string> = {
  'first-steps': 'Start here!'
};

export function getPackDescription(slug: string): string | null {
  return PACK_DESCRIPTIONS[slug] ?? null;
}

export function getPackShortDescription(slug: string): string | null {
  return PACK_SHORT_DESCRIPTIONS[slug] ?? null;
}
