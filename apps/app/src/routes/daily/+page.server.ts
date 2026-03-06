import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import type { PuzzleConfig } from '@flip/game';

const API_URL = process.env.PUBLIC_API_URL ?? 'http://localhost:3001';

interface DailyResponse {
	date: string;
	packSlug: string;
	puzzleId: number;
	config: PuzzleConfig;
}

export const load: PageServerLoad = async ({ fetch }) => {
  const res = await fetch(`${API_URL}/daily`);

  if (res.status === 404) {
    error(404, 'No daily puzzle scheduled for today. Check back tomorrow!');
  }

  if (!res.ok) {
    error(500, 'Failed to load today\'s daily puzzle.');
  }

  const data = (await res.json()) as DailyResponse;
  return { daily: data };
};
