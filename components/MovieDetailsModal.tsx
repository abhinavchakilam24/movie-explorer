'use client';

import { useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import type { TmdbCreditsResponse, TmdbMovieDetails, TmdbMovieSummary } from '@/types/tmdb';
import { posterUrl, profileUrl } from '@/lib/tmdbImage';
import { releaseYear } from '@/lib/date';
import ErrorBanner from '@/components/ErrorBanner';
import { useFavorites } from '@/context/FavoritesContext';

export default function MovieDetailsModal({
  movieId,
  onClose,
}: {
  movieId: number | null;
  onClose: () => void;
}) {
  const [details, setDetails] = useState<TmdbMovieDetails | null>(null);
  const [credits, setCredits] = useState<TmdbCreditsResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [favLoading, setFavLoading] = useState(false);

  const { status } = useSession();
  const isAuthed = status === 'authenticated';

  const { isFavorite, addFavorite, removeFavorite } = useFavorites();
  const favorited = movieId ? isFavorite(movieId) : false;

  const img = useMemo(() => posterUrl(details?.poster_path, 'w500'), [details?.poster_path]);
  const director = useMemo(() => {
    const crew = credits?.crew || [];
    return crew.find((c) => c.job === 'Director')?.name || null;
  }, [credits?.crew]);
  const topCast = useMemo(() => {
    const cast = credits?.cast || [];
    return [...cast]
      .sort((a, b) => (a.order ?? 999) - (b.order ?? 999))
      .slice(0, 8);
  }, [credits?.cast]);

  useEffect(() => {
    if (!movieId) return;

    let cancelled = false;

    async function load() {
      setDetails(null);
      setCredits(null);
      setIsLoading(true);
      setError(null);
      try {
        const [detailsRes, creditsRes] = await Promise.all([
          fetch(`/api/tmdb/movie/${movieId}`, {
            headers: { accept: 'application/json' },
          }),
          fetch(`/api/tmdb/movie/${movieId}/credits`, {
            headers: { accept: 'application/json' },
          }),
        ]);

        if (!detailsRes.ok) {
          const text = await detailsRes.text().catch(() => '');
          let parsed: { error?: string } | null = null;
          try {
            parsed = text ? (JSON.parse(text) as { error?: string }) : null;
          } catch {
            parsed = null;
          }
          throw new Error(parsed?.error || `Request failed (${detailsRes.status})`);
        }

        if (!creditsRes.ok) {
          const text = await creditsRes.text().catch(() => '');
          let parsed: { error?: string } | null = null;
          try {
            parsed = text ? (JSON.parse(text) as { error?: string }) : null;
          } catch {
            parsed = null;
          }
          throw new Error(parsed?.error || `Request failed (${creditsRes.status})`);
        }

        const detailsData = (await detailsRes.json()) as TmdbMovieDetails;
        const creditsData = (await creditsRes.json()) as TmdbCreditsResponse;
        if (!cancelled) {
          setDetails(detailsData);
          setCredits(creditsData);
        }
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : 'Failed to load details');
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [movieId]);

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    if (movieId) window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [movieId, onClose]);

  if (!movieId) return null;

  const asSummary: TmdbMovieSummary | null = details
    ? {
      id: details.id,
      title: details.title,
      overview: details.overview,
      release_date: details.release_date,
      poster_path: details.poster_path,
    }
    : null;

  async function handleToggleFavorite() {
    if (!details || !asSummary) return;
    setFavLoading(true);
    try {
      if (favorited) {
        await removeFavorite(details.id);
      } else {
        await addFavorite(asSummary);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update favorite');
    } finally {
      setFavLoading(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
      role="dialog"
      aria-modal="true"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="w-full max-w-3xl overflow-hidden rounded-2xl border border-white/10 bg-zinc-950/40 shadow-2xl shadow-cyan-500/10 backdrop-blur-xl">
        <div className="flex items-center justify-between border-b border-white/10 bg-gradient-to-r from-cyan-500/10 via-fuchsia-500/10 to-transparent px-5 py-4">
          <div className="text-sm font-semibold tracking-wide text-zinc-50">
            {details?.title || 'Movie details'}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md border border-white/15 bg-white/5 px-3 py-1.5 text-xs text-zinc-100 hover:bg-white/10"
          >
            Close
          </button>
        </div>
        <div className="max-h-[80vh] overflow-y-auto p-5">
          {error ? <ErrorBanner message={error} onDismiss={() => setError(null)} /> : null}
          {isLoading ? (
            <div className="text-sm text-zinc-200">Loading…</div>
          ) : details ? (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-[220px_1fr]">
              <div className="relative h-[330px] w-[220px] overflow-hidden rounded-xl bg-zinc-800 ring-1 ring-white/10">
                {img ? (
                  <Image
                    src={img}
                    alt={details.title}
                    fill
                    sizes="220px"
                    className="object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-xs text-zinc-200">
                    No poster
                  </div>
                )}
              </div>
              <div className="space-y-4">
                <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-zinc-200">
                  <div>
                    <span className="text-zinc-400">Year:</span> {releaseYear(details.release_date)}
                  </div>
                  <div>
                    <span className="text-zinc-400">Runtime:</span>{' '}
                    {details.runtime ? `${details.runtime} min` : '—'}
                  </div>
                  <div>
                    <span className="text-zinc-400">Director:</span> {director ?? '—'}
                  </div>
                </div>

                {details.genres && details.genres.length ? (
                  <div className="flex flex-wrap gap-2">
                    {details.genres.slice(0, 6).map((g) => (
                      <span
                        key={g.id}
                        className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-xs text-zinc-200"
                      >
                        {g.name}
                      </span>
                    ))}
                  </div>
                ) : null}

                <p className="text-sm leading-relaxed text-zinc-200">
                  {details.overview || 'No description available.'}
                </p>

                {topCast.length ? (
                  <div className="space-y-2">
                    <div className="text-xs font-semibold tracking-wide text-zinc-100">
                      Top cast
                    </div>
                    <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                      {topCast.map((c) => {
                        const avatar = profileUrl(c.profile_path);
                        return (
                          <div
                            key={c.id}
                            className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 p-2"
                          >
                            <div className="relative h-9 w-9 overflow-hidden rounded-md bg-zinc-800 ring-1 ring-white/10">
                              {avatar ? (
                                <Image
                                  src={avatar}
                                  alt={c.name}
                                  fill
                                  sizes="36px"
                                  className="object-cover"
                                />
                              ) : null}
                            </div>
                            <div className="min-w-0">
                              <div className="truncate text-xs font-medium text-zinc-100">
                                {c.name}
                              </div>
                              <div className="truncate text-[11px] text-zinc-300">
                                {c.character || '—'}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ) : null}

                <div className="flex flex-wrap gap-2">
                  {isAuthed ? (
                    <button
                      type="button"
                      disabled={favLoading}
                      onClick={handleToggleFavorite}
                      className={`rounded-md px-3 py-2 text-xs font-semibold shadow-lg transition-opacity disabled:opacity-50 ${favorited
                          ? 'border border-red-500/30 bg-red-500/10 text-red-200 shadow-red-500/10 hover:bg-red-500/20'
                          : 'bg-gradient-to-r from-cyan-300 to-fuchsia-300 text-zinc-950 shadow-fuchsia-500/10'
                        }`}
                    >
                      {favLoading
                        ? 'Saving…'
                        : favorited
                          ? '♥ Remove from favorites'
                          : '♡ Add to favorites'}
                    </button>
                  ) : (
                    <Link
                      href="/login"
                      className="rounded-md bg-gradient-to-r from-cyan-300 to-fuchsia-300 px-3 py-2 text-xs font-semibold text-zinc-950 shadow-lg shadow-fuchsia-500/10 transition-opacity hover:opacity-90"
                    >
                      Sign in to save favorites
                    </Link>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="text-sm text-zinc-300">No details available.</div>
          )}
        </div>
      </div>
    </div>
  );
}
