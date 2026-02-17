'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import SearchBar from '@/components/SearchBar';
import MovieGrid from '@/components/MovieGrid';
import MovieDetailsModal from '@/components/MovieDetailsModal';
import type { TmdbMovieSummary } from '@/types/tmdb';
import ErrorBanner from '@/components/ErrorBanner';

/* ─────── icons (inline SVGs to avoid extra deps) ─────── */
function SearchIcon() {
  return (
    <svg className="h-6 w-6 text-cyan-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8">
      <circle cx="11" cy="11" r="7" />
      <path d="M20 20l-4-4" strokeLinecap="round" />
    </svg>
  );
}
function HeartIcon() {
  return (
    <svg className="h-6 w-6 text-fuchsia-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8">
      <path d="M12 21C12 21 4 14.36 4 8.5a4.5 4.5 0 018-2.83A4.5 4.5 0 0120 8.5C20 14.36 12 21 12 21z" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
function StarIcon() {
  return (
    <svg className="h-6 w-6 text-amber-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8">
      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87L18.18 22 12 18.56 5.82 22 7 14.14l-5-4.87 6.91-1.01z" strokeLinejoin="round" />
    </svg>
  );
}
function CloudIcon() {
  return (
    <svg className="h-6 w-6 text-sky-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8">
      <path d="M18 10a6 6 0 10-12 0 4 4 0 00.34 8H18a4 4 0 00.34-8z" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
function ShieldIcon() {
  return (
    <svg className="h-6 w-6 text-emerald-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8">
      <path d="M12 2l8 4v6c0 5.52-3.58 10-8 11-4.42-1-8-5.48-8-11V6z" strokeLinejoin="round" />
    </svg>
  );
}
function FilmIcon() {
  return (
    <svg className="h-6 w-6 text-violet-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8">
      <rect x="2" y="2" width="20" height="20" rx="2" />
      <path d="M7 2v20M17 2v20M2 12h20M2 7h5M2 17h5M17 7h5M17 17h5" />
    </svg>
  );
}

export default function HomePage() {
  const { status } = useSession();
  const isAuthed = status === 'authenticated';

  const [query, setQuery] = useState('');
  const [movies, setMovies] = useState<TmdbMovieSummary[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedMovieId, setSelectedMovieId] = useState<number | null>(null);
  const [hasSearched, setHasSearched] = useState(false);

  const emptyState = useMemo(() => {
    if (!hasSearched) return 'Type to search';
    if (isLoading) return null;
    if (movies.length === 0) return 'No results';
    return null;
  }, [hasSearched, isLoading, movies.length]);

  async function handleSearch(nextQuery: string) {
    const trimmed = nextQuery.trim();
    setQuery(nextQuery);

    if (!trimmed) {
      setError('Please enter a movie title to search.');
      setMovies([]);
      setHasSearched(false);
      return;
    }

    setError(null);
    setIsLoading(true);
    setHasSearched(true);

    try {
      const res = await fetch(`/api/tmdb/search?query=${encodeURIComponent(trimmed)}`, {
        method: 'GET',
      });

      if (!res.ok) {
        const data = (await res.json().catch(() => null)) as { error?: string } | null;
        throw new Error(data?.error || `Request failed (${res.status})`);
      }

      const data = (await res.json()) as { results: TmdbMovieSummary[] };
      setMovies(data.results ?? []);
    } catch (e) {
      setMovies([]);
      setError(e instanceof Error ? e.message : 'Search failed');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="space-y-8 sm:space-y-10">
      {/* ═══════════ HERO ═══════════ */}
      <section className="relative overflow-hidden rounded-2xl border border-white/10 bg-zinc-950/40 shadow-2xl shadow-cyan-500/5 backdrop-blur-xl">
        {/* decorative gradient blobs */}
        <div className="pointer-events-none absolute -inset-24 bg-[radial-gradient(600px_circle_at_20%_30%,rgba(34,211,238,0.18),transparent_60%),radial-gradient(600px_circle_at_80%_10%,rgba(232,121,249,0.14),transparent_55%)]" />

        <div className="relative px-5 py-8 sm:px-8 sm:py-12 lg:px-10 lg:py-14">
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-2 lg:gap-12">
            {/* left column — title & description */}
            <div className="flex flex-col justify-center space-y-5">
              <div className="inline-flex w-fit items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-zinc-300">
                🎬 Your Personal Movie Companion
              </div>

              <h1 className="text-balance text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
                Discover, save & rate the movies you{' '}
                <span className="bg-gradient-to-r from-cyan-300 via-purple-300 to-fuchsia-300 bg-clip-text text-transparent">
                  love
                </span>
                .
              </h1>

              <p className="max-w-lg text-sm leading-relaxed text-zinc-300 sm:text-base">
                Movie Explorer lets you search millions of movies, view rich details like directors and full cast lists,
                and build a personal favorites collection with your own ratings and notes — all synced to your free
                account so you never lose your list.
              </p>

              {/* CTA buttons */}
              {!isAuthed && (
                <div className="flex flex-wrap gap-3 pt-1">
                  <Link
                    href="/signup"
                    className="rounded-xl bg-gradient-to-r from-cyan-300 to-fuchsia-300 px-6 py-3 text-sm font-semibold text-zinc-950 shadow-lg shadow-fuchsia-500/15 transition-transform hover:scale-[1.02] active:scale-[0.98]"
                  >
                    Create free account
                  </Link>
                  <Link
                    href="/login"
                    className="rounded-xl border border-white/15 bg-white/5 px-6 py-3 text-sm text-zinc-200 transition-colors hover:bg-white/10"
                  >
                    Sign in
                  </Link>
                </div>
              )}
            </div>

            {/* right column — search */}
            <div className="flex flex-col justify-center space-y-4">
              <div className="text-xs font-semibold uppercase tracking-wider text-zinc-400 sm:text-sm">
                Start searching
              </div>
              <SearchBar initialValue={query} onSearch={handleSearch} isLoading={isLoading} />
              {error ? <ErrorBanner message={error} onDismiss={() => setError(null)} /> : null}
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════ HOW IT WORKS ═══════════ */}
      <section className="space-y-5">
        <div className="text-center">
          <h2 className="text-xl font-semibold tracking-tight sm:text-2xl">
            How it works
          </h2>
          <p className="mx-auto mt-2 max-w-md text-sm text-zinc-400">
            Three simple steps to build your personal movie collection.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {[
            {
              step: '1',
              title: 'Search',
              description: 'Type any movie title and get instant results from TMDB\'s database of millions of films. See posters, years, and overviews at a glance.',
              icon: <SearchIcon />,
              gradient: 'from-cyan-500/20 to-transparent',
            },
            {
              step: '2',
              title: 'Explore details',
              description: 'Click any movie to see its full info — director, runtime, genres, and the top cast with photos. Everything you need to decide on your next watch.',
              icon: <FilmIcon />,
              gradient: 'from-violet-500/20 to-transparent',
            },
            {
              step: '3',
              title: 'Save favorites',
              description: 'Add movies to your favorites collection, leave a star rating, and write notes. Your list is saved to the cloud so you can access it anywhere.',
              icon: <HeartIcon />,
              gradient: 'from-fuchsia-500/20 to-transparent',
            },
          ].map((item) => (
            <div
              key={item.step}
              className="group relative overflow-hidden rounded-2xl border border-white/10 bg-zinc-950/40 p-5 backdrop-blur transition-colors hover:border-white/15 sm:p-6"
            >
              <div className={`pointer-events-none absolute -inset-8 bg-radial-gradient ${item.gradient} opacity-0 transition-opacity group-hover:opacity-100`} />
              <div className="relative space-y-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/5">
                    {item.icon}
                  </div>
                  <div>
                    <div className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Step {item.step}</div>
                    <div className="text-sm font-semibold text-zinc-100">{item.title}</div>
                  </div>
                </div>
                <p className="text-sm leading-relaxed text-zinc-400">{item.description}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ═══════════ FEATURES ═══════════ */}
      <section className="space-y-5">
        <div className="text-center">
          <h2 className="text-xl font-semibold tracking-tight sm:text-2xl">
            Why Movie Explorer?
          </h2>
          <p className="mx-auto mt-2 max-w-md text-sm text-zinc-400">
            Everything you need to discover and curate your movie collection.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[
            { icon: <SearchIcon />, title: 'Instant search', desc: 'Real-time autocomplete suggestions as you type. Powered by TMDB\'s extensive movie database.' },
            { icon: <HeartIcon />, title: 'Personal favorites', desc: 'Save movies you love and build a curated collection that\'s uniquely yours.' },
            { icon: <StarIcon />, title: 'Ratings & notes', desc: 'Rate movies on a 5-star scale and add personal notes so you remember what you thought.' },
            { icon: <CloudIcon />, title: 'Cloud synced', desc: 'Your favorites are stored securely in the cloud. Access them from any device, anytime.' },
            { icon: <ShieldIcon />, title: 'Secure accounts', desc: 'Your password is hashed with bcrypt and your session is managed with JSON Web Tokens.' },
            { icon: <FilmIcon />, title: 'Rich movie info', desc: 'See director, runtime, genres, and full cast with photos for every movie.' },
          ].map((f) => (
            <div key={f.title} className="rounded-2xl border border-white/10 bg-zinc-950/40 p-5 backdrop-blur transition-colors hover:border-white/15">
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/5">
                {f.icon}
              </div>
              <div className="text-sm font-semibold text-zinc-100">{f.title}</div>
              <p className="mt-1.5 text-sm leading-relaxed text-zinc-400">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ═══════════ CTA BANNER (unauthenticated only) ═══════════ */}
      {!isAuthed && (
        <section className="relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-r from-cyan-500/10 via-fuchsia-500/10 to-violet-500/10 p-6 backdrop-blur sm:p-8">
          <div className="pointer-events-none absolute -inset-8 bg-[radial-gradient(400px_circle_at_50%_50%,rgba(232,121,249,0.12),transparent)]" />
          <div className="relative flex flex-col items-center gap-5 text-center sm:flex-row sm:text-left">
            <div className="flex-1 space-y-2">
              <h2 className="text-lg font-semibold sm:text-xl">Ready to start curating?</h2>
              <p className="text-sm text-zinc-300">
                Create a free account in seconds. Search movies, save favorites, and access your collection from anywhere.
              </p>
            </div>
            <Link
              href="/signup"
              className="shrink-0 rounded-xl bg-gradient-to-r from-cyan-300 to-fuchsia-300 px-7 py-3 text-sm font-semibold text-zinc-950 shadow-lg shadow-fuchsia-500/15 transition-transform hover:scale-[1.02] active:scale-[0.98]"
            >
              Get started — it's free
            </Link>
          </div>
        </section>
      )}

      {/* ═══════════ SEARCH RESULTS ═══════════ */}
      <section className="space-y-3">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between sm:gap-3">
          <div>
            <div className="text-sm font-semibold tracking-wide text-zinc-100 sm:text-base">
              {hasSearched ? 'Results' : 'Results will appear here'}
            </div>
            <div className="text-xs text-zinc-400 sm:text-sm">
              {hasSearched ? 'Tap a card to open details.' : 'Use the search above to begin.'}
            </div>
          </div>
          {hasSearched ? (
            <button
              type="button"
              onClick={() => {
                setQuery('');
                setMovies([]);
                setHasSearched(false);
                setError(null);
              }}
              className="w-fit rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-xs text-zinc-200 transition-colors hover:bg-white/10 sm:px-3 sm:py-1.5"
            >
              Clear results
            </button>
          ) : null}
        </div>

        <MovieGrid
          movies={movies}
          isLoading={isLoading}
          emptyState={emptyState}
          onViewDetails={(id) => setSelectedMovieId(id)}
        />
      </section>

      <MovieDetailsModal movieId={selectedMovieId} onClose={() => setSelectedMovieId(null)} />
    </div>
  );
}
