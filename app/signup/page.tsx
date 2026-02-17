'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, useMemo, useCallback } from 'react';

/* ────────────────────────── password rules ────────────────────────── */
interface Rule {
  label: string;
  test: (pw: string) => boolean;
}

const PASSWORD_RULES: Rule[] = [
  { label: 'At least 10 characters', test: (p) => p.length >= 10 },
  { label: 'One uppercase letter (A-Z)', test: (p) => /[A-Z]/.test(p) },
  { label: 'One lowercase letter (a-z)', test: (p) => /[a-z]/.test(p) },
  { label: 'One number (0-9)', test: (p) => /[0-9]/.test(p) },
  { label: 'One special character (!@#$…)', test: (p) => /[^A-Za-z0-9]/.test(p) },
];

/* ────────────────────────── email regex ─────────────────────────── */
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/* ────────────────────────── tiny helpers ─────────────────────────── */
function fieldBorder(hasError: boolean, touched: boolean) {
  if (!touched) return 'border-white/10 focus:border-white/25';
  return hasError
    ? 'border-red-500/60 focus:border-red-500/80'
    : 'border-emerald-500/50 focus:border-emerald-500/70';
}

function CheckIcon() {
  return (
    <svg className="h-3.5 w-3.5 text-emerald-400" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 8.5l3.5 3.5 6.5-7" />
    </svg>
  );
}
function XIcon() {
  return (
    <svg className="h-3.5 w-3.5 text-red-400" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 4l8 8M12 4l-8 8" />
    </svg>
  );
}
function DotIcon() {
  return <span className="inline-block h-1.5 w-1.5 rounded-full bg-zinc-500" />;
}

