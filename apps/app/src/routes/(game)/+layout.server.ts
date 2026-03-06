import type { LayoutServerLoad } from './$types';

/**
 * Optional-auth layout: load user if present but never redirect.
 * Free packs are playable without an account; progress is saved only when logged in.
 */
export const load: LayoutServerLoad = async ({ locals }) => {
  return { user: locals.user ?? null };
};
