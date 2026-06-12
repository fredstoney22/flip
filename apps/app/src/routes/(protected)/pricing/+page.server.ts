import type { PageServerLoad } from './$types';

import { apiUrl } from '$lib/api-url.server';

export const load: PageServerLoad = async ({ fetch, request }) => {
  const cookie = request.headers.get('cookie') ?? '';

  const packsRes = await fetch(apiUrl('/api/packs'), { headers: { cookie } });
  const allPacks: Array<{
		id: string;
		name: string;
		slug: string;
		access: string;
		sortOrder: number;
		hasAccess: boolean;
	}> = packsRes.ok ? await packsRes.json() : [];

  const paidPacks = allPacks
    .filter((p) => p.access === 'paid')
    .map((p) => ({
      name: p.name,
      slug: p.slug,
      owned: p.hasAccess
    }));

  return { paidPacks };
};