/* ────────────────────────── component ────────────────────────────── */
export default function SignupPage() {
  const router = useRouter();

  /* field state */
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  /* track whether user has interacted */
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const touch = useCallback((f: string) => setTouched((t) => ({ ...t, [f]: true })), []);

  /* loading + server error */
  const [isLoading, setIsLoading] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});

  /* ── derived validations ── */
  const emailValid = EMAIL_RE.test(email);
  const emailError = touched.email && !emailValid;

  const ruleResults = useMemo(
    () => PASSWORD_RULES.map((r) => ({ ...r, passed: r.test(password) })),
    [password],
  );
  const allRulesPassed = ruleResults.every((r) => r.passed);
  const passwordTouched = Boolean(touched.password);

  const passwordsMatch = password === confirmPassword && confirmPassword.length > 0;
  const confirmError = touched.confirmPassword && !passwordsMatch;

  /* overall validity (used to disable button) */
  const formValid = emailValid && allRulesPassed && passwordsMatch;

  /* ── password strength meter ── */
  const strengthPct = useMemo(() => {
    const passed = ruleResults.filter((r) => r.passed).length;
    return Math.round((passed / ruleResults.length) * 100);
  }, [ruleResults]);

  const strengthColor =
    strengthPct <= 40
      ? 'bg-red-500'
      : strengthPct <= 80
        ? 'bg-amber-400'
        : 'bg-emerald-400';

  const strengthLabel =
    strengthPct <= 40 ? 'Weak' : strengthPct <= 80 ? 'Fair' : 'Strong';

  /* ── submit ── */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    /* mark everything touched so errors show */
    setTouched({ email: true, password: true, confirmPassword: true });

    if (!formValid) return;

    setIsLoading(true);
    setServerError(null);
    setFieldErrors({});

    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, confirmPassword }),
      });

      if (!res.ok) {
        const data = (await res.json().catch(() => null)) as {
          error?: string;
          issues?: { path: string[]; message: string }[];
        } | null;

        /* map server-side zod issues to per-field errors */
        if (data?.issues?.length) {
          const mapped: Record<string, string[]> = {};
          for (const issue of data.issues) {
            const key = issue.path?.[0] ?? '_';
            mapped[key] = mapped[key] || [];
            mapped[key].push(issue.message);
          }
          setFieldErrors(mapped);
        }

        setServerError(data?.error || 'Something went wrong. Please try again.');
        setIsLoading(false);
        return;
      }

      router.push('/login?registered=1');
    } catch {
      setServerError('Network error — please check your connection.');
      setIsLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-md space-y-4">
      <div className="rounded-2xl border border-white/10 bg-zinc-950/40 p-6 backdrop-blur">
        <h1 className="text-xl font-semibold">Create account</h1>
        <p className="mt-1 text-sm text-zinc-400">
          Fill in the fields below. All requirements must be met.
        </p>

        {/* ── global server error ── */}
        {serverError && (
          <div className="mt-4 flex items-start gap-2 rounded-xl border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-200">
            <svg className="mt-0.5 h-4 w-4 flex-none text-red-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 1 1-16 0 8 8 0 0 1 16 0Zm-8-5a.75.75 0 0 1 .75.75v4.5a.75.75 0 0 1-1.5 0v-4.5A.75.75 0 0 1 10 5Zm0 10a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z" clipRule="evenodd" />
            </svg>
            <span>{serverError}</span>
          </div>
        )}

        <form className="mt-5 space-y-4" onSubmit={handleSubmit} noValidate>
          {/* ─── EMAIL ─── */}
          <div>
            <label htmlFor="signup-email" className="mb-1 block text-xs font-medium text-zinc-300">
              Email
            </label>
            <input
              id="signup-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onBlur={() => touch('email')}
              className={`w-full rounded-xl border bg-zinc-950/40 px-3 py-2.5 text-sm text-zinc-100 outline-none transition-colors ${fieldBorder(emailError, touched.email ?? false)}`}
              placeholder="you@example.com"
              autoComplete="email"
              aria-invalid={emailError}
              aria-describedby="email-hint"
            />
            {emailError && (
              <p id="email-hint" className="mt-1.5 flex items-center gap-1.5 text-xs text-red-400">
                <XIcon /> Please enter a valid email address
              </p>
            )}
            {touched.email && emailValid && (
              <p className="mt-1.5 flex items-center gap-1.5 text-xs text-emerald-400">
                <CheckIcon /> Valid email
              </p>
            )}
            {fieldErrors.email?.map((msg, i) => (
              <p key={i} className="mt-1 flex items-center gap-1.5 text-xs text-red-400">
                <XIcon /> {msg}
              </p>
            ))}
          </div>

          {/* ─── PASSWORD ─── */}
          <div>
            <label htmlFor="signup-password" className="mb-1 block text-xs font-medium text-zinc-300">
              Password
            </label>
            <input
              id="signup-password"
              type="password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (!touched.password) touch('password');
              }}
              onBlur={() => touch('password')}
              className={`w-full rounded-xl border bg-zinc-950/40 px-3 py-2.5 text-sm text-zinc-100 outline-none transition-colors ${fieldBorder(!allRulesPassed, passwordTouched)}`}
              placeholder="Strong password"
              autoComplete="new-password"
              aria-invalid={passwordTouched && !allRulesPassed}
              aria-describedby="pw-rules"
            />

            {/* strength meter */}
            {password.length > 0 && (
              <div className="mt-2">
                <div className="flex items-center justify-between text-[10px] font-medium">
                  <span className="text-zinc-400">Strength</span>
                  <span
                    className={
                      strengthPct <= 40
                        ? 'text-red-400'
                        : strengthPct <= 80
                          ? 'text-amber-400'
                          : 'text-emerald-400'
                    }
                  >
                    {strengthLabel}
                  </span>
                </div>
                <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-zinc-800">
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${strengthColor}`}
                    style={{ width: `${strengthPct}%` }}
                  />
                </div>
              </div>
            )}

            {/* checklist */}
            <ul id="pw-rules" className="mt-2.5 space-y-1">
              {ruleResults.map((r, i) => {
                const show = passwordTouched || password.length > 0;
                return (
                  <li key={i} className="flex items-center gap-2 text-xs">
                    {!show ? (
                      <DotIcon />
                    ) : r.passed ? (
                      <CheckIcon />
                    ) : (
                      <XIcon />
                    )}
                    <span
                      className={
                        !show
                          ? 'text-zinc-500'
                          : r.passed
                            ? 'text-emerald-400'
                            : 'text-red-400'
                      }
                    >
                      {r.label}
                    </span>
                  </li>
                );
              })}
            </ul>
            {fieldErrors.password?.map((msg, i) => (
              <p key={i} className="mt-1 flex items-center gap-1.5 text-xs text-red-400">
                <XIcon /> {msg}
              </p>
            ))}
          </div>

          {/* ─── CONFIRM PASSWORD ─── */}
          <div>
            <label htmlFor="signup-confirm" className="mb-1 block text-xs font-medium text-zinc-300">
              Confirm password
            </label>
            <input
              id="signup-confirm"
              type="password"
              value={confirmPassword}
              onChange={(e) => {
                setConfirmPassword(e.target.value);
                if (!touched.confirmPassword) touch('confirmPassword');
              }}
              onBlur={() => touch('confirmPassword')}
              className={`w-full rounded-xl border bg-zinc-950/40 px-3 py-2.5 text-sm text-zinc-100 outline-none transition-colors ${fieldBorder(confirmError, touched.confirmPassword ?? false)}`}
              placeholder="Re-enter password"
              autoComplete="new-password"
              aria-invalid={confirmError}
              aria-describedby="confirm-hint"
            />
            {confirmError && (
              <p id="confirm-hint" className="mt-1.5 flex items-center gap-1.5 text-xs text-red-400">
                <XIcon /> Passwords do not match
              </p>
            )}
            {touched.confirmPassword && passwordsMatch && (
              <p className="mt-1.5 flex items-center gap-1.5 text-xs text-emerald-400">
                <CheckIcon /> Passwords match
              </p>
            )}
            {fieldErrors.confirmPassword?.map((msg, i) => (
              <p key={i} className="mt-1 flex items-center gap-1.5 text-xs text-red-400">
                <XIcon /> {msg}
              </p>
            ))}
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
                Creating account…
              </span>
            ) : (
              'Create account'
            )}
          </button>
        </form>

        <div className="mt-5 text-sm text-zinc-400">
          Already have an account?{' '}
          <Link href="/login" className="text-cyan-300 hover:underline">
            Sign in
          </Link>
        </div>
      </div>
    </div>
  );
}
