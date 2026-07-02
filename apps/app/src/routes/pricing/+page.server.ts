import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

/** Legacy route — pack purchases live on /store. */
export const load: PageServerLoad = () => {
  redirect(302, '/store');
};
