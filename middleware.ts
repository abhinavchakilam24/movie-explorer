import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';

export default auth((req) => {
  const pathname = req.nextUrl.pathname;

  if (pathname.startsWith('/favorites')) {
    const isAuthed = Boolean(req.auth);
    if (!isAuthed) {
      const url = req.nextUrl.clone();
      url.pathname = '/login';
      url.searchParams.set('callbackUrl', pathname);
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
});

export const config = {
  matcher: ['/favorites/:path*', '/api/favorites/:path*'],
};
