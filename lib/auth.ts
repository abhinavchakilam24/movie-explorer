import NextAuth from 'next-auth';
import { authConfig } from '@/lib/authConfig';

export const { auth, handlers, signIn, signOut } = NextAuth(authConfig);
