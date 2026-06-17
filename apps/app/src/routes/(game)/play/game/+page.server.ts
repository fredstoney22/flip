import { error, redirect } from '@sveltejs/kit';
import { getUserProgress } from '$lib/progress.server';
import type { PageServerLoad } from './$types';
import type { PuzzleConfig } from '@flip/game';
import { apiUrl } from '$lib/api-url.server';

export const load: PageServerLoad = async ({ url, fetch, request }) => {
  const slug = url.searchParams.get('pack');
  const idParam = url.searchParams.get('id');

  if (!slug) redirect(302, '/play');

  const cookie = request.headers.get('cookie') ?? '';
  const puzzleNumber = idParam !== null ? parseInt(idParam, 10) : NaN;

  if (isNaN(puzzleNumber)) redirect(302, `/play/puzzles?pack=${slug}`);

  const [puzzleRes, listRes, progress] = await Promise.all([
    fetch(apiUrl(`/api/packs/${slug}/puzzles/${puzzleNumber}`), { headers: { cookie } }),
    fetch(apiUrl(`/api/packs/${slug}/puzzles`), { headers: { cookie } }),
    getUserProgress(fetch, request.headers)
  ]);

  if (puzzleRes.status === 403 || listRes.status === 403) redirect(302, '/pricing');
  if (puzzleRes.status === 404) error(404, 'Puzzle not found');
  if (!puzzleRes.ok) error(500, 'Failed to load puzzle');

  const puzzleData: {
		packSlug: string;
		puzzleNumber: number;
		config: PuzzleConfig;
	} = await puzzleRes.json();

  let nextPuzzleId: number | null = null;
  let packName = slug;
  if (listRes.ok) {
    const listData: {
			packName: string;
			puzzles: Array<{ puzzleNumber: number }>;
		} = await listRes.json();
    packName = listData.packName;
    const numbers = listData.puzzles.map((p) => p.puzzleNumber).sort((a, b) => a - b);
    const idx = numbers.indexOf(puzzleNumber);
    nextPuzzleId = idx !== -1 && idx < numbers.length - 1 ? numbers[idx + 1] : null;
  }

  const bestMoveCount =
		progress.progress.find((p) => p.packSlug === slug && p.puzzleId === puzzleNumber)
		  ?.bestMoveCount ?? null;

  return {
    pack: { name: packName, slug },
    puzzleId: puzzleNumber,
    config: puzzleData.config,
    bestMoveCount,
    nextPuzzleId
  };
};
