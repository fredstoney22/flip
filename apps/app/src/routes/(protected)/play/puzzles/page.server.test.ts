import { describe, it, expect, vi, beforeEach } from 'vitest';
import { load } from '../../../(game)/play/puzzles/+page.server';

// ---------------------------------------------------------------------------
// Types mirroring what the Hono API returns
// ---------------------------------------------------------------------------
interface ApiPuzzleListResponse {
	packId: string;
	packName: string;
	packSlug: string;
	puzzles: Array<{ puzzleNumber: number }>;
}

interface ProgressResponse {
	packAccess: string[];
	progress: Array<{
		packSlug: string;
		puzzleId: number;
		bestMoveCount: number;
		completedAt: string;
	}>;
}

// ---------------------------------------------------------------------------
// Factory helpers
// ---------------------------------------------------------------------------
const INTRO_LIST: ApiPuzzleListResponse = {
  packId: 'intro-pack-id',
  packName: 'Intro Pack',
  packSlug: 'intro-pack',
  puzzles: [{ puzzleNumber: 1 }, { puzzleNumber: 2 }, { puzzleNumber: 3 }]
};

const EMPTY_PROGRESS: ProgressResponse = { packAccess: [], progress: [] };

function buildFetch(
  routes: Array<{ match: string; body: Record<string, unknown>; status?: number }>
): typeof fetch {
  return vi.fn(async (input: RequestInfo | URL) => {
    const url = input.toString();
    for (const route of routes) {
      if (url.includes(route.match)) {
        const status = route.status ?? 200;
        return {
          ok: status >= 200 && status < 300,
          status,
          json: async () => route.body
        } as Response;
      }
    }
    return { ok: false, status: 404, json: async () => ({}) } as Response;
  });
}

function makeLoadArgs(pack: string | null, fetchFn: typeof fetch, searchParams = '') {
  const url = new URL(
    `http://localhost/play/puzzles${pack ? `?pack=${pack}` : ''}${searchParams}`
  );
  return {
    url,
    fetch: fetchFn,
    request: new Request('http://localhost'),
    locals: { user: { id: 'test-user' } }
  } as Parameters<typeof load>[0];
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------
beforeEach(() => {
  vi.clearAllMocks();
  process.env.PUBLIC_API_URL = 'http://localhost:3001';
});

describe('/play/puzzles load — happy path', () => {
  it('returns pack name, slug and a list of puzzles', async () => {
    const fetchFn = buildFetch([
      { match: '/packs/intro-pack/puzzles', body: INTRO_LIST },
      { match: '/progress', body: EMPTY_PROGRESS }
    ]);

    const result = await load(makeLoadArgs('intro-pack', fetchFn));

    expect(result.pack.name).toBe('Intro Pack');
    expect(result.pack.slug).toBe('intro-pack');
    expect(result.puzzles).toHaveLength(3);
    expect(result.puzzles[0].id).toBe(1);
    expect(result.puzzles[0].completed).toBe(false);
    expect(result.puzzles[0].bestMoveCount).toBeNull();
  });

  it('marks puzzles as completed when they appear in user progress', async () => {
    const progressWithCompletions: ProgressResponse = {
      packAccess: ['intro-pack'],
      progress: [
        { packSlug: 'intro-pack', puzzleId: 1, bestMoveCount: 4, completedAt: '2026-01-01T00:00:00Z' },
        { packSlug: 'intro-pack', puzzleId: 2, bestMoveCount: 2, completedAt: '2026-01-02T00:00:00Z' }
      ]
    };

    const fetchFn = buildFetch([
      { match: '/packs/intro-pack/puzzles', body: INTRO_LIST },
      { match: '/progress', body: progressWithCompletions }
    ]);

    const result = await load(makeLoadArgs('intro-pack', fetchFn));

    expect(result.puzzles[0].completed).toBe(true);
    expect(result.puzzles[0].bestMoveCount).toBe(4);
    expect(result.puzzles[0].optimal).toBe(false);
    expect(result.puzzles[1].completed).toBe(true);
    expect(result.puzzles[1].bestMoveCount).toBe(2);
    expect(result.puzzles[1].optimal).toBe(true);
    expect(result.puzzles[2].completed).toBe(false);
    expect(result.puzzles[2].bestMoveCount).toBeNull();
    expect(result.puzzles[2].optimal).toBe(false);
  });

  it('sets purchaseSuccess false when the purchase query param is absent', async () => {
    const fetchFn = buildFetch([
      { match: '/packs/intro-pack/puzzles', body: INTRO_LIST },
      { match: '/progress', body: EMPTY_PROGRESS }
    ]);

    const result = await load(makeLoadArgs('intro-pack', fetchFn));
    expect(result.purchaseSuccess).toBe(false);
  });

  it('sets purchaseSuccess true when ?purchase=success is in the URL', async () => {
    const fetchFn = buildFetch([
      { match: '/packs/intro-pack/puzzles', body: INTRO_LIST },
      { match: '/progress', body: EMPTY_PROGRESS }
    ]);

    const args = makeLoadArgs('intro-pack', fetchFn, '&purchase=success');
    const result = await load(args);
    expect(result.purchaseSuccess).toBe(true);
  });
});

describe('/play/puzzles load — access guard', () => {
  it('redirects to /play when the pack API returns 403', async () => {
    const fetchFn = buildFetch([
      { match: '/packs/hard-in-3/puzzles', body: {}, status: 403 },
      { match: '/progress', body: EMPTY_PROGRESS }
    ]);

    await expect(
      load(makeLoadArgs('hard-in-3', fetchFn))
    ).rejects.toMatchObject({ status: 302, location: '/play' });
  });

  it('throws 404 when the pack is not found', async () => {
    const fetchFn = buildFetch([
      { match: '/packs/ghost-pack/puzzles', body: {}, status: 404 },
      { match: '/progress', body: EMPTY_PROGRESS }
    ]);

    await expect(
      load(makeLoadArgs('ghost-pack', fetchFn))
    ).rejects.toMatchObject({ status: 404 });
  });

  it('throws 500 when the API returns a server error', async () => {
    const fetchFn = buildFetch([
      { match: '/packs/intro-pack/puzzles', body: {}, status: 500 },
      { match: '/progress', body: EMPTY_PROGRESS }
    ]);

    await expect(
      load(makeLoadArgs('intro-pack', fetchFn))
    ).rejects.toMatchObject({ status: 500 });
  });
});

describe('/play/puzzles load — query param validation', () => {
  it('redirects to /play when pack param is missing', async () => {
    const fetchFn = buildFetch([]);

    await expect(
      load(makeLoadArgs(null, fetchFn))
    ).rejects.toMatchObject({ status: 302, location: '/play' });
  });
});
