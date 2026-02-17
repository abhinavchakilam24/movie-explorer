'use client';

import Image from 'next/image';
import { useMemo, useState } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import type { TmdbMovieSummary } from '@/types/tmdb';
import { posterUrl } from '@/lib/tmdbImage';
import { releaseYear } from '@/lib/date';
import { useFavorites } from '@/context/FavoritesContext';

function clampOverview(text: string, max = 120) {
  if (!text) return 'No description available.';
  if (text.length <= max) return text;
  return `${text.slice(0, max).trim()}…`;
}

export default function MovieCard({
  movie,
  onViewDetails,
}: {
  movie: TmdbMovieSummary;
  onViewDetails: () => void;
}) {
  const { status } = useSession();
  const isAuthed = status === 'authenticated';
  const { isFavorite, addFavorite, removeFavorite } = useFavorites();
  const favorited = isFavorite(movie.id);
  const [favLoading, setFavLoading] = useState(false);

  const img = useMemo(() => posterUrl(movie.poster_path, 'w342'), [movie.poster_path]);

  async function handleToggleFavorite() {
    setFavLoading(true);
    try {
      if (favorited) {
        await removeFavorite(movie.id);
      } else {
        await addFavorite(movie);
      }
    } catch {
      /* context handles state */
    } finally {
      setFavLoading(false);
    }
  }

  return (
    <div className="group flex flex-col overflow-hidden rounded-2xl border border-white/10 bg-zinc-950/40 backdrop-blur transition-colors hover:border-white/15 sm:flex-row">
      {/* poster */}
      <div className="relative aspect-[2/3] w-full shrink-0 bg-zinc-800 sm:h-auto sm:w-[130px]">
        {img ? (
          <Image
            src={img}
            alt={movie.title}
            fill
            sizes="(max-width: 640px) 100vw, 130px"
            className="object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-xs text-zinc-400">
            No poster
          </div>
        )}
      </div>

      {/* text content */}
      <div className="flex min-w-0 flex-1 flex-col gap-2 p-4">
        <div className="min-w-0">
          <div className="truncate text-sm font-semibold text-zinc-100">{movie.title}</div>
          <div className="text-xs text-zinc-400">{releaseYear(movie.release_date)}</div>
        </div>
        <p className="hidden text-xs leading-relaxed text-zinc-400 sm:block">
          {clampOverview(movie.overview)}
        </p>
        <div className="mt-auto flex flex-wrap gap-2 pt-1">
          <button
            type="button"
            onClick={onViewDetails}
            className="rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-zinc-200 transition-colors hover:bg-white/10"
          >
            View details
          </button>
          {isAuthed ? (
            <button
              type="button"
              disabled={favLoading}
              onClick={handleToggleFavorite}
              className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors disabled:opacity-50 ${favorited
                  ? 'border border-red-500/30 bg-red-500/10 text-red-200 hover:bg-red-500/20'
                  : 'bg-gradient-to-r from-cyan-300 to-fuchsia-300 text-zinc-950 shadow-sm shadow-fuchsia-500/10'
                }`}
            >
              {favLoading ? '…' : favorited ? '♥ Saved' : '♡ Favorite'}
            </button>
          ) : (
            <Link
              href="/login"
              className="rounded-lg bg-gradient-to-r from-cyan-300 to-fuchsia-300 px-3 py-1.5 text-xs font-medium text-zinc-950 shadow-sm shadow-fuchsia-500/10"
            >
              ♡ Sign in to save
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
