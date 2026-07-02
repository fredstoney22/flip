import * as m from '$lib/paraglide/messages';

/** Marketing and UI copy for packs. */
const PACK_DESCRIPTION_GETTERS: Record<string, () => string> = {
  'chromatic-ascent': m.pack_description_chromatic_ascent,
  'first-steps': m.pack_description_first_steps
};

/** Short taglines shown on pack cards in the play list. */
const PACK_SHORT_DESCRIPTION_GETTERS: Record<string, () => string> = {
  'first-steps': m.pack_short_description_first_steps
};

export function getPackDescription(slug: string): string | null {
  return PACK_DESCRIPTION_GETTERS[slug]?.() ?? null;
}

export function getPackShortDescription(slug: string): string | null {
  return PACK_SHORT_DESCRIPTION_GETTERS[slug]?.() ?? null;
}
