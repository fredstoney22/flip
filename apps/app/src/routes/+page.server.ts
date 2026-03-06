import type { PageServerLoad } from './$types';
import type { PuzzleConfig } from '@flip/game';

const API_URL = process.env.PUBLIC_API_URL ?? 'http://localhost:3001';

interface DailyResponse {
	date: string;
	packSlug: string;
	puzzleId: number;
	config: PuzzleConfig;
}

export const load: PageServerLoad = async ({ fetch, locals }) => {
  const res = await fetch(`${API_URL}/daily`);
  const daily = !res.ok
    ? null
    : ((await res.json()) as DailyResponse);

  return {
    daily,
    user: locals.user ?? null
  };
};
