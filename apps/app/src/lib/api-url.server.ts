/**
 * Resolve Hono API URLs for server-side fetch calls.
 * On Vercel (and local `app:dev`), the API is same-origin under `/api/*`.
 * Set PUBLIC_API_URL only when running the standalone Hono dev server (`npm run api:dev`).
 */
export function apiUrl(path: string): string {
  const base = (process.env.PUBLIC_API_URL ?? '').replace(/\/$/, '');
  const normalized = path.startsWith('/') ? path : `/${path}`;
  return `${base}${normalized}`;
}
