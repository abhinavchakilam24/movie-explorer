'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { useSession } from 'next-auth/react';

/* ─── types ─── */
export type DbFavorite = {
  id: string;
  userId: string;
  movieId: number;
  title: string;
  posterPath: string | null;
  releaseDate: string | null;
  overview: string | null;
  rating: number | null;
  note: string | null;
  createdAt: string;
  updatedAt: string;
};

type FavoritesCtx = {
  favorites: DbFavorite[];
  isLoading: boolean;
  isFavorite: (movieId: number) => boolean;
  addFavorite: (movie: {
    id: number;
    title: string;
    poster_path?: string | null;
    release_date?: string;
    overview?: string;
  }) => Promise<void>;
  removeFavorite: (movieId: number) => Promise<void>;
  updateFavorite: (movieId: number, data: { rating?: number | null; note?: string | null }) => Promise<void>;
  reload: () => void;
};

const FavoritesContext = createContext<FavoritesCtx | undefined>(undefined);

/* ─── provider ─── */
export function FavoritesProvider({ children }: { children: ReactNode }) {
  const { status } = useSession();
  const isAuthed = status === 'authenticated';

  const [favorites, setFavorites] = useState<DbFavorite[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [version, setVersion] = useState(0);          // bump to refetch

  /* ── load from API ── */
  useEffect(() => {
    if (!isAuthed) {
      setFavorites([]);
      return;
    }

    let cancelled = false;
    async function load() {
      setIsLoading(true);
      try {
        const res = await fetch('/api/favorites', { headers: { accept: 'application/json' } });
        if (!res.ok) throw new Error('Failed to load favorites');
        const data = (await res.json()) as { favorites: DbFavorite[] };
        if (!cancelled) setFavorites(data.favorites ?? []);
      } catch {
        if (!cancelled) setFavorites([]);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, [isAuthed, version]);

  /* ── helpers ── */
  const isFavorite = useCallback(
    (movieId: number) => favorites.some((f) => f.movieId === movieId),
    [favorites],
  );

  const addFavorite = useCallback(
    async (movie: { id: number; title: string; poster_path?: string | null; release_date?: string; overview?: string }) => {
      const res = await fetch('/api/favorites', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          movieId: movie.id,
          title: movie.title,
          posterPath: movie.poster_path ?? null,
          releaseDate: movie.release_date ?? null,
          overview: movie.overview ?? null,
        }),
      });
      if (!res.ok) {
        const data = (await res.json().catch(() => null)) as { error?: string } | null;
        throw new Error(data?.error || 'Failed to add favorite');
      }
      const data = (await res.json()) as { favorite: DbFavorite };
      setFavorites((prev) => [data.favorite, ...prev]);
    },
    [],
  );

  const removeFavorite = useCallback(
    async (movieId: number) => {
      const prev = favorites;
      setFavorites((cur) => cur.filter((f) => f.movieId !== movieId));
      try {
        const res = await fetch(`/api/favorites/${movieId}`, { method: 'DELETE' });
        if (!res.ok) throw new Error('Failed');
      } catch {
        setFavorites(prev);
      }
    },
    [favorites],
  );

  const updateFavorite = useCallback(
    async (movieId: number, data: { rating?: number | null; note?: string | null }) => {
      const res = await fetch(`/api/favorites/${movieId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error('Failed to update');
      const result = (await res.json()) as { favorite: DbFavorite };
      setFavorites((cur) =>
        cur.map((f) => (f.movieId === movieId ? result.favorite : f)),
      );
    },
    [],
  );

  const reload = useCallback(() => setVersion((v) => v + 1), []);

  const value = useMemo<FavoritesCtx>(
    () => ({ favorites, isLoading, isFavorite, addFavorite, removeFavorite, updateFavorite, reload }),
    [favorites, isLoading, isFavorite, addFavorite, removeFavorite, updateFavorite, reload],
  );

  return <FavoritesContext.Provider value={value}>{children}</FavoritesContext.Provider>;
}

export function useFavorites() {
  const ctx = useContext(FavoritesContext);
  if (!ctx) throw new Error('useFavorites must be used within FavoritesProvider');
  return ctx;
}
