import { getUserProgress } from '$lib/progress.server';
import type { PageServerLoad } from './$types';

import { apiUrl } from '$lib/api-url.server';

export const load: PageServerLoad = async ({ fetch, request }) => {
  const [progress, packsRes] = await Promise.all([
    getUserProgress(fetch, request.headers),
    fetch(apiUrl('/api/packs'), {
      headers: { cookie: request.headers.get('cookie') ?? '' }
    })
  ]);

  const apiPacks: Array<{
		id: string;
		name: string;
		slug: string;
		access: string;
		sortOrder: number;
		total?: number;
		hasAccess: boolean;
	}> = packsRes.ok ? await packsRes.json() : [];

  const completionMap = new Map<string, Set<number>>();
  for (const p of progress.progress) {
    if (!completionMap.has(p.packSlug)) completionMap.set(p.packSlug, new Set());
		completionMap.get(p.packSlug)!.add(p.puzzleId);
  }

  const packsWithStatus = apiPacks.map((pack) => ({
    name: pack.name,
    slug: pack.slug,
    access: pack.access,
    unlocked: pack.hasAccess,
    completed: completionMap.get(pack.slug)?.size ?? 0,
    total: pack.total ?? 0
  }));

  return { packs: packsWithStatus };
};

