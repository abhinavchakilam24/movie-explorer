'use client';

import { useCallback, useMemo, useState } from 'react';
import type { FavoriteItem } from '@/context/FavoritesContext';

const STORAGE_KEY = 'movie-explorer:favorites:v1';

function safeParse(json: string): unknown {
  try {
    return JSON.parse(json);
  } catch {
    return null;
  }
}

export function useLocalStorageFavorites() {
  const [hydratedItems] = useState<Record<number, FavoriteItem>>(() => {
    if (typeof window === 'undefined') return {};
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};

    const parsed = safeParse(raw);
    if (!parsed || typeof parsed !== 'object') return {};

    return parsed as Record<number, FavoriteItem>;
  });

  const persist = useCallback((itemsById: Record<number, FavoriteItem>) => {
    if (typeof window === 'undefined') return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(itemsById));
  }, []);

  return useMemo(() => ({ hydratedItems, persist }), [hydratedItems, persist]);
}
