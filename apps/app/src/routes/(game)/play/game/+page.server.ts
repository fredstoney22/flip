import { error, redirect } from '@sveltejs/kit';
import { getTutorialConfig } from '$lib/constants/tutorialRegistry';
import { getUserProgress } from '$lib/progress.server';
import { getPackName } from '$lib/constants/packNames';
import type { PageServerLoad } from './$types';
import { FIRST_STEPS_SLUG, type PuzzleConfig } from '@flip/game';
import { apiUrl } from '$lib/api-url.server';

export const load: PageServerLoad = async ({ url, fetch, request }) => {
  const slug = url.searchParams.get('pack');
  const idParam = url.searchParams.get('id');

  if (!slug) redirect(302, '/play');

  const cookie = request.headers.get('cookie') ?? '';
  const puzzleNumber = idParam !== null ? parseInt(idParam, 10) : NaN;

  if (isNaN(puzzleNumber)) redirect(302, `/play/puzzles?pack=${slug}`);

  const [puzzleRes, progress] = await Promise.all([
    fetch(apiUrl(`/api/packs/${slug}/puzzles/${puzzleNumber}`), { headers: { cookie } }),
    getUserProgress(fetch, request.headers)
  ]);

  if (puzzleRes.status === 403) redirect(302, '/store');
  if (puzzleRes.status === 404) error(404, 'Puzzle not found');
  if (!puzzleRes.ok) error(500, 'Failed to load puzzle');

  const puzzleData: {
		packSlug: string;
		packName: string;
		puzzleNumber: number;
		nextPuzzleNumber: number | null;
		config: PuzzleConfig;
	} = await puzzleRes.json();

  const bestMoveCount =
		progress.progress.find((p) => p.packSlug === slug && p.puzzleId === puzzleNumber)
		  ?.bestMoveCount ?? null;

  const tutorial =
		slug === FIRST_STEPS_SLUG ? getTutorialConfig(slug, puzzleNumber) : null;

  return {
    pack: { name: getPackName(slug) ?? puzzleData.packName, slug },
    puzzleId: puzzleNumber,
    config: puzzleData.config,
    bestMoveCount,
    nextPuzzleId: puzzleData.nextPuzzleNumber,
    tutorial,
    pedagogyConceptId: slug === FIRST_STEPS_SLUG ? puzzleNumber : undefined
  };
};
