export function releaseYear(releaseDate: string | null | undefined) {
  if (!releaseDate) return '—';
  const year = releaseDate.slice(0, 4);
  return year || '—';
}
