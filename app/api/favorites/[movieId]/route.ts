import { NextResponse } from 'next/server';
import { z } from 'zod';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

const patchSchema = z.object({
  rating: z.number().min(0).max(5).nullable().optional(),
  note: z.string().max(2000).nullable().optional(),
});

export async function PATCH(req: Request, ctx: { params: Promise<{ movieId: string }> }) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { movieId } = await ctx.params;
  const id = Number(movieId);
  if (!Number.isFinite(id) || id <= 0) return NextResponse.json({ error: 'Invalid movieId' }, { status: 400 });

  const body = await req.json().catch(() => null);
  const parsed = patchSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid input', issues: parsed.error.issues }, { status: 400 });
  }

  const existing = await prisma.favorite.findUnique({
    where: { userId_movieId: { userId: session.user.id, movieId: id } },
  });
  if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const fav = await prisma.favorite.update({
    where: { id: existing.id },
    data: {
      rating: parsed.data.rating ?? existing.rating,
      note: parsed.data.note ?? existing.note,
    },
  });

  return NextResponse.json({ favorite: fav });
}

export async function DELETE(_req: Request, ctx: { params: Promise<{ movieId: string }> }) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { movieId } = await ctx.params;
  const id = Number(movieId);
  if (!Number.isFinite(id) || id <= 0) return NextResponse.json({ error: 'Invalid movieId' }, { status: 400 });

  await prisma.favorite.delete({
    where: { userId_movieId: { userId: session.user.id, movieId: id } },
  });

  return NextResponse.json({ ok: true });
}
