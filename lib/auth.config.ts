import type { NextAuthConfig } from 'next-auth';

export const authConfig = {
    session: { strategy: 'jwt' },
    pages: {
        signIn: '/login',
    },
    callbacks: {
        authorized({ auth, request: { nextUrl } }) {
            const isLoggedIn = !!auth?.user;
            const isOnFavorites = nextUrl.pathname.startsWith('/favorites');

            if (isOnFavorites) {
                if (isLoggedIn) return true;
                return false; // Redirect unauthenticated users to login page
            }
            return true;
        },
        async jwt({ token, user }) {
            if (user) {
                token.sub = user.id;
                token.email = user.email;
            }
            return token;
        },
        async session({ session, token }) {
            if (token?.sub && session.user) {
                session.user.id = token.sub;
            }
            if (token?.email && session.user) {
                session.user.email = token.email as string;
            }
            return session;
        },
    },
    providers: [], // Providers added in auth.ts
} satisfies NextAuthConfig;
