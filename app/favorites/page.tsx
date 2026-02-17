import FavoritesList from '@/components/FavoritesList';
import { auth } from '@/lib/auth';

export default async function FavoritesPage() {
  await auth();
  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-semibold sm:text-2xl">Your Favorites</h1>
        <p className="mt-1 text-sm text-zinc-400">Movies you&apos;ve saved to your collection.</p>
      </div>
      <FavoritesList />
    </div>
  );
}
