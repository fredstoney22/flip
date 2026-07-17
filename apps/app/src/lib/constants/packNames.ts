import * as m from '$lib/paraglide/messages';

/**
 * Translated pack display names, keyed by slug — mirrors packDescriptions.ts in
 * separating UI copy from packages/game's PackDefinition (kept framework-agnostic).
 * Covers PACK_GENERATION_SPECS names (packages/game/src/packGenerationSpecs.ts) plus
 * the hand-authored First Steps pack. Excludes 'grid-4x4-dev' (dev-only, out of scope).
 */
const PACK_NAME_GETTERS: Record<string, () => string> = {
  'tutorial-auto': m.pack_name_tutorial_auto,
  'easy-auto': m.pack_name_easy_auto,
  'medium-auto': m.pack_name_medium_auto,
  'hard-auto': m.pack_name_hard_auto,
  'expert-auto': m.pack_name_expert_auto,
  'color-spectrum': m.pack_name_color_spectrum,
  'chromatic-ascent': m.pack_name_chromatic_ascent,
  'color-ladder': m.pack_name_color_ladder,
  'first-steps': m.pack_name_first_steps
};

/** Returns the translated pack name, or `null` if the slug has no local override. */
export function getPackName(slug: string): string | null {
  return PACK_NAME_GETTERS[slug]?.() ?? null;
}
