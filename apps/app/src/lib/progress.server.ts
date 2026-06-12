/**
 * Server-side helpers for fetching progress from the Flip API.
 * Used in SvelteKit +page.server.ts load functions.
 */

import { apiUrl } from '$lib/api-url.server';

export interface ProgressData {
	packAccess: string[];
	progress: {
		packSlug: string;
		puzzleId: number;
		bestMoveCount: number;
		completedAt: string;
	}[];
}

/**
 * Fetches the current user's progress and pack access from the API.
 * Passes session cookies so the API can authenticate via Better Auth.
 */
export async function getUserProgress(
  fetch: typeof globalThis.fetch,
  headers: Headers
): Promise<ProgressData> {
  const res = await fetch(apiUrl('/api/progress'), {
    headers: { cookie: headers.get('cookie') ?? '' }
  });
  if (!res.ok) return { packAccess: [], progress: [] };
  return (await res.json()) as ProgressData;
}

/**
 * Saves a puzzle completion to the API.
 */
export async function saveCompletion(
  fetch: typeof globalThis.fetch,
  headers: Headers,
  data: { packSlug: string; puzzleId: number; moveCount: number }
): Promise<void> {
  await fetch(apiUrl('/api/progress'), {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      cookie: headers.get('cookie') ?? ''
    },
    body: JSON.stringify(data)
  });
}
