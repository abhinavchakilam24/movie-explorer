'use client';

import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { useState } from 'react';

export default function Navbar() {
    const { data: session, status } = useSession();
    const [signingOut, setSigningOut] = useState(false);
    const [menuOpen, setMenuOpen] = useState(false);

    const isAuthed = status === 'authenticated' && session?.user;
    const isLoading = status === 'loading';

    return (
        <header className="sticky top-0 z-40 border-b border-white/10 bg-zinc-950/70 backdrop-blur-xl">
            <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3 sm:py-4">
                {/* Logo */}
                <Link href="/" className="text-lg font-semibold tracking-wide" onClick={() => setMenuOpen(false)}>
                    <span className="bg-gradient-to-r from-cyan-300 to-fuchsia-300 bg-clip-text text-transparent">
                        Movie Explorer
                    </span>
                </Link>

                {/* Desktop nav */}
                <nav className="hidden items-center gap-3 text-sm text-zinc-200 md:flex">
                    <Link
                        href="/"
                        className="rounded-md border border-transparent px-2.5 py-1.5 transition-colors hover:border-white/10 hover:bg-white/5"
                    >
                        Search
                    </Link>

                    {isAuthed && (
                        <Link
                            href="/favorites"
                            className="rounded-md border border-transparent px-2.5 py-1.5 transition-colors hover:border-white/10 hover:bg-white/5"
                        >
                            Favorites
                        </Link>
                    )}

                    {isLoading ? (
                        <div className="h-8 w-20 animate-pulse rounded-lg bg-zinc-800" />
                    ) : isAuthed ? (
                        <div className="flex items-center gap-3">
                            <span
                                className="max-w-[180px] truncate text-xs text-zinc-400"
                                title={session.user.email ?? ''}
                            >
                                {session.user.email}
                            </span>
                            <button
                                type="button"
                                disabled={signingOut}
                                onClick={async () => {
                                    setSigningOut(true);
                                    await signOut({ callbackUrl: '/' });
                                }}
                                className="rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-zinc-200 transition-colors hover:bg-white/10 disabled:opacity-50"
                            >
                                {signingOut ? 'Signing out…' : 'Sign out'}
                            </button>
                        </div>
                    ) : (
                        <div className="flex items-center gap-2">
                            <Link
                                href="/login"
                                className="rounded-lg border border-white/10 bg-white/5 px-3.5 py-1.5 text-xs text-zinc-200 transition-colors hover:bg-white/10"
                            >
                                Sign in
                            </Link>
                            <Link
                                href="/signup"
                                className="rounded-lg bg-gradient-to-r from-cyan-300 to-fuchsia-300 px-3.5 py-1.5 text-xs font-semibold text-zinc-950 transition-opacity hover:opacity-90"
                            >
                                Sign up
                            </Link>
                        </div>
                    )}
                </nav>

                {/* Mobile hamburger */}
                <button
                    type="button"
                    onClick={() => setMenuOpen((o) => !o)}
                    className="relative z-50 flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 bg-white/5 md:hidden"
                    aria-label="Toggle menu"
                >
                    <div className="flex w-4 flex-col gap-[5px]">
                        <span
                            className={`block h-[2px] w-full rounded-full bg-zinc-200 transition-transform duration-200 ${menuOpen ? 'translate-y-[7px] rotate-45' : ''}`}
                        />
                        <span
                            className={`block h-[2px] w-full rounded-full bg-zinc-200 transition-opacity duration-200 ${menuOpen ? 'opacity-0' : ''}`}
                        />
                        <span
                            className={`block h-[2px] w-full rounded-full bg-zinc-200 transition-transform duration-200 ${menuOpen ? '-translate-y-[7px] -rotate-45' : ''}`}
                        />
                    </div>
                </button>
            </div>

            {/* Mobile menu panel */}
            <div
                className={`overflow-hidden border-t border-white/5 bg-zinc-950/95 backdrop-blur-xl transition-all duration-300 md:hidden ${menuOpen ? 'max-h-80 py-4' : 'max-h-0 py-0'
                    }`}
            >
                <div className="mx-auto flex max-w-5xl flex-col gap-2 px-4">
                    <Link
                        href="/"
                        onClick={() => setMenuOpen(false)}
                        className="rounded-lg px-3 py-2.5 text-sm text-zinc-200 transition-colors hover:bg-white/5"
                    >
                        🔍 Search
                    </Link>

                    {isAuthed && (
                        <Link
                            href="/favorites"
                            onClick={() => setMenuOpen(false)}
                            className="rounded-lg px-3 py-2.5 text-sm text-zinc-200 transition-colors hover:bg-white/5"
                        >
                            ♥ Favorites
                        </Link>
                    )}

                    <div className="my-1 border-t border-white/5" />

                    {isLoading ? (
                        <div className="h-10 w-full animate-pulse rounded-lg bg-zinc-800" />
                    ) : isAuthed ? (
                        <>
                            <div className="px-3 text-xs text-zinc-400">{session.user.email}</div>
                            <button
                                type="button"
                                disabled={signingOut}
                                onClick={async () => {
                                    setSigningOut(true);
                                    setMenuOpen(false);
                                    await signOut({ callbackUrl: '/' });
                                }}
                                className="rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-left text-sm text-zinc-200 transition-colors hover:bg-white/10 disabled:opacity-50"
                            >
                                {signingOut ? 'Signing out…' : 'Sign out'}
                            </button>
                        </>
                    ) : (
                        <div className="flex gap-2">
                            <Link
                                href="/login"
                                onClick={() => setMenuOpen(false)}
                                className="flex-1 rounded-lg border border-white/10 bg-white/5 py-2.5 text-center text-sm text-zinc-200 transition-colors hover:bg-white/10"
                            >
                                Sign in
                            </Link>
                            <Link
                                href="/signup"
                                onClick={() => setMenuOpen(false)}
                                className="flex-1 rounded-lg bg-gradient-to-r from-cyan-300 to-fuchsia-300 py-2.5 text-center text-sm font-semibold text-zinc-950 transition-opacity hover:opacity-90"
                            >
                                Sign up
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
}
