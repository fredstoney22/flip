import type { RequestHandler } from './$types';

const API_URL = process.env.PUBLIC_API_URL ?? 'http://localhost:3001';

/** Proxy POST /api/pack-checkout → Hono API /webhooks/pack-checkout, forwarding session cookies. */
export const POST: RequestHandler = async ({ request }) => {
  const body = await request.json();
  const res = await fetch(`${API_URL}/webhooks/pack-checkout`, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      cookie: request.headers.get('cookie') ?? ''
    },
    body: JSON.stringify(body)
  });
  const data = await res.json();
  return new Response(JSON.stringify(data), {
    status: res.status,
    headers: { 'content-type': 'application/json' }
  });
};
