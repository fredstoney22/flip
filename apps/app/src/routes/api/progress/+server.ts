import type { RequestHandler } from './$types';

const API_URL = process.env.PUBLIC_API_URL ?? 'http://localhost:3001';

/** Proxy POST /api/progress → Hono API /progress, forwarding session cookies. */
export const POST: RequestHandler = async ({ request }) => {
  const body = await request.json();
  const res = await fetch(`${API_URL}/progress`, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      cookie: request.headers.get('cookie') ?? ''
    },
    body: JSON.stringify(body)
  });
  return new Response(res.body, { status: res.status });
};
