'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import type { TmdbMovieSummary } from '@/types/tmdb';

export default function SearchBar({
  initialValue,
  onSearch,
  isLoading,
}: {
  initialValue: string;
  onSearch: (query: string) => void | Promise<void>;
  isLoading: boolean;
}) {
  const [value, setValue] = useState(initialValue);
  const examples = ['Inception', 'Interstellar', 'The Dark Knight', 'Spirited Away'];

  const [suggestions, setSuggestions] = useState<TmdbMovieSummary[]>([]);
  const [isSuggesting, setIsSuggesting] = useState(false);
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState<number>(-1);
  const abortRef = useRef<AbortController | null>(null);
  const lastRequestedRef = useRef('');

  const trimmed = useMemo(() => value.trim(), [value]);

  useEffect(() => {
    setValue(initialValue);
  }, [initialValue]);

  useEffect(() => {
    const q = trimmed;

    if (abortRef.current) abortRef.current.abort();
    setActiveIndex(-1);

    if (!q || q.length < 2) {
      setSuggestions([]);
      setIsSuggesting(false);
      setOpen(false);
      return;
    }

    const handle = window.setTimeout(async () => {
      const controller = new AbortController();
      abortRef.current = controller;
      lastRequestedRef.current = q;
      setIsSuggesting(true);
      try {
        const res = await fetch(`/api/tmdb/search?query=${encodeURIComponent(q)}`, {
          signal: controller.signal,
          headers: {
            accept: 'application/json',
          },
        });
        if (!res.ok) {
          setSuggestions([]);
          setOpen(false);
          return;
        }
        const data = (await res.json()) as { results?: TmdbMovieSummary[] };
        if (lastRequestedRef.current !== q) return;
        const next = (data.results || []).slice(0, 8);
        setSuggestions(next);
        setOpen(next.length > 0);
      } catch (e) {
        if (controller.signal.aborted) return;
        setSuggestions([]);
        setOpen(false);
      } finally {
        if (!controller.signal.aborted) setIsSuggesting(false);
      }
    }, 250);

    return () => {
      window.clearTimeout(handle);
    };
  }, [trimmed]);

  function submit(nextValue: string) {
    setValue(nextValue);
    setOpen(false);
    setSuggestions([]);
    setActiveIndex(-1);
    onSearch(nextValue);
  }

  return (
    <div className="space-y-3">
      <form
        className="flex flex-col gap-2 sm:flex-row"
        onSubmit={(e) => {
          e.preventDefault();
          submit(value);
        }}
      >
        <div className="group relative w-full">
          <div className="pointer-events-none absolute -inset-[1px] rounded-xl bg-gradient-to-r from-cyan-400/30 via-fuchsia-400/20 to-cyan-400/30 opacity-0 blur transition group-focus-within:opacity-100" />
          <div className="relative rounded-xl border border-white/10 bg-zinc-950/40 p-1 backdrop-blur">
            <input
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder="Search movies by title…"
              className="w-full rounded-lg border border-transparent bg-zinc-950/40 px-3 py-2 text-sm text-zinc-100 outline-none placeholder:text-zinc-500 focus:border-white/10"
              onFocus={() => {
                if (suggestions.length > 0) setOpen(true);
              }}
              onBlur={() => {
                window.setTimeout(() => setOpen(false), 120);
              }}
              onKeyDown={(e) => {
                if (!open || suggestions.length === 0) return;
                if (e.key === 'ArrowDown') {
                  e.preventDefault();
                  setActiveIndex((i) => Math.min(i + 1, suggestions.length - 1));
                } else if (e.key === 'ArrowUp') {
                  e.preventDefault();
                  setActiveIndex((i) => Math.max(i - 1, 0));
                } else if (e.key === 'Enter') {
                  if (activeIndex >= 0 && activeIndex < suggestions.length) {
                    e.preventDefault();
                    submit(suggestions[activeIndex].title);
                  }
                } else if (e.key === 'Escape') {
                  setOpen(false);
                }
              }}
            />

            {open ? (
              <div className="absolute left-1 right-1 top-[calc(100%+6px)] z-20 overflow-hidden rounded-xl border border-white/10 bg-zinc-950/80 shadow-2xl shadow-cyan-500/10 backdrop-blur-xl">
                <div className="flex items-center justify-between border-b border-white/10 px-3 py-2 text-[11px] text-zinc-300">
                  <span>Suggestions</span>
                  <span>{isSuggesting ? 'Fetching…' : '↑↓ to navigate • Enter to select'}</span>
                </div>
                <div className="max-h-72 overflow-auto py-1">
                  {suggestions.map((s, idx) => (
                    <button
                      key={s.id}
                      type="button"
                      onMouseDown={(ev) => ev.preventDefault()}
                      onClick={() => submit(s.title)}
                      className={`flex w-full items-start justify-between gap-3 px-3 py-2 text-left text-sm transition hover:bg-white/5 ${
                        idx === activeIndex ? 'bg-white/5' : ''
                      }`}
                    >
                      <span className="min-w-0 truncate text-zinc-100">{s.title}</span>
                      <span className="shrink-0 text-xs text-zinc-400">{s.release_date?.slice(0, 4) || '—'}</span>
                    </button>
                  ))}
                </div>
              </div>
            ) : null}
          </div>
        </div>
        <button
          type="submit"
          disabled={isLoading}
          className="rounded-xl bg-gradient-to-r from-cyan-300 to-fuchsia-300 px-5 py-2 text-sm font-semibold text-zinc-950 shadow-lg shadow-fuchsia-500/10 disabled:opacity-60"
        >
          {isLoading ? 'Searching…' : 'Search'}
        </button>
      </form>

      <div className="flex flex-wrap gap-2">
        {examples.map((ex) => (
          <button
            key={ex}
            type="button"
            onClick={() => {
              submit(ex);
            }}
            className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-zinc-200 hover:bg-white/10"
          >
            {ex}
          </button>
        ))}
      </div>
    </div>
  );
}
