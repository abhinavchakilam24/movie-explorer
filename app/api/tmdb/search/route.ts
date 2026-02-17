import { NextResponse } from 'next/server';
import type { TmdbSearchResponse } from '@/types/tmdb';

export const dynamic = 'force-dynamic';

function getTmdbAuth() {
  const v4Token = process.env.TMDB_ACCESS_TOKEN;
  if (v4Token) return { type: 'bearer' as const, value: v4Token };

  const v3Key = process.env.TMDB_API_KEY;
  if (v3Key) return { type: 'api_key' as const, value: v3Key };

  throw new Error(
    'Missing environment variable: set TMDB_ACCESS_TOKEN (v4, recommended) or TMDB_API_KEY (v3), then restart the dev server.',
  );
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const query = (searchParams.get('query') ?? '').trim();

    if (!query) {
      return NextResponse.json({ error: 'Query is required' }, { status: 400 });
    }

    const auth = getTmdbAuth();
    const baseUrl = process.env.TMDB_BASE_URL || 'https://api.themoviedb.org/3';

    const tmdbUrl = new URL(`${baseUrl}/search/movie`);
    tmdbUrl.searchParams.set('query', query);
    tmdbUrl.searchParams.set('include_adult', 'false');
    tmdbUrl.searchParams.set('language', 'en-US');
    tmdbUrl.searchParams.set('page', '1');
    if (auth.type === 'api_key') tmdbUrl.searchParams.set('api_key', auth.value);

    const res = await fetch(tmdbUrl.toString(), {
      headers: {
        ...(auth.type === 'bearer' ? { Authorization: `Bearer ${auth.value}` } : {}),
        'Content-Type': 'application/json;charset=utf-8',
      },
      cache: 'no-store',
    });

    if (!res.ok) {
      const text = await res.text().catch(() => '');
      return NextResponse.json(
        { error: `TMDB request failed (${res.status})`, details: text.slice(0, 500) },
        { status: 502 },
      );
    }

    const data = (await res.json()) as TmdbSearchResponse;

    return NextResponse.json({
      results: (data.results || []).map((m) => ({
        id: m.id,
        title: m.title,
        overview: m.overview,
        release_date: m.release_date,
        poster_path: m.poster_path,
      })),
    });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : 'Unknown error' },
      { status: 500 },
    );
  }
}
