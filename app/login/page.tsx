'use client';

import { signIn } from 'next-auth/react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useState, useCallback, Suspense } from 'react';

/* ────────────── helpers ────────────── */
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function fieldBorder(hasError: boolean, touched: boolean) {
  if (!touched) return 'border-white/10 focus:border-white/25';
  return hasError
    ? 'border-red-500/60 focus:border-red-500/80'
    : 'border-emerald-500/50 focus:border-emerald-500/70';
}

function XIcon() {
  return (
    <svg className="h-3.5 w-3.5 text-red-400" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 4l8 8M12 4l-8 8" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg className="h-3.5 w-3.5 text-emerald-400" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 8.5l3.5 3.5 6.5-7" />
    </svg>
  );
}

/* ────────────── inner content (uses useSearchParams) ────────────── */
function LoginContent() {
  const searchParams = useSearchParams();
  const justRegistered = searchParams.get('registered') === '1';

  /* field state */
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  /* touch tracking */
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const touch = useCallback((f: string) => setTouched((t) => ({ ...t, [f]: true })), []);

  /* loading + errors */
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /* derived validation */
  const emailValid = EMAIL_RE.test(email);
  const emailError = (touched.email ?? false) && !emailValid;
  const passwordEmpty = password.length === 0;
  const passwordError = (touched.password ?? false) && passwordEmpty;

  const formValid = emailValid && !passwordEmpty;

  /* submit */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTouched({ email: true, password: true });

    if (!formValid) return;

    setIsLoading(true);
    setError(null);

    try {
      const res = await signIn('credentials', {
        email,
        password,
        redirect: true,
        callbackUrl: '/favorites',
      });

      // If redirect happens we never reach here; safety net:
      if (res?.error) {
        setError('Invalid email or password. Please check your credentials and try again.');
      }
    } catch {
      setError('Something went wrong. Please try again.');
    }
    setIsLoading(false);
  };

  return (
    <div className="mx-auto max-w-md space-y-4">
      <div className="rounded-2xl border border-white/10 bg-zinc-950/40 p-6 backdrop-blur">
        <h1 className="text-xl font-semibold">Welcome back</h1>
        <p className="mt-1 text-sm text-zinc-400">Sign in to access your favorites.</p>

        {/* success banner after signup */}
        {justRegistered && !error && (
          <div className="mt-4 flex items-start gap-2 rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-3 text-sm text-emerald-200">
            <CheckIcon />
            <span>Account created! Sign in with your new credentials.</span>
          </div>
        )}

        {/* server / auth error */}
        {error && (
          <div className="mt-4 flex items-start gap-2 rounded-xl border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-200">
            <svg className="mt-0.5 h-4 w-4 flex-none text-red-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 1 1-16 0 8 8 0 0 1 16 0Zm-8-5a.75.75 0 0 1 .75.75v4.5a.75.75 0 0 1-1.5 0v-4.5A.75.75 0 0 1 10 5Zm0 10a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z" clipRule="evenodd" />
            </svg>
            <span>{error}</span>
          </div>
        )}

        <form className="mt-5 space-y-4" onSubmit={handleSubmit} noValidate>
          {/* ─── EMAIL ─── */}
          <div>
            <label htmlFor="login-email" className="mb-1 block text-xs font-medium text-zinc-300">
              Email
            </label>
            <input
              id="login-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onBlur={() => touch('email')}
              className={`w-full rounded-xl border bg-zinc-950/40 px-3 py-2.5 text-sm text-zinc-100 outline-none transition-colors ${fieldBorder(emailError, touched.email ?? false)}`}
              placeholder="you@example.com"
              autoComplete="email"
              aria-invalid={emailError}
              aria-describedby="login-email-hint"
            />
            {emailError && (
              <p id="login-email-hint" className="mt-1.5 flex items-center gap-1.5 text-xs text-red-400">
                <XIcon /> Please enter a valid email address
              </p>
            )}
            {touched.email && emailValid && (
              <p className="mt-1.5 flex items-center gap-1.5 text-xs text-emerald-400">
                <CheckIcon /> Valid email
              </p>
            )}
          </div>

          {/* ─── PASSWORD ─── */}
          <div>
            <label htmlFor="login-password" className="mb-1 block text-xs font-medium text-zinc-300">
              Password
            </label>
            <input
              id="login-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onBlur={() => touch('password')}
              className={`w-full rounded-xl border bg-zinc-950/40 px-3 py-2.5 text-sm text-zinc-100 outline-none transition-colors ${fieldBorder(passwordError, touched.password ?? false)}`}
              placeholder="Your password"
              autoComplete="current-password"
              aria-invalid={passwordError}
              aria-describedby="login-pw-hint"
            />
            {passwordError && (
              <p id="login-pw-hint" className="mt-1.5 flex items-center gap-1.5 text-xs text-red-400">
                <XIcon /> Password is required
              </p>
            )}
          </div>

          {/* ─── SUBMIT ─── */}
          <button
            type="submit"
            disabled={isLoading}
            className="mt-1 w-full rounded-xl bg-gradient-to-r from-cyan-300 to-fuchsia-300 px-4 py-2.5 text-sm font-semibold text-zinc-950 transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            {isLoading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                </svg>
                Signing in…
              </span>
            ) : (
              'Sign in'
            )}
          </button>
        </form>

        <div className="mt-5 text-sm text-zinc-400">
          Don&apos;t have an account?{' '}
          <Link href="/signup" className="text-cyan-300 hover:underline">
            Create one
          </Link>
        </div>
      </div>
    </div>
  );
}

/* ────────────── page (wrapped in Suspense for useSearchParams) ──── */
export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-md animate-pulse space-y-4 p-6">
          <div className="h-6 w-32 rounded bg-zinc-800" />
          <div className="h-4 w-48 rounded bg-zinc-800" />
        </div>
      }
    >
      <LoginContent />
    </Suspense>
  );
}
