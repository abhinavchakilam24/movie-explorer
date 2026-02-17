import { NextResponse } from 'next/server';
import type { TmdbMovieDetails } from '@/types/tmdb';

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

export async function GET(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await ctx.params;
    const numericId = Number(id);

    if (!Number.isFinite(numericId) || numericId <= 0) {
      return NextResponse.json({ error: 'Invalid id' }, { status: 400 });
    }

    const auth = getTmdbAuth();
    const baseUrl = process.env.TMDB_BASE_URL || 'https://api.themoviedb.org/3';

    const tmdbUrl = new URL(`${baseUrl}/movie/${numericId}`);
    tmdbUrl.searchParams.set('language', 'en-US');
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

    const data = (await res.json()) as TmdbMovieDetails;

    return NextResponse.json({
      id: data.id,
      title: data.title,
      overview: data.overview,
      release_date: data.release_date,
      poster_path: data.poster_path,
      runtime: data.runtime,
      genres: data.genres ?? [],
    });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : 'Unknown error' },
      { status: 500 },
    );
  }
}
