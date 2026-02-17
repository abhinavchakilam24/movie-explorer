# movie-explorer

A minimal **Next.js App Router** Movie Explorer using **TMDB** (via server-side proxy route handlers) with client-side favorites persisted in LocalStorage.

## Setup

1. Install deps:

```bash
npm install
```

2. Create `.env` (or use `.env.local`) and set:

```bash
TMDB_API_KEY=YOUR_TMDB_KEY
TMDB_BASE_URL=https://api.themoviedb.org/3
```

Notes:
- `TMDB_API_KEY` is **server-only** and is only read by Next.js Route Handlers under `app/api`.
- `TMDB_BASE_URL` is optional; defaults to `https://api.themoviedb.org/3`.

3. Run dev server:

```bash
npm run dev
```

Open http://localhost:3000

## Hosted App

- Hosted link: TODO (add your deployed URL)

## How the TMDB proxy works

The browser calls internal endpoints:
- `GET /api/tmdb/search?query=...`
- `GET /api/tmdb/movie/[id]`

Those route handlers run on the server and call TMDB with the API key stored in `process.env.TMDB_API_KEY`. The key is never shipped to the client.

Search uses `cache: 'no-store'` and `export const dynamic = 'force-dynamic'` to keep results fresh.

## State management & persistence

- Favorites are managed via **React Context + `useReducer`** (`FavoritesContext`).
- Persistence is via **LocalStorage** (`useLocalStorageFavorites`) using a single JSON blob keyed by `movie-explorer:favorites:v1`.
- Favorites include user metadata: rating (1–5) and an optional note.

## Pages / UX

- `/`:
  - Search input
  - Results grid with poster/title/year/short overview
  - Modal details view with runtime (when available)
- `/favorites`:
  - List of favorites
  - Editable rating + note (persisted immediately)

Empty states:
- “Type to search”
- “No results”
- “No favorites yet”

Errors:
- A compact error banner appears for API/network failures.

## Decisions / tradeoffs

- Kept UI minimal (Tailwind only) to prioritize correctness.
- LocalStorage baseline persistence (no DB / auth) for simplicity.
- TMDB calls are proxied via route handlers to avoid exposing secrets.

## Limitations

- No pagination / infinite scroll.
- No debounced search (search runs on submit).
- No optimistic UI for detail fetch.

## Next improvements

- Add pagination and “load more”.
- Add debounced search + request cancellation.
- Add better skeleton loading states.
- Add sorting/filtering and improved accessibility.

## Deploy (Vercel)

- Set `TMDB_API_KEY` in Vercel Project Environment Variables.
- Deploy as a standard Next.js app.
