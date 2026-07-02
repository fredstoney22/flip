import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = () => {
  if (process.env.NODE_ENV === 'production') {
    error(404, 'Not found');
  }
  return {};
};
