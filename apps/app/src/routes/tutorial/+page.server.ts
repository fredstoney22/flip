import { error } from '@sveltejs/kit';
import { apiUrl } from '$lib/api-url.server';
import { getTutorialConfig } from '$lib/constants/tutorialRegistry';
import { TUTORIAL_PUZZLE_CONFIG } from '$lib/constants/tutorialPuzzle';
import type { PageServerLoad } from './$types';
import { FIRST_STEPS_SLUG, type PuzzleConfig } from '@flip/game';

export const load: PageServerLoad = async ({ url, fetch, request }) => {
  const packSlug = url.searchParams.get('pack');
  const idParam = url.searchParams.get('id');
  const cookie = request.headers.get('cookie') ?? '';

  if (!packSlug || idParam === null) {
    return {
      source: 'builtin' as const,
      config: TUTORIAL_PUZZLE_CONFIG,
      tutorial: getTutorialConfig(null, null),
      pack: null,
      puzzleId: null,
      pedagogyConceptId: undefined
    };
  }

  const puzzleId = parseInt(idParam, 10);
  if (Number.isNaN(puzzleId)) {
    error(400, 'Invalid puzzle id');
  }

  const puzzleRes = await fetch(apiUrl(`/api/packs/${packSlug}/puzzles/${puzzleId}`), {
    headers: { cookie }
  });

  if (puzzleRes.status === 404) error(404, 'Puzzle not found');
  if (!puzzleRes.ok) error(500, 'Failed to load puzzle');

  const puzzleData: {
		packSlug: string;
		packName: string;
		puzzleNumber: number;
		config: PuzzleConfig;
	} = await puzzleRes.json();

  return {
    source: 'pack' as const,
    config: puzzleData.config,
    tutorial: getTutorialConfig(packSlug, puzzleId),
    pack: { slug: packSlug, name: puzzleData.packName },
    puzzleId,
    pedagogyConceptId: packSlug === FIRST_STEPS_SLUG ? puzzleId : undefined
  };
};
