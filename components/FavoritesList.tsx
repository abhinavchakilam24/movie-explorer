'use client';

import Image from 'next/image';
import { useMemo } from 'react';
import { posterUrl } from '@/lib/tmdbImage';
import { releaseYear } from '@/lib/date';
import StarRating from '@/components/StarRating';
import { useFavorites } from '@/context/FavoritesContext';

export default function FavoritesList() {
  const { favorites, isLoading, removeFavorite, updateFavorite } = useFavorites();

  const sorted = useMemo(() => {
    return [...favorites].sort((a, b) => a.title.localeCompare(b.title));
  }, [favorites]);

  if (isLoading) {
    return (
      <div className="rounded-2xl border border-white/10 bg-zinc-950/40 p-4 text-sm text-zinc-300 backdrop-blur">
        Loading…
      </div>
    );
  }

  if (sorted.length === 0) {
    return (
      <div className="rounded-2xl border border-white/10 bg-zinc-950/40 p-6 text-center backdrop-blur">
        <div className="text-3xl">🎬</div>
        <div className="mt-2 text-sm font-medium text-zinc-200">No favorites yet</div>
        <p className="mt-1 text-xs text-zinc-400">
          Search for movies and add them to your collection.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {sorted.map((fav) => {
        const img = posterUrl(fav.posterPath, 'w342');
        return (
          <div
            key={fav.movieId}
            className="flex flex-col gap-3 rounded-2xl border border-white/10 bg-zinc-950/40 p-4 backdrop-blur sm:flex-row"
          >
            <div className="relative h-[180px] w-[120px] shrink-0 overflow-hidden rounded bg-zinc-800">
              {img ? (
                <Image
                  src={img}
                  alt={fav.title}
                  fill
                  sizes="120px"
                  className="object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-xs text-zinc-200">
                  No poster
                </div>
              )}
            </div>

            <div className="min-w-0 flex-1 space-y-2">
              <div className="min-w-0">
                <div className="truncate text-sm font-semibold">{fav.title}</div>
                <div className="text-xs text-zinc-400">{releaseYear(fav.releaseDate ?? '')}</div>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-2">
                  <div className="text-xs text-zinc-300">Rating</div>
                  <StarRating
                    value={typeof fav.rating === 'number' ? fav.rating : 0}
                    step={0.5}
                    onChange={async (next) => {
                      try {
                        await updateFavorite(fav.movieId, { rating: next });
                      } catch {
                        /* silently fail — context handles state */
                      }
                    }}
                  />
                </div>

                <button
                  type="button"
                  onClick={async () => {
                    try {
                      await removeFavorite(fav.movieId);
                    } catch {
                      /* handled in context */
                    }
                  }}
                  className="rounded-md border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-zinc-200 hover:bg-white/10"
                >
                  Remove
                </button>
              </div>

              <label className="block">
                <div className="mb-1 text-xs text-zinc-300">Note (optional)</div>
                <textarea
                  value={fav.note ?? ''}
                  onChange={async (e) => {
                    const next = e.target.value;
                    try {
                      await updateFavorite(fav.movieId, { note: next });
                    } catch {
                      /* handled in context */
                    }
                  }}
                  rows={3}
                  className="w-full rounded-xl border border-white/10 bg-zinc-950/40 px-3 py-2 text-sm text-zinc-100 outline-none placeholder:text-zinc-500 focus:border-white/20"
                  placeholder="What did you think?"
                />
              </label>
            </div>
          </div>
        );
      })}
    </div>
  );
}
