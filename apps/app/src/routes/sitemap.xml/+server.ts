import type { RequestHandler } from './$types';
import { SITE_URL } from '$lib/constants/site';

const paths = ['/', '/daily', '/tutorial', '/play', '/privacy', '/terms', '/auth/login'];

export const GET: RequestHandler = () => {
  const urls = paths
    .map(
      (path) => `  <url>
    <loc>${SITE_URL}${path}</loc>
    <changefreq>weekly</changefreq>
  </url>`
    )
    .join('\n');

  const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>`;

  return new Response(body, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=86400'
    }
  });
};
