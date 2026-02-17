import { NextResponse } from 'next/server';
import { z } from 'zod';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

const createSchema = z.object({
  movieId: z.number().int().positive(),
  title: z.string().min(1),
  posterPath: z.string().nullable().optional(),
  releaseDate: z.string().nullable().optional(),
  overview: z.string().nullable().optional(),
});

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const items = await prisma.favorite.findMany({
    where: { userId: session.user.id },
    orderBy: { updatedAt: 'desc' },
  });

  return NextResponse.json({ favorites: items });
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json().catch(() => null);
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid input', issues: parsed.error.issues }, { status: 400 });
  }

  const fav = await prisma.favorite.upsert({
    where: { userId_movieId: { userId: session.user.id, movieId: parsed.data.movieId } },
    update: {
      title: parsed.data.title,
      posterPath: parsed.data.posterPath ?? null,
      releaseDate: parsed.data.releaseDate ?? null,
      overview: parsed.data.overview ?? null,
    },
    create: {
      userId: session.user.id,
      movieId: parsed.data.movieId,
      title: parsed.data.title,
      posterPath: parsed.data.posterPath ?? null,
      releaseDate: parsed.data.releaseDate ?? null,
      overview: parsed.data.overview ?? null,
      rating: null,
      note: null,
    },
  });

  return NextResponse.json({ favorite: fav }, { status: 201 });
}
