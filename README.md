# 🎬 Movie Explorer

A full-stack movie discovery application built with **Next.js 15**, **Tailwind CSS**, and **Turso (libSQL)**. Features secure authentication, cloud-synced favorites, and a mobile-first design.

## 🔗 Hosted App

**[View Live Demo](https://movie-explorer-eight-ruddy.vercel.app)** 
## 🛠️ Setup & Run Instructions

### Prerequisites
- Node.js 18+ 
- [TMDB API Key](https://www.themoviedb.org/settings/api)
- [Turso Database](https://turso.tech) (free tier available)

### Installation

1. **Clone the repository:**
   ```bash
   git clone <your-repo-url>
   cd movie-explorer
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Environment Variables:**
   Create a `.env.local` file in the root:
   ```env
   # TMDB API
   TMDB_API_KEY=your_tmdb_api_key
   TMDB_ACCESS_TOKEN=your_tmdb_access_token
   TMDB_BASE_URL=https://api.themoviedb.org/3

   # Authentication (generate with: openssl rand -base64 32)
   NEXTAUTH_SECRET=your_secure_random_string
   NEXTAUTH_URL=http://localhost:3000

   # Turso Database
   TURSO_DATABASE_URL=libsql://your-database.turso.io
   TURSO_AUTH_TOKEN=your_turso_auth_token
   ```

4. **Database Setup:**
   Generate the Prisma Client:
   ```bash
   npx prisma generate
   ```
   
   Apply the schema to your Turso database:
   ```bash
   # Generate SQL from Prisma schema
   npx prisma migrate diff --from-empty --to-schema-datamodel prisma/schema.prisma --script > schema.sql
   
   # Apply to Turso (replace 'your-db-name' with your actual database name)
   turso db shell your-db-name < schema.sql
   ```

5. **Run the development server:**
   ```bash
   npm run dev
   ```
   
   Open [http://localhost:3000](http://localhost:3000) in your browser.

### Deployment to Vercel

1. Push your code to GitHub
2. Import the project in Vercel
3. Set the environment variables in Vercel Dashboard
4. Deploy!

**Important:** Ensure you set all environment variables (`TURSO_DATABASE_URL`, `TURSO_AUTH_TOKEN`, `NEXTAUTH_SECRET`, `TMDB_API_KEY`, etc.) in your Vercel project settings.

## 💡 Technical Decisions & Tradeoffs

### 1. **API Proxy Pattern**
- **Decision:** All TMDB API requests are proxied through Next.js Route Handlers (`/api/tmdb/*`)
- **Why:** Keeps the TMDB API key secure on the server and never exposes it to client-side code
- **Tradeoff:** Adds a small latency overhead, but security is paramount

### 2. **State Management**
- **Choice:** Hybrid approach with React Server Components + Client Context
- **Server:** RSC fetch initial data for better performance and SEO
- **Client:** `FavoritesContext` manages interactive favorites with optimistic updates
- **Why:** Combines the best of both worlds—server-side efficiency and client-side interactivity
- **Tradeoff:** Slightly more complex architecture, but worth it for UX

### 3. **Persistence Choice (Turso + Prisma)**
- **Decision:** Migrated from local SQLite to **Turso (libSQL)** with **Prisma ORM**
- **Why:** 
  - Vercel's serverless environment is ephemeral—local files don't persist across deployments
  - Turso provides a low-latency, SQLite-compatible database perfect for edge deployments
  - Prisma offers type-safe database access with excellent DX
- **Adapter:** Uses `@prisma/adapter-libsql` to bridge Prisma with the native libSQL driver
- **Tradeoff:** Requires cloud database setup vs. simple local file, but essential for production

### 4. **Authentication**
- **Choice:** NextAuth v5 with credentials provider and JWT sessions
- **Why:** Industry-standard auth solution with excellent Next.js integration
- **Edge Optimization:** Split auth config into:
  - `auth.config.ts` (lightweight, edge-compatible) for middleware
  - `auth.ts` (full implementation with bcrypt/Prisma) for API routes
- **Result:** Reduced middleware bundle from **1MB → 85KB** to stay within Vercel's free tier limits

### 5. **Styling**
- **Choice:** Tailwind CSS with custom design system
- **Why:** Rapid development, excellent DX, small bundle size when purged
- **Design:** Mobile-first with glassmorphism effects and smooth animations

## ⚠️ Known Limitations & Future Improvements

### Current Limitations
- **Pagination:** Search results limited to first 20 items (TMDB's default page size)
- **Filtering:** No advanced filters for genre, year, or rating
- **Caching:** API responses not cached; could benefit from SWR or React Query
- **Rate Limiting:** Basic implementation; production needs Redis-based solution

### What I'd Improve With More Time

1. **Infinite Scroll / Pagination**
   - Implement `IntersectionObserver` for seamless loading of more results
   - Add "Load More" button as fallback

2. **Advanced Search**
   - Genre, year, rating filters
   - Multi-select capabilities
   - URL-based filter state for deep linking

3. **Enhanced UX**
   - More comprehensive skeleton loaders
   - Toast notifications for all actions
   - Undo functionality for "Remove from favorites"

4. **Performance**
   - Implement request deduplication
   - Add Redis caching layer for TMDB responses
   - Image optimization with blur placeholders

5. **Social Features**
   - Public profile pages
   - Share favorite lists
   - Collaborative lists

6. **Accessibility**
   - Comprehensive ARIA labels
   - Keyboard navigation improvements
   - Screen reader testing

## 📁 Project Structure

```
movie-explorer/
├── app/                      # Next.js App Router
│   ├── api/                  # API routes (TMDB proxy, auth, favorites)
│   ├── favorites/            # Favorites page
│   ├── login/                # Login page
│   └── signup/               # Signup page
├── components/               # React components
├── context/                  # React Context providers
├── lib/                      # Utilities and configurations
│   ├── auth.ts              # NextAuth full config (server-side)
│   ├── auth.config.ts       # NextAuth lightweight config (edge)
│   └── prisma.ts            # Prisma client with Turso adapter
├── prisma/
│   └── schema.prisma        # Database schema
└── middleware.ts            # Edge middleware for route protection
```

## 🧪 Tech Stack

- **Framework:** Next.js 15 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **Database:** Turso (libSQL)
- **ORM:** Prisma 6 with libSQL adapter
- **Authentication:** NextAuth v5
- **Deployment:** Vercel
- **API:** TMDB (The Movie Database)

## 📝 License

MIT

---

Built with ❤️ for movie enthusiasts
