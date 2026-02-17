export const TMDB_POSTER_W342 = 'https://image.tmdb.org/t/p/w342';
export const TMDB_POSTER_W500 = 'https://image.tmdb.org/t/p/w500';
export const TMDB_PROFILE_W185 = 'https://image.tmdb.org/t/p/w185';

export function posterUrl(path: string | null | undefined, size: 'w342' | 'w500') {
  if (!path) return null;
  return `${size === 'w342' ? TMDB_POSTER_W342 : TMDB_POSTER_W500}${path}`;
}

export function profileUrl(path: string | null | undefined) {
  if (!path) return null;
  return `${TMDB_PROFILE_W185}${path}`;
}
