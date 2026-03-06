import type { PageServerLoad } from './$types';

const API_URL = process.env.PUBLIC_API_URL ?? 'http://localhost:3001';

export const load: PageServerLoad = async ({ fetch, request }) => {
  const cookie = request.headers.get('cookie') ?? '';

  const packsRes = await fetch(`${API_URL}/packs`, { headers: { cookie } });
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
