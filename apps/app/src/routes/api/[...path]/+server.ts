import type { RequestHandler } from './$types';

const handle: RequestHandler = async ({ request }) => {
  const { app } = await import('@flip/api/app');
  return app.fetch(request);
};

export const GET = handle;
export const POST = handle;
export const PUT = handle;
export const PATCH = handle;
export const DELETE = handle;
export const OPTIONS = handle;
