import { error, redirect } from '@sveltejs/kit';
import { getUserProgress } from '$lib/progress.server';
import type { PageServerLoad } from './$types';

import { apiUrl } from '$lib/api-url.server';

export const load: PageServerLoad = async ({ url, fetch, request }) => {
  const slug = url.searchParams.get('pack');
  if (!slug) redirect(302, '/play');

  const cookie = request.headers.get('cookie') ?? '';

  const [packRes, progress] = await Promise.all([
    fetch(apiUrl(`/api/packs/${slug}/puzzles`), { headers: { cookie } }),
    getUserProgress(fetch, request.headers)
  ]);

  if (packRes.status === 403) redirect(302, '/pricing');
  if (packRes.status === 404) error(404, 'Pack not found');
  if (!packRes.ok) error(500, 'Failed to load pack');

  const packData: {
		packId: string;
		packName: string;
		packSlug: string;
		puzzles: Array<{ puzzleNumber: number }>;
	} = await packRes.json();

  const completedIds = new Set(
    progress.progress.filter((p) => p.packSlug === slug).map((p) => p.puzzleId)
  );
  const bestMoves: Record<number, number> = {};
  for (const p of progress.progress.filter((p) => p.packSlug === slug)) {
    bestMoves[p.puzzleId] = p.bestMoveCount;
  }

  const puzzleList = packData.puzzles.map((p) => ({
    id: p.puzzleNumber,
    completed: completedIds.has(p.puzzleNumber),
    bestMoveCount: bestMoves[p.puzzleNumber] ?? null
  }));

  const purchaseSuccess = url.searchParams.get('purchase') === 'success';

  return {
    pack: { name: packData.packName, slug: packData.packSlug },
    puzzles: puzzleList,
    purchaseSuccess
  };
};

