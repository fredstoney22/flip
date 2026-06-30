import type { PageServerLoad } from './$types';
import type { PuzzleConfig } from '@flip/game';

import { apiUrl } from '$lib/api-url.server';

interface DailyResponse {
	date: string;
	packSlug: string;
	puzzleId: number;
	config: PuzzleConfig;
}

export const load: PageServerLoad = async ({ fetch, locals }) => {
  const dailyRes = await fetch(apiUrl('/api/daily'));

  const daily = !dailyRes.ok
    ? null
    : ((await dailyRes.json()) as DailyResponse);

  return {
    daily,
    user: locals.user ?? null
  };
};
