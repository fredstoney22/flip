import { getPackPriceUsd } from '@flip/game';
import { getPackDescription } from '$lib/constants/packDescriptions';
import type { PageServerLoad } from './$types';

import { apiUrl } from '$lib/api-url.server';

export const load: PageServerLoad = async ({ fetch, request, locals, url }) => {
  const packsRes = await fetch(apiUrl('/api/packs'), {
    headers: { cookie: request.headers.get('cookie') ?? '' }
  });

  const apiPacks: Array<{
		id: string;
		name: string;
		slug: string;
		access: string;
		sortOrder: number;
		total?: number;
		hasAccess: boolean;
	}> = packsRes.ok ? await packsRes.json() : [];

  const paidPacks = apiPacks
    .filter((pack) => pack.access === 'paid')
    .map((pack) => ({
      name: pack.name,
      slug: pack.slug,
      total: pack.total ?? 0,
      unlocked: pack.hasAccess,
      priceLabel: getPackPriceUsd(pack.slug),
      description: getPackDescription(pack.slug)
    }));

  const purchaseSuccess = url.searchParams.get('purchase') === 'success';

  return {
    paidPacks,
    user: locals.user ?? null,
    purchaseSuccess
  };
};
