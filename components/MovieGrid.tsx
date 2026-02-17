'use client';

import type { TmdbMovieSummary } from '@/types/tmdb';
import MovieCard from '@/components/MovieCard';

export default function MovieGrid({
  movies,
  isLoading,
  emptyState,
  onViewDetails,
}: {
  movies: TmdbMovieSummary[];
  isLoading: boolean;
  emptyState: string | null;
  onViewDetails: (id: number) => void;
}) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="h-[200px] animate-pulse rounded-2xl border border-white/10 bg-zinc-900/40 sm:h-[220px]"
          />
        ))}
      </div>
    );
  }

  if (emptyState) {
    return (
      <div className="rounded-2xl border border-white/10 bg-zinc-950/40 p-6 text-center text-sm text-zinc-400 backdrop-blur sm:p-10">
        {emptyState}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {movies.map((m) => (
        <MovieCard key={m.id} movie={m} onViewDetails={() => onViewDetails(m.id)} />
      ))}
    </div>
  );
}
