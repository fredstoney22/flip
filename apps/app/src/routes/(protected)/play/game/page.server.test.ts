import { describe, it, expect, vi, beforeEach } from 'vitest';
import { load } from './+page.server';

// ---------------------------------------------------------------------------
// Types mirroring what the Hono API returns
// ---------------------------------------------------------------------------
interface ApiPuzzleResponse {
	packSlug: string;
	puzzleNumber: number;
	config: { startState: number[][]; templates: number[][][] };
}

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
const INTRO_PUZZLE: ApiPuzzleResponse = {
  packSlug: 'intro-pack',
  puzzleNumber: 1,
  config: {
    startState: [
      [1, 1, 1],
      [1, 0, 1],
      [1, 1, 1]
    ],
    templates: [[[0, 0, 0], [0, 1, 0], [0, 0, 0]]]
  }
};

const INTRO_LIST: ApiPuzzleListResponse = {
  packId: 'intro-pack-id',
  packName: 'Intro Pack',
  packSlug: 'intro-pack',
  puzzles: [{ puzzleNumber: 1 }, { puzzleNumber: 2 }, { puzzleNumber: 3 }]
};

const EMPTY_PROGRESS: ProgressResponse = { packAccess: [], progress: [] };

/**
 * Build a mock fetch that maps URL substrings to JSON responses.
 * The map is checked in order; first match wins.
 * Special status codes can be specified with a `__status` key.
 */
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

function makeLoadArgs(
  pack: string,
  id: string | null,
  fetchFn: typeof fetch,
  cookie = ''
) {
  return {
    url: new URL(
      `http://localhost/play/game?pack=${pack}${id !== null ? `&id=${id}` : ''}`
    ),
    fetch: fetchFn,
    request: new Request('http://localhost', {
      headers: cookie ? { cookie } : {}
    }),
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

describe('/play/game load — happy path (free pack)', () => {
  it('returns puzzle config, pack info, and puzzleId', async () => {
    const fetchFn = buildFetch([
      { match: '/puzzles/1', body: INTRO_PUZZLE },
      { match: '/puzzles', body: INTRO_LIST },
      { match: '/progress', body: EMPTY_PROGRESS }
    ]);

    const result = await load(makeLoadArgs('intro-pack', '1', fetchFn));

    expect(result.config).toBeDefined();
    expect(result.config.startState).toHaveLength(3);
    expect(result.pack.slug).toBe('intro-pack');
    expect(result.pack.name).toBe('Intro Pack');
    expect(result.puzzleId).toBe(1);
  });

  it('derives nextPuzzleId as 2 when puzzle 1 is loaded', async () => {
    const fetchFn = buildFetch([
      { match: '/puzzles/1', body: INTRO_PUZZLE },
      { match: '/puzzles', body: INTRO_LIST },
      { match: '/progress', body: EMPTY_PROGRESS }
    ]);

    const result = await load(makeLoadArgs('intro-pack', '1', fetchFn));
    expect(result.nextPuzzleId).toBe(2);
  });

  it('returns nextPuzzleId null for the last puzzle in the list', async () => {
    const lastPuzzle: ApiPuzzleResponse = { ...INTRO_PUZZLE, puzzleNumber: 3 };
    const fetchFn = buildFetch([
      { match: '/puzzles/3', body: lastPuzzle },
      { match: '/puzzles', body: INTRO_LIST },
      { match: '/progress', body: EMPTY_PROGRESS }
    ]);

    const result = await load(makeLoadArgs('intro-pack', '3', fetchFn));
    expect(result.nextPuzzleId).toBeNull();
  });

  it('populates bestMoveCount from progress when the puzzle was completed before', async () => {
    const progressWithRecord: ProgressResponse = {
      packAccess: ['intro-pack'],
      progress: [
        { packSlug: 'intro-pack', puzzleId: 1, bestMoveCount: 3, completedAt: '2026-01-01T00:00:00Z' }
      ]
    };

    const fetchFn = buildFetch([
      { match: '/puzzles/1', body: INTRO_PUZZLE },
      { match: '/puzzles', body: INTRO_LIST },
      { match: '/progress', body: progressWithRecord }
    ]);

    const result = await load(makeLoadArgs('intro-pack', '1', fetchFn));
    expect(result.bestMoveCount).toBe(3);
  });

  it('sets bestMoveCount to null when puzzle has never been completed', async () => {
    const fetchFn = buildFetch([
      { match: '/puzzles/1', body: INTRO_PUZZLE },
      { match: '/puzzles', body: INTRO_LIST },
      { match: '/progress', body: EMPTY_PROGRESS }
    ]);

    const result = await load(makeLoadArgs('intro-pack', '1', fetchFn));
    expect(result.bestMoveCount).toBeNull();
  });
});

describe('/play/game load — access guard', () => {
  it('redirects to /pricing when the puzzle API returns 403', async () => {
    const fetchFn = buildFetch([
      { match: '/puzzles/1', body: {}, status: 403 },
      { match: '/puzzles', body: {}, status: 403 },
      { match: '/progress', body: EMPTY_PROGRESS }
    ]);

    await expect(
      load(makeLoadArgs('hard-in-3', '1', fetchFn))
    ).rejects.toMatchObject({ status: 302, location: '/pricing' });
  });

  it('throws 404 when puzzle is not found', async () => {
    const fetchFn = buildFetch([
      { match: '/puzzles/99', body: {}, status: 404 },
      { match: '/puzzles', body: INTRO_LIST },
      { match: '/progress', body: EMPTY_PROGRESS }
    ]);

    await expect(
      load(makeLoadArgs('intro-pack', '99', fetchFn))
    ).rejects.toMatchObject({ status: 404 });
  });

  it('throws 500 when the API returns an unexpected error', async () => {
    const fetchFn = buildFetch([
      { match: '/puzzles/1', body: {}, status: 500 },
      { match: '/puzzles', body: INTRO_LIST },
      { match: '/progress', body: EMPTY_PROGRESS }
    ]);

    await expect(
      load(makeLoadArgs('intro-pack', '1', fetchFn))
    ).rejects.toMatchObject({ status: 500 });
  });
});

describe('/play/game load — query param validation', () => {
  it('redirects to /play when pack param is missing', async () => {
    const fetchFn = buildFetch([]);

    await expect(
      load({
        url: new URL('http://localhost/play/game?id=1'),
        fetch: fetchFn,
        request: new Request('http://localhost'),
        locals: { user: { id: 'test-user' } }
      } as Parameters<typeof load>[0])
    ).rejects.toMatchObject({ status: 302, location: '/play' });
  });

  it('redirects to /play/puzzles when id param is missing', async () => {
    const fetchFn = buildFetch([]);

    await expect(
      load(makeLoadArgs('intro-pack', null, fetchFn))
    ).rejects.toMatchObject({ status: 302, location: '/play/puzzles?pack=intro-pack' });
  });
});
