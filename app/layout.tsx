import type { Metadata, Viewport } from 'next';
import './globals.css';
import AuthProvider from '@/components/AuthProvider';
import { FavoritesProvider } from '@/context/FavoritesContext';
import Navbar from '@/components/Navbar';

export const metadata: Metadata = {
  title: 'Movie Explorer — Discover, Save & Rate Movies',
  description:
    'Search millions of movies, view rich details, and build a personal favorites collection with ratings and notes — synced to your free account.',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: '#09090b',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-dvh bg-zinc-950 text-zinc-50 antialiased">
        <AuthProvider>
          <FavoritesProvider>
            <div className="relative flex min-h-dvh flex-col">
              {/* decorative ambient glow — hidden on small screens for performance */}
              <div className="pointer-events-none absolute inset-0 -z-10 hidden sm:block">
                <div className="absolute inset-0 bg-[radial-gradient(900px_circle_at_20%_0%,rgba(34,211,238,0.10),transparent_60%),radial-gradient(900px_circle_at_80%_10%,rgba(232,121,249,0.08),transparent_55%)]" />
              </div>

              <Navbar />

              <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
                {children}
              </main>

              <footer className="mx-auto w-full max-w-5xl px-4 py-8 text-center text-xs text-zinc-500 sm:px-6 sm:py-10 sm:text-left lg:px-8">
                <div className="flex flex-col items-center gap-2 sm:flex-row sm:justify-between">
                  <span>Data provided by TMDB.</span>
                  <span className="text-zinc-600">
                    Built with Next.js, Tailwind CSS & Prisma.
                  </span>
                </div>
              </footer>
            </div>
          </FavoritesProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
