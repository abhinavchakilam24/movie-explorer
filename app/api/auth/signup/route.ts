import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';

const WEAK_PASSWORDS = ['password', '12345678', 'qwerty', 'letmein'];

const signupSchema = z
  .object({
    email: z.string().email(),
    password: z.string().min(10),
    confirmPassword: z.string().min(1),
  })
  .superRefine((val, ctx) => {
    const p = val.password;

    if (val.password !== val.confirmPassword) {
      ctx.addIssue({ code: 'custom', message: 'Passwords do not match', path: ['confirmPassword'] });
    }

    if (!/[a-z]/.test(p)) ctx.addIssue({ code: 'custom', message: 'Must include a lowercase letter', path: ['password'] });
    if (!/[A-Z]/.test(p)) ctx.addIssue({ code: 'custom', message: 'Must include an uppercase letter', path: ['password'] });
    if (!/[0-9]/.test(p)) ctx.addIssue({ code: 'custom', message: 'Must include a number', path: ['password'] });
    if (!/[^A-Za-z0-9]/.test(p))
      ctx.addIssue({ code: 'custom', message: 'Must include a special character', path: ['password'] });

    const lower = p.toLowerCase();
    if (WEAK_PASSWORDS.includes(lower))
      ctx.addIssue({ code: 'custom', message: 'Password is too common', path: ['password'] });
  });

type Bucket = { hits: number[] };
const buckets: Map<string, Bucket> = new Map();

function checkRateLimit(ip: string, limit: number, windowMs: number) {
  const now = Date.now();
  const b = buckets.get(ip) ?? { hits: [] };
  b.hits = b.hits.filter((t) => now - t < windowMs);
  if (b.hits.length >= limit) return false;
  b.hits.push(now);
  buckets.set(ip, b);
  return true;
}

function getClientIp(req: Request) {
  const xff = req.headers.get('x-forwarded-for');
  if (xff) return xff.split(',')[0].trim();
  return req.headers.get('x-real-ip') ?? 'unknown';
}

export async function POST(req: Request) {
  const ip = getClientIp(req);
  if (!checkRateLimit(ip, 10, 60_000)) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
  }

  try {
    const body = await req.json().catch(() => null);
    const parsed = signupSchema.safeParse(body);
    if (!parsed.success) {
      const issues = parsed.error.issues;
      /* build a human-readable summary from the first issue */
      const firstMsg = issues[0]?.message ?? 'Invalid input';
      return NextResponse.json(
        { error: firstMsg, issues },
        { status: 400 },
      );
    }

    const email = parsed.data.email.toLowerCase();

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json(
        {
          error: 'An account with this email already exists. Try signing in instead.',
          issues: [{ path: ['email'], message: 'Email is already registered' }],
        },
        { status: 409 },
      );
    }

    const passwordHash = await bcrypt.hash(parsed.data.password, 12);

    await prisma.user.create({
      data: {
        email,
        passwordHash,
      },
    });

    return NextResponse.json({ ok: true }, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: 'Something went wrong on our end. Please try again later.' },
      { status: 500 },
    );
  }
}
